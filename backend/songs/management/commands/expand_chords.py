
from django.core.management.base import BaseCommand
from django.db import transaction

from chords.models import Chord


ROOTS = [
    "E", "F", "F#", "G", "G#", "A",
    "A#", "B", "C", "C#", "D", "D#",
]

SHAPES = {
    "major": {
        "suffix": "",
        "offsets": [0, 2, 2, 1, 0, 0],
        "fingers": [1, 3, 4, 2, 1, 1],
    },
    "minor": {
        "suffix": "m",
        "offsets": [0, 2, 2, 0, 0, 0],
        "fingers": [1, 3, 4, 1, 1, 1],
    },
    "seventh": {
        "suffix": "7",
        "offsets": [0, 2, 0, 1, 0, 0],
        "fingers": [1, 3, 1, 2, 1, 1],
    },
}


class Command(BaseCommand):

    help = "Expand the guitar chord library."

    @transaction.atomic
    def handle(self, *args, **options):

        created = 0
        skipped = 0

        for fret, root in enumerate(ROOTS):

            for category, shape in SHAPES.items():

                name = root + shape["suffix"]

                if Chord.objects.filter(name=name).exists():
                    skipped += 1
                    continue

                if fret == 0:
                    frets = shape["offsets"].copy()

                    fingers = [
                        finger if position > 0 else 0
                        for position, finger in zip(
                            frets,
                            shape["fingers"],
                        )
                    ]

                    description = "Open-position chord."

                else:
                    frets = [
                        fret + offset
                        for offset in shape["offsets"]
                    ]

                    fingers = shape["fingers"].copy()

                    description = (
                        f"Movable E-shape barre chord. "
                        f"Place your index finger across "
                        f"the strings at fret {fret}."
                    )

                slug_root = (
                    root.lower()
                    .replace("#", "-sharp")
                )

                chord = Chord(
                    name=name,
                    slug=f"{slug_root}-{category}",
                    category=category,
                    frets=frets,
                    fingers=fingers,
                    base_fret=max(1, fret),
                    description=description,
                )

                chord.full_clean()
                chord.save()

                created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created} | "
                f"Skipped: {skipped} | "
                f"Total chords: {Chord.objects.count()}"
            )
        )
