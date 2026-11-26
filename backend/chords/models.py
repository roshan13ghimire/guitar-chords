
from django.core.exceptions import ValidationError
from django.db import models


class Chord(models.Model):

    class Category(models.TextChoices):
        MAJOR = "major", "Major"
        MINOR = "minor", "Minor"
        SEVENTH = "seventh", "Seventh"
        SUSPENDED = "suspended", "Suspended"
        DIMINISHED = "diminished", "Diminished"
        AUGMENTED = "augmented", "Augmented"
        OTHER = "other", "Other"

    name = models.CharField(max_length=30, unique=True)

    slug = models.SlugField(max_length=50, unique=True)

    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.MAJOR,
    )

    frets = models.JSONField(
        help_text=(
            "Six fret positions from low E to high E. "
            "Use -1 for muted strings and 0 for open strings."
        )
    )

    fingers = models.JSONField(
        help_text=(
            "Six finger positions. Use 0 for unused fingers "
            "and 1-4 for index through pinky."
        )
    )

    base_fret = models.PositiveSmallIntegerField(default=1)

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(
                    base_fret__gte=1,
                    base_fret__lte=24,
                ),
                name="chord_valid_base_fret",
            ),
        ]

    def clean(self):
        super().clean()

        errors = {}

        valid_frets = (
            isinstance(self.frets, list)
            and len(self.frets) == 6
            and all(
                type(fret) is int and -1 <= fret <= 24
                for fret in self.frets
            )
        )

        valid_fingers = (
            isinstance(self.fingers, list)
            and len(self.fingers) == 6
            and all(
                type(finger) is int and 0 <= finger <= 4
                for finger in self.fingers
            )
        )

        if not valid_frets:
            errors["frets"] = (
                "Provide exactly six integers between -1 and 24."
            )

        if not valid_fingers:
            errors["fingers"] = (
                "Provide exactly six integers between 0 and 4."
            )

        if valid_frets and valid_fingers:
            for fret, finger in zip(self.frets, self.fingers):
                if fret <= 0 and finger != 0:
                    errors["fingers"] = (
                        "Open and muted strings must use finger 0."
                    )
                    break

                if fret > 0 and finger == 0:
                    errors["fingers"] = (
                        "Fretted strings must have a finger assigned."
                    )
                    break

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return self.name
