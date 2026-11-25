
from django.contrib import admin
from django.utils import timezone

from .forms import ChordArrangementAdminForm
from .models import (
    Artist,
    Song,
    ChordArrangement,
    CommunitySubmission,
)


class ChordPreviewMedia:
    class Media:
        css = {
            "all": ("songs/admin_chord_preview.css",)
        }

        js = ("songs/admin_chord_preview.js",)


@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "created_at",
    )
    search_fields = ("name",)
    ordering = ("name",)


class ChordArrangementInline(admin.StackedInline):
    model = ChordArrangement
    form = ChordArrangementAdminForm

    extra = 0
    show_change_link = True
    classes = ("collapse",)

    readonly_fields = (
        "is_verified",
        "publication_status",
    )

    fields = (
        "title",
        "original_key",
        "capo",
        "difficulty",
        "strumming_pattern",
        "chord_content",
        "arranged_by",
        "source_url",
        "source_notes",
        "review_notes",
        "rights_basis",
        "is_verified",
        "publication_status",
    )


@admin.register(Song)
class SongAdmin(ChordPreviewMedia, admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "alternate_title",
        "artist",
        "language",
        "genre",
        "created_at",
    )

    list_filter = (
        "language",
        "genre",
    )

    search_fields = (
        "title",
        "alternate_title",
        "artist__name",
    )

    autocomplete_fields = ("artist",)
    list_select_related = ("artist",)
    ordering = ("title",)
    inlines = [ChordArrangementInline]

    fieldsets = (
        (
            "Song Information",
            {
                "fields": (
                    "title",
                    "alternate_title",
                    "artist",
                    "language",
                    "genre",
                )
            },
        ),
        (
            "Official Music",
            {
                "fields": ("official_url",)
            },
        ),
    )


@admin.register(ChordArrangement)
class ChordArrangementAdmin(
    ChordPreviewMedia,
    admin.ModelAdmin,
):
    form = ChordArrangementAdminForm

    list_display = (
        "id",
        "song",
        "title",
        "difficulty",
        "is_verified",
        "publication_status",
        "rights_basis",
        "review_checklist",
        "updated_at",
    )

    list_filter = (
        "publication_status",
        "rights_basis",
        "difficulty",
        "is_verified",
        "song__language",
    )

    search_fields = (
        "song__title",
        "song__alternate_title",
        "song__artist__name",
        "title",
        "arranged_by",
    )

    autocomplete_fields = ("song",)

    list_select_related = (
        "song",
        "song__artist",
    )

    ordering = ("-updated_at",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Song Information",
            {
                "fields": (
                    "song",
                    "title",
                    "difficulty",
                )
            },
        ),
        (
            "Guitar Settings",
            {
                "fields": (
                    "original_key",
                    "capo",
                    "strumming_pattern",
                )
            },
        ),
        (
            "Chord Content",
            {
                "fields": ("chord_content",)
            },
        ),
        (
            "Attribution and Source",
            {
                "fields": (
                    "arranged_by",
                    "source_url",
                    "source_notes",
                )
            },
        ),
        (
            "Internal Review Notes",
            {
                "fields": ("review_notes",)
            },
        ),
        (
            "Verification and Publication",
            {
                "fields": (
                    "rights_basis",
                    "is_verified",
                    "publication_status",
                )
            },
        ),
        (
            "Record Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    @admin.display(description="Review checklist")
    def review_checklist(self, obj):
        issues = []

        if not obj.is_verified:
            issues.append("Chord accuracy")

        if obj.rights_basis == ChordArrangement.RightsBasis.UNKNOWN:
            issues.append("Rights review")

        if not (obj.source_notes or "").strip():
            issues.append("Source documentation")

        if not (obj.chord_content or "").strip():
            issues.append("Chord content")

        if issues:
            return "Needs: " + ", ".join(issues)

        if (
            obj.publication_status
            == ChordArrangement.PublicationStatus.PUBLISHED
        ):
            return "Published"

        return "Checks recorded - awaiting final review"

    @admin.action(
        description="Move selected arrangements to In Review"
    )
    def send_to_review(self, request, queryset):
        updated = queryset.update(
            publication_status=(
                ChordArrangement.PublicationStatus.REVIEW
            ),
            is_verified=False,
            updated_at=timezone.now(),
        )

        self.message_user(
            request,
            f"{updated} arrangement(s) moved to In Review.",
        )

    @admin.action(
        description="Return selected arrangements to Draft"
    )
    def return_to_draft(self, request, queryset):
        updated = queryset.update(
            publication_status=(
                ChordArrangement.PublicationStatus.DRAFT
            ),
            is_verified=False,
            updated_at=timezone.now(),
        )

        self.message_user(
            request,
            f"{updated} arrangement(s) returned to Draft.",
        )

    actions = [
        "send_to_review",
        "return_to_draft",
    ]


@admin.register(CommunitySubmission)
class CommunitySubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "kind",
        "submission_subject",
        "status",
        "created_at",
    )

    list_filter = (
        "kind",
        "status",
        "language",
        "created_at",
    )

    search_fields = (
        "song_title",
        "artist_name",
        "details",
        "contributor_name",
        "arrangement__song__title",
    )

    list_select_related = (
        "arrangement",
        "arrangement__song",
    )

    ordering = ("-created_at",)

    # Visitors cannot edit existing song data through
    # this interface. Moderators only manage the queue.
    readonly_fields = (
        "kind",
        "song_title",
        "artist_name",
        "language",
        "arrangement",
        "details",
        "reference_url",
        "contributor_name",
        "created_at",
    )

    fields = (
        "kind",
        "song_title",
        "artist_name",
        "language",
        "arrangement",
        "details",
        "reference_url",
        "contributor_name",
        "status",
        "moderator_notes",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    @admin.display(description="Song / Arrangement")
    def submission_subject(self, obj):
        if obj.kind == CommunitySubmission.Kind.SONG:
            return f"{obj.song_title} - {obj.artist_name}"

        if obj.arrangement_id:
            return str(obj.arrangement)

        return "Chord correction"
