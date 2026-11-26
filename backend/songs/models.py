
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator
from django.db import models


class Artist(models.Model):

    name = models.CharField(max_length=150)

    slug = models.SlugField(
        max_length=180,
        unique=True,
        allow_unicode=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Artists"

    def __str__(self):
        return self.name


class Song(models.Model):

    class Language(models.TextChoices):
        NEPALI = "ne", "Nepali"
        HINDI = "hi", "Hindi"
        ENGLISH = "en", "English"

    class Difficulty(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    class RightsStatus(models.TextChoices):
        UNKNOWN = "unknown", "Unverified"
        ORIGINAL = "original", "Original content"
        PUBLIC_DOMAIN = "public_domain", "Public domain"
        LICENSED = "licensed", "Licensed content"
        PRIVATE = "private", "Private collection"

    artist = models.ForeignKey(
        Artist,
        on_delete=models.PROTECT,
        related_name="songs",
    )

    title = models.CharField(max_length=200)

    slug = models.SlugField(
        max_length=250,
        unique=True,
        allow_unicode=True,
    )

    alternate_title = models.CharField(
        max_length=200,
        blank=True,
        help_text="Native-script or Romanized alternative title.",
    )

    language = models.CharField(
        max_length=10,
        choices=Language.choices,
    )

    musical_key = models.CharField(
        max_length=10,
        blank=True,
        help_text="Examples: C, G, Am, F#m.",
    )

    capo = models.PositiveSmallIntegerField(
        default=0,
        validators=[MaxValueValidator(12)],
    )

    difficulty = models.CharField(
        max_length=20,
        choices=Difficulty.choices,
        default=Difficulty.BEGINNER,
    )

    tuning = models.CharField(
        max_length=50,
        default="E A D G B E",
    )

    strumming_pattern = models.CharField(
        max_length=150,
        blank=True,
    )

    chordpro_content = models.TextField(
        help_text="Lyrics with inline chords in ChordPro format.",
    )

    chords = models.ManyToManyField(
        "chords.Chord",
        through="SongChord",
        related_name="songs",
        blank=True,
    )

    source_url = models.URLField(blank=True)

    rights_status = models.CharField(
        max_length=20,
        choices=RightsStatus.choices,
        default=RightsStatus.UNKNOWN,
    )

    rights_notes = models.TextField(blank=True)

    is_published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]

        indexes = [
            models.Index(fields=["language", "is_published"]),
            models.Index(fields=["is_published", "title"]),
        ]

        constraints = [
            models.CheckConstraint(
                condition=models.Q(capo__gte=0, capo__lte=12),
                name="song_valid_capo",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(is_published=False)
                    | models.Q(
                        rights_status__in=[
                            "original",
                            "public_domain",
                            "licensed",
                        ]
                    )
                ),
                name="song_valid_publication_rights",
            ),
        ]

    def clean(self):
        super().clean()

        errors = {}

        if not self.chordpro_content.strip():
            errors["chordpro_content"] = (
                "Chord sheet content cannot be empty."
            )

        allowed_rights = [
            self.RightsStatus.ORIGINAL,
            self.RightsStatus.PUBLIC_DOMAIN,
            self.RightsStatus.LICENSED,
        ]

        if self.is_published and self.rights_status not in allowed_rights:
            errors["is_published"] = (
                "Verify publication rights before publishing this song."
            )

        if (
            self.is_published
            and self.rights_status == self.RightsStatus.LICENSED
            and not self.rights_notes.strip()
        ):
            errors["rights_notes"] = (
                "Document the license or publication permission."
            )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.title} - {self.artist.name}"


class SongChord(models.Model):

    song = models.ForeignKey(
        Song,
        on_delete=models.CASCADE,
        related_name="song_chords",
    )

    chord = models.ForeignKey(
        "chords.Chord",
        on_delete=models.PROTECT,
        related_name="chord_songs",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["song", "chord"],
                name="unique_song_chord",
            ),
        ]

    def __str__(self):
        return f"{self.song.title} - {self.chord.name}"
