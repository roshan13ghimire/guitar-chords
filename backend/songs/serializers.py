
from rest_framework import serializers

from .models import (
    Artist,
    Song,
    ChordArrangement,
    CommunitySubmission,
)


class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = [
            "id",
            "name",
            "bio",
        ]


class ArtistDirectorySerializer(serializers.ModelSerializer):
    published_song_count = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = Artist
        fields = [
            "id",
            "name",
            "bio",
            "published_song_count",
        ]


class ChordArrangementSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = ChordArrangement
        fields = [
            "id",
            "title",
            "original_key",
            "capo",
            "difficulty",
            "strumming_pattern",
            "chord_content",
            "arranged_by",
            "source_url",
        ]


class SongListSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    difficulties = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = [
            "id",
            "title",
            "alternate_title",
            "artist",
            "language",
            "genre",
            "difficulties",
        ]

    def get_difficulties(self, obj):
        arrangements = getattr(
            obj,
            "published_list_arrangements",
            [],
        )

        order = [
            "beginner",
            "intermediate",
            "advanced",
        ]

        available = {
            arrangement.difficulty
            for arrangement in arrangements
        }

        return [
            difficulty
            for difficulty in order
            if difficulty in available
        ]


class SongDetailSerializer(serializers.ModelSerializer):
    artist = ArtistSerializer(read_only=True)

    arrangements = ChordArrangementSerializer(
        source="published_arrangements",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Song
        fields = [
            "id",
            "title",
            "alternate_title",
            "artist",
            "language",
            "genre",
            "official_url",
            "arrangements",
        ]


class ArtistDetailSerializer(serializers.ModelSerializer):
    published_song_count = serializers.IntegerField(
        read_only=True
    )

    songs = SongListSerializer(
        source="public_songs",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Artist
        fields = [
            "id",
            "name",
            "bio",
            "published_song_count",
            "songs",
        ]


class CommunitySubmissionCreateSerializer(
    serializers.ModelSerializer
):
    arrangement_id = serializers.PrimaryKeyRelatedField(
        source="arrangement",
        queryset=ChordArrangement.objects.none(),
        required=False,
    )

    class Meta:
        model = CommunitySubmission
        fields = [
            "kind",
            "song_title",
            "artist_name",
            "language",
            "arrangement_id",
            "details",
            "reference_url",
            "contributor_name",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["arrangement_id"].queryset = (
            ChordArrangement.objects.filter(
                publication_status=(
                    ChordArrangement
                    .PublicationStatus.PUBLISHED
                ),
                is_verified=True,
                rights_basis__in=[
                    ChordArrangement.RightsBasis.ORIGINAL,
                    ChordArrangement.RightsBasis.PERMISSION,
                    ChordArrangement.RightsBasis.LICENSED,
                    ChordArrangement.RightsBasis.PUBLIC_DOMAIN,
                ],
            )
        )

    def validate(self, attrs):
        kind = attrs.get("kind")

        details = (
            attrs.get("details") or ""
        ).strip()

        if len(details) < 12:
            raise serializers.ValidationError({
                "details": (
                    "Please provide at least 12 characters "
                    "explaining your suggestion."
                )
            })

        attrs["details"] = details

        if kind == CommunitySubmission.Kind.SONG:
            if not (
                attrs.get("song_title") or ""
            ).strip():
                raise serializers.ValidationError({
                    "song_title": "Song title is required."
                })

            if not (
                attrs.get("artist_name") or ""
            ).strip():
                raise serializers.ValidationError({
                    "artist_name": "Artist name is required."
                })

            if attrs.get("arrangement") is not None:
                raise serializers.ValidationError({
                    "arrangement_id": (
                        "Do not choose an arrangement "
                        "for a song suggestion."
                    )
                })

        elif kind == CommunitySubmission.Kind.CORRECTION:
            if attrs.get("arrangement") is None:
                raise serializers.ValidationError({
                    "arrangement_id": (
                        "Choose a published arrangement."
                    )
                })

        return attrs
