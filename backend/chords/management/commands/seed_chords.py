
from django.core.management.base import BaseCommand
from django.db import transaction

from chords.models import Chord


CHORDS = [
    # Major chords
    ("A", "a-major", "major",
     [-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0]),

    ("B", "b-major", "major",
     [-1, 2, 4, 4, 4, 2], [0, 1, 2, 3, 4, 1]),

    ("C", "c-major", "major",
     [-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]),

    ("D", "d-major", "major",
     [-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2]),

    ("E", "e-major", "major",
     [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0]),

    ("F", "f-major", "major",
     [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1]),

    ("G", "g-major", "major",
     [3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3]),

    # Minor chords
    ("Am", "a-minor", "minor",
     [-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0]),

    ("Bm", "b-minor", "minor",
     [-1, 2, 4, 4, 3, 2], [0, 1, 3, 4, 2, 1]),

    ("Cm", "c-minor", "minor",
     [-1, 3, 5, 5, 4, 3], [0, 1, 3, 4, 2, 1]),

    ("Dm", "d-minor", "minor",
     [-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]),

    ("Em", "e-minor", "minor",
     [0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0]),

    ("Fm", "f-minor", "minor",
     [1, 3, 3, 1, 1, 1], [1, 3, 4, 1, 1, 1]),

    ("Gm", "g-minor", "minor",
     [3, 5, 5, 3, 3, 3], [1, 3, 4, 1, 1, 1]),

    # Seventh chords
    ("A7", "a-seventh", "seventh",
     [-1, 0, 2, 0, 2, 0], [0, 0, 1, 0, 2, 0]),

    ("B7", "b-seventh", "seventh",
     [-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4]),

    ("C7", "c-seventh", "seventh",
     [-1, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0]),

    ("D7", "d-seventh", "seventh",
     [-1, -1, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3]),

    ("E7", "e-seventh", "seventh",
     [0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]),

    ("G7", "g-seventh", "seventh",
     [3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1]),

    # Additional common chords
    ("F#m", "f-sharp-minor", "minor",
     [2, 4, 4, 2, 2, 2], [1, 3, 4, 1, 1, 1]),

    ("Cadd9", "c-add-nine", "other",
     [-1, 3, 2, 0, 3, 3], [0, 2, 1, 0, 3, 4]),

    ("Dsus4", "d-sus-four", "suspended",
     [-1, -1, 0, 2, 3, 3], [0, 0, 0, 1, 3, 4]),

    ("Asus2", "a-sus-two", "suspended",
     [-1, 0, 2, 2, 0, 0], [0, 0, 1, 2, 0, 0]),
]


class Command(BaseCommand):

    help = "Seed the database with common guitar chords."

    @transaction.atomic
    def handle(self, *args, **options):

        created_count = 0
        skipped_count = 0

        for name, slug, category, frets, fingers in CHORDS:

            if Chord.objects.filter(name=name).exists():
                skipped_count += 1
                continue

            positive_frets = [
                fret for fret in frets if fret > 0
            ]

            base_fret = (
                1
                if max(positive_frets, default=0) <= 4
                else min(positive_frets)
            )

            chord = Chord(
                name=name,
                slug=slug,
                category=category,
                frets=frets,
                fingers=fingers,
                base_fret=base_fret,
            )

            chord.full_clean()
            chord.save()

            created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created_count} | "
                f"Skipped existing: {skipped_count}"
            )
        )
