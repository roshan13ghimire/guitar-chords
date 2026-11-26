
from rest_framework import serializers

from chords.serializers import ChordSerializer

from .models import Artist, Song


class ArtistSerializer(serializers.ModelSerializer):

    class Meta:
        model = Artist

        fields = [
            "id",
            "name",
            "slug",
        ]


class SongListSerializer(serializers.ModelSerializer):

    artist = ArtistSerializer(read_only=True)

    language_display = serializers.CharField(
        source="get_language_display",
        read_only=True,
    )

    difficulty_display = serializers.CharField(
        source="get_difficulty_display",
        read_only=True,
    )

    class Meta:
        model = Song

        fields = [
            "id",
            "title",
            "slug",
            "alternate_title",
            "artist",
            "language",
            "language_display",
            "musical_key",
            "capo",
            "difficulty",
            "difficulty_display",
        ]


class SongDetailSerializer(SongListSerializer):

    chords = ChordSerializer(
        many=True,
        read_only=True,
    )

    class Meta(SongListSerializer.Meta):

        fields = SongListSerializer.Meta.fields + [
            "tuning",
            "strumming_pattern",
            "chordpro_content",
            "chords",
            "source_url",
            "rights_status",
            "updated_at",
        ]
