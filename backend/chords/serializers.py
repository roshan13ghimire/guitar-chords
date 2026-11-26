
from rest_framework import serializers

from .models import Chord


class ChordSerializer(serializers.ModelSerializer):

    category_display = serializers.CharField(
        source="get_category_display",
        read_only=True,
    )

    class Meta:
        model = Chord

        fields = [
            "id",
            "name",
            "slug",
            "category",
            "category_display",
            "frets",
            "fingers",
            "base_fret",
            "description",
        ]
