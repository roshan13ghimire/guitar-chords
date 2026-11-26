
from django.contrib import admin
from django.db.models import Count

from .models import Artist, Song, SongChord


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "song_count",
        "created_at",
    )

    search_fields = ("name",)

    prepopulated_fields = {
        "slug": ("name",),
    }

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)

        return queryset.annotate(
            total_songs=Count("songs")
        )

    @admin.display(
        description="Songs",
        ordering="total_songs",
    )
    def song_count(self, obj):
        return obj.total_songs


class SongChordInline(admin.TabularInline):

    model = SongChord

    extra = 0

    autocomplete_fields = ("chord",)


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "artist",
        "language",
        "musical_key",
        "capo",
        "difficulty",
        "rights_status",
        "is_published",
    )

    list_filter = (
        "language",
        "difficulty",
        "is_published",
        "rights_status",
    )

    search_fields = (
        "title",
        "alternate_title",
        "artist__name",
    )

    prepopulated_fields = {
        "slug": ("title",),
    }

    autocomplete_fields = ("artist",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_select_related = ("artist",)

    list_per_page = 25

    inlines = [SongChordInline]

    ordering = ("title",)

    fieldsets = (
        (
            "Song Information",
            {
                "fields": (
                    "title",
                    "alternate_title",
                    "slug",
                    "artist",
                    "language",
                ),
            },
        ),
        (
            "Guitar Settings",
            {
                "fields": (
                    "musical_key",
                    "capo",
                    "tuning",
                    "difficulty",
                    "strumming_pattern",
                ),
            },
        ),
        (
            "Lyrics and Chords",
            {
                "fields": (
                    "chordpro_content",
                ),
            },
        ),
        (
            "Source and Publication",
            {
                "fields": (
                    "source_url",
                    "rights_status",
                    "rights_notes",
                    "is_published",
                ),
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
            },
        ),
    )
