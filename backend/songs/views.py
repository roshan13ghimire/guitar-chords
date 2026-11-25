
from django.core.exceptions import RequestDataTooBig
from django.db.models import (
    Count,
    Exists,
    OuterRef,
    Prefetch,
    Q,
)

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.exceptions import ValidationError
from rest_framework.generics import (
    CreateAPIView,
    ListAPIView,
    RetrieveAPIView,
)
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from .models import (
    Artist,
    Song,
    ChordArrangement,
    CommunitySubmission,
)

from .serializers import (
    ArtistDirectorySerializer,
    ArtistDetailSerializer,
    SongListSerializer,
    SongDetailSerializer,
    CommunitySubmissionCreateSerializer,
)


PUBLIC_RIGHTS_BASES = [
    ChordArrangement.RightsBasis.ORIGINAL,
    ChordArrangement.RightsBasis.PERMISSION,
    ChordArrangement.RightsBasis.LICENSED,
    ChordArrangement.RightsBasis.PUBLIC_DOMAIN,
]

SORT_OPTIONS = {
    "title": ("title", "id"),
    "title_desc": ("-title", "-id"),
    "newest": ("-created_at", "-id"),
    "oldest": ("created_at", "id"),
}

VALID_LANGUAGES = {"ne", "hi", "en"}

VALID_DIFFICULTIES = {
    "beginner",
    "intermediate",
    "advanced",
}

MAX_SUBMISSION_BYTES = 16 * 1024


def published_arrangements():
    return ChordArrangement.objects.filter(
        publication_status=(
            ChordArrangement.PublicationStatus.PUBLISHED
        ),
        is_verified=True,
        rights_basis__in=PUBLIC_RIGHTS_BASES,
    )


def public_songs():
    available = published_arrangements().filter(
        song_id=OuterRef("pk")
    )

    return (
        Song.objects.filter(Exists(available))
        .select_related("artist")
    )


def public_artists():
    return (
        Artist.objects.annotate(
            published_song_count=Count(
                "songs",
                filter=Q(
                    songs__arrangements__publication_status=(
                        ChordArrangement
                        .PublicationStatus.PUBLISHED
                    ),
                    songs__arrangements__is_verified=True,
                    songs__arrangements__rights_basis__in=(
                        PUBLIC_RIGHTS_BASES
                    ),
                ),
                distinct=True,
            )
        )
        .filter(published_song_count__gt=0)
    )


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        "status": "ok",
        "service": "Guitar Chords API",
        "message": "Backend is running successfully",
    })


class PublicReadOnlyMixin:
    authentication_classes = []
    permission_classes = [AllowAny]


class ArtistListAPIView(
    PublicReadOnlyMixin,
    ListAPIView,
):
    serializer_class = ArtistDirectorySerializer

    def get_queryset(self):
        return public_artists().order_by(
            "name",
            "id",
        )


class ArtistDetailAPIView(
    PublicReadOnlyMixin,
    RetrieveAPIView,
):
    serializer_class = ArtistDetailSerializer

    def get_queryset(self):
        published_song_list = (
            public_songs()
            .prefetch_related(
                Prefetch(
                    "arrangements",
                    queryset=(
                        published_arrangements()
                        .only(
                            "id",
                            "song_id",
                            "difficulty",
                        )
                    ),
                    to_attr="published_list_arrangements",
                )
            )
            .order_by("title", "id")
        )

        return public_artists().prefetch_related(
            Prefetch(
                "songs",
                queryset=published_song_list,
                to_attr="public_songs",
            )
        )


class SongListAPIView(
    PublicReadOnlyMixin,
    ListAPIView,
):
    serializer_class = SongListSerializer

    def get_queryset(self):
        params = self.request.query_params

        language = params.get(
            "language", ""
        ).strip()

        artist = params.get(
            "artist", ""
        ).strip()

        difficulty = params.get(
            "difficulty", ""
        ).strip()

        search = params.get(
            "search", ""
        ).strip()

        sort = params.get(
            "sort", "title"
        ).strip()

        if language and language not in VALID_LANGUAGES:
            raise ValidationError({
                "language": "Invalid language."
            })

        if difficulty and difficulty not in VALID_DIFFICULTIES:
            raise ValidationError({
                "difficulty": "Invalid difficulty."
            })

        if sort not in SORT_OPTIONS:
            raise ValidationError({
                "sort": "Invalid sorting option."
            })

        if artist and (
            not artist.isascii()
            or not artist.isdigit()
            or len(artist) > 15
            or int(artist) < 1
        ):
            raise ValidationError({
                "artist": "Enter a valid artist ID."
            })

        if len(search) > 100:
            raise ValidationError({
                "search": (
                    "Search must be 100 characters or less."
                )
            })

        queryset = public_songs()

        if language:
            queryset = queryset.filter(
                language=language
            )

        if artist:
            queryset = queryset.filter(
                artist_id=int(artist)
            )

        if difficulty:
            matching_arrangements = (
                published_arrangements().filter(
                    song_id=OuterRef("pk"),
                    difficulty=difficulty,
                )
            )

            queryset = queryset.filter(
                Exists(matching_arrangements)
            )

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(alternate_title__icontains=search)
                | Q(artist__name__icontains=search)
            )

        queryset = queryset.prefetch_related(
            Prefetch(
                "arrangements",
                queryset=(
                    published_arrangements()
                    .only(
                        "id",
                        "song_id",
                        "difficulty",
                    )
                ),
                to_attr="published_list_arrangements",
            )
        )

        return queryset.order_by(
            *SORT_OPTIONS[sort]
        )


class SongDetailAPIView(
    PublicReadOnlyMixin,
    RetrieveAPIView,
):
    serializer_class = SongDetailSerializer

    def get_queryset(self):
        return public_songs().prefetch_related(
            Prefetch(
                "arrangements",
                queryset=published_arrangements(),
                to_attr="published_arrangements",
            )
        )


class CommunitySubmissionThrottle(AnonRateThrottle):
    scope = "community_submissions"

    def get_rate(self):
        return "5/hour"


class CommunitySubmissionCreateAPIView(CreateAPIView):
    queryset = CommunitySubmission.objects.all()

    serializer_class = CommunitySubmissionCreateSerializer

    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]
    throttle_classes = [CommunitySubmissionThrottle]

    def create(self, request, *args, **kwargs):
        # Check declared length before reading the body.
        declared_length = request.META.get(
            "CONTENT_LENGTH", ""
        )

        if (
            str(declared_length).isdigit()
            and int(declared_length) > MAX_SUBMISSION_BYTES
        ):
            return Response(
                {
                    "detail": (
                        "Submission exceeds the allowed size."
                    )
                },
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        # Also verify the actual received body in case
        # Content-Length is absent or unreliable.
        try:
            body = request.body
        except RequestDataTooBig:
            return Response(
                {
                    "detail": (
                        "Submission exceeds the allowed size."
                    )
                },
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        if len(body) > MAX_SUBMISSION_BYTES:
            return Response(
                {
                    "detail": (
                        "Submission exceeds the allowed size."
                    )
                },
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )

        payload = request.data

        if not isinstance(payload, dict):
            raise ValidationError({
                "detail": "Expected a JSON object."
            })

        # Honeypot: legitimate users leave this hidden
        # field empty. Return a generic success response
        # without inserting a database record.
        if payload.get("company_website"):
            return Response(
                {
                    "message": (
                        "Your submission was received "
                        "and is awaiting review."
                    )
                },
                status=status.HTTP_201_CREATED,
            )

        serializer = self.get_serializer(
            data=payload
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "message": (
                    "Your submission was received "
                    "and is awaiting review."
                )
            },
            status=status.HTTP_201_CREATED,
        )
