
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .filters import SongFilter
from .models import Artist, Song
from .serializers import (
    ArtistSerializer,
    SongDetailSerializer,
    SongListSerializer,
)
from django.conf import settings
from django.db.models import Q


class SongViewSet(viewsets.ReadOnlyModelViewSet):

    permission_classes = [AllowAny]

    lookup_field = "slug"

    lookup_value_regex = r"[^/.]+"

    serializer_class = SongListSerializer

    filterset_class = SongFilter

    search_fields = [
        "title",
        "alternate_title",
        "artist__name",
    ]

    ordering_fields = [
        "title",
        "created_at",
        "updated_at",
    ]

    ordering = ["title", "id"]

    def get_queryset(self):
        visibility = Q(
            is_published=True,
            rights_status__in=[
                "original",
                "public_domain",
                "licensed",
            ],
    )

        if settings.DEBUG and settings.ALLOW_LOCAL_PRIVATE_SONGS:
            visibility |= Q(
                rights_status="private",
                is_published=False,
            )

        queryset = Song.objects.filter(
            visibility
        ).select_related("artist")

        if self.action == "retrieve":
            queryset = queryset.prefetch_related("chords")

        return queryset

    def get_serializer_class(self):

        if self.action == "retrieve":
            return SongDetailSerializer

        return SongListSerializer


class ArtistViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = ArtistSerializer

    permission_classes = [AllowAny]

    lookup_field = "slug"

    lookup_value_regex = r"[^/.]+"

    search_fields = ["name"]

    ordering_fields = ["name"]

    ordering = ["name", "id"]

    def get_queryset(self):

        return Artist.objects.filter(
            songs__is_published=True,
            songs__rights_status__in=[
                Song.RightsStatus.ORIGINAL,
                Song.RightsStatus.PUBLIC_DOMAIN,
                Song.RightsStatus.LICENSED,
            ],
        ).distinct()
