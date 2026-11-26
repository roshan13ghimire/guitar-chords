
from django.contrib import admin

from .models import Chord


@admin.register(Chord)
class ChordAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "category",
        "base_fret",
        "updated_at",
    )

    list_filter = ("category",)

    search_fields = (
        "name",
        "description",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("name",)

    list_per_page = 25

    fieldsets = (
        (
            "Chord Information",
            {
                "fields": (
                    "name",
                    "slug",
                    "category",
                    "description",
                ),
            },
        ),
        (
            "Guitar Fingering",
            {
                "fields": (
                    "frets",
                    "fingers",
                    "base_fret",
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
