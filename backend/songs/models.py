
from django.core.exceptions import (
    NON_FIELD_ERRORS,
    ValidationError,
)
from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models


class Artist(models.Model):
    name = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Song(models.Model):
    LANGUAGE_CHOICES = [
        ("ne", "Nepali"),
        ("hi", "Hindi"),
        ("en", "English"),
    ]

    title = models.CharField(max_length=255)

    alternate_title = models.CharField(
        max_length=255,
        blank=True,
        help_text="Optional Romanized or alternate spelling.",
    )

    artist = models.ForeignKey(
        Artist,
        on_delete=models.PROTECT,
        related_name="songs",
    )

    language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        default="ne",
    )

    genre = models.CharField(max_length=100, blank=True)

    official_url = models.URLField(
        max_length=500,
        blank=True,
        help_text="Optional official music or video URL.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} - {self.artist.name}"


class ChordArrangement(models.Model):
    class Difficulty(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    class PublicationStatus(models.TextChoices):
        DRAFT = "draft", "Draft"
        REVIEW = "review", "In Review"
        PUBLISHED = "published", "Published"

    class RightsBasis(models.TextChoices):
        UNKNOWN = "unknown", "Not Reviewed"
        ORIGINAL = "original", "Entire sheet is original content"
        PERMISSION = "permission", "Permission obtained"
        LICENSED = "licensed", "Licensed for publication"
        PUBLIC_DOMAIN = "public_domain", "Public domain verified"

    REVIEW_SENSITIVE_FIELDS = (
        "original_key",
        "capo",
        "difficulty",
        "strumming_pattern",
        "chord_content",
    )

    song = models.ForeignKey(
        Song,
        on_delete=models.CASCADE,
        related_name="arrangements",
    )

    title = models.CharField(
        max_length=100,
        default="Standard",
    )

    original_key = models.CharField(max_length=10)

    capo = models.PositiveSmallIntegerField(
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(12),
        ],
    )

    difficulty = models.CharField(
        max_length=20,
        choices=Difficulty.choices,
        default=Difficulty.BEGINNER,
    )

    strumming_pattern = models.CharField(
        max_length=100,
        blank=True,
    )

    chord_content = models.TextField(
        help_text="Inline chord notation, e.g. [G]text [D]text",
    )

    arranged_by = models.CharField(
        max_length=150,
        blank=True,
    )

    source_url = models.URLField(
        max_length=500,
        blank=True,
    )

    source_notes = models.TextField(
        blank=True,
        help_text="Document the source and publishing rights.",
    )

    review_notes = models.TextField(
        blank=True,
        help_text="Internal review notes. Not public.",
    )

    rights_basis = models.CharField(
        max_length=20,
        choices=RightsBasis.choices,
        default=RightsBasis.UNKNOWN,
    )

    publication_status = models.CharField(
        max_length=12,
        choices=PublicationStatus.choices,
        default=PublicationStatus.DRAFT,
    )

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["song", "title"]
        constraints = [
            models.UniqueConstraint(
                fields=["song", "title"],
                name="unique_song_arrangement_title",
            )
        ]

    def clean(self):
        super().clean()
        errors = {}

        if self.pk and self.is_verified:
            previous = (
                type(self)
                .objects.filter(pk=self.pk)
                .values(*self.REVIEW_SENSITIVE_FIELDS)
                .first()
            )

            if previous:
                changed_fields = [
                    field
                    for field in self.REVIEW_SENSITIVE_FIELDS
                    if getattr(self, field) != previous[field]
                ]

                if changed_fields:
                    errors[NON_FIELD_ERRORS] = (
                        "This verified arrangement contains "
                        "musical changes. Move it to Draft or "
                        "In Review, uncheck Is verified, and "
                        "save before editing those fields."
                    )

        if self.publication_status == self.PublicationStatus.PUBLISHED:
            if not self.is_verified:
                errors["is_verified"] = (
                    "Verify musical accuracy before publishing."
                )

            if self.rights_basis == self.RightsBasis.UNKNOWN:
                errors["rights_basis"] = (
                    "Review the rights to publish this sheet."
                )

            if not (self.source_notes or "").strip():
                errors["source_notes"] = (
                    "Document the source and publishing rights."
                )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.song.title} - {self.title}"


class CommunitySubmission(models.Model):
    class Kind(models.TextChoices):
        SONG = "song", "Suggest a Song"
        CORRECTION = "correction", "Report a Chord Error"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        REVIEWED = "reviewed", "Reviewed"
        CLOSED = "closed", "Closed"

    kind = models.CharField(
        max_length=12,
        choices=Kind.choices,
    )

    song_title = models.CharField(
        max_length=255,
        blank=True,
    )

    artist_name = models.CharField(
        max_length=200,
        blank=True,
    )

    language = models.CharField(
        max_length=2,
        choices=Song.LANGUAGE_CHOICES,
        default="ne",
    )

    arrangement = models.ForeignKey(
        ChordArrangement,
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="community_submissions",
    )

    details = models.TextField(
        max_length=2000,
        help_text="Details of the song suggestion or correction.",
    )

    reference_url = models.URLField(
        max_length=500,
        blank=True,
    )

    contributor_name = models.CharField(
        max_length=100,
        blank=True,
    )

    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.PENDING,
    )

    moderator_notes = models.TextField(
        blank=True,
        help_text="Private moderation notes.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def clean(self):
        super().clean()
        errors = {}

        if self.kind == self.Kind.SONG:
            if not self.song_title.strip():
                errors["song_title"] = "Song title is required."

            if not self.artist_name.strip():
                errors["artist_name"] = "Artist name is required."

            if self.arrangement_id:
                errors["arrangement"] = (
                    "Song suggestions cannot select an arrangement."
                )

        elif self.kind == self.Kind.CORRECTION:
            if not self.arrangement_id:
                errors["arrangement"] = (
                    "Select an arrangement to correct."
                )

        if len((self.details or "").strip()) < 12:
            errors["details"] = (
                "Please provide at least 12 characters."
            )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        if self.kind == self.Kind.SONG:
            return f"Suggestion: {self.song_title}"

        if self.arrangement_id:
            return f"Correction: {self.arrangement}"

        return "Chord correction"
