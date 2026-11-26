
import django_filters

from .models import Song


class SongFilter(django_filters.FilterSet):

    artist = django_filters.CharFilter(
        field_name="artist__slug",
        lookup_expr="exact",
    )

    musical_key = django_filters.CharFilter(
        lookup_expr="iexact",
    )

    class Meta:
        model = Song

        fields = [
            "language",
            "difficulty",
            "musical_key",
            "capo",
            "artist",
        ]
