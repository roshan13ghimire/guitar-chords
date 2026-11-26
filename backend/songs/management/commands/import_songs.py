
from pathlib import Path

from django.core.exceptions import ValidationError
from django.core.management.base import (
    BaseCommand,
    CommandError,
)
from django.db import IntegrityError

from songs.services.chordpro import (
    ChordProParseError,
    parse_chordpro,
)
from songs.services.importer import import_song


SUPPORTED_EXTENSIONS = {
    ".cho",
    ".chopro",
    ".chordpro",
    ".pro",
    ".txt",
}


class Command(BaseCommand):

    help = "Import songs from ChordPro files."

    def add_arguments(self, parser):

        parser.add_argument(
            "path",
            type=str,
            help="Path to a song file or directory.",
        )

        parser.add_argument(
            "--publish",
            action="store_true",
            help=(
                "Publish imported songs with "
                "appropriate publication rights."
            ),
        )

        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Parse files without saving them.",
        )

    def handle(self, *args, **options):

        path = Path(options["path"])

        publish = options["publish"]
        dry_run = options["dry_run"]

        if not path.exists():
            raise CommandError(
                f"Path does not exist: {path}"
            )

        if path.is_file():

            if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
                raise CommandError(
                    "Unsupported file extension."
                )

            files = [path]

        else:

            files = sorted(
                file
                for file in path.rglob("*")
                if file.is_file()
                and file.suffix.lower()
                in SUPPORTED_EXTENSIONS
            )

        if not files:
            raise CommandError(
                "No supported song files found."
            )

        created = 0
        skipped = 0
        failed = 0
        parsed_count = 0

        missing_chords = set()

        self.stdout.write(
            f"Found {len(files)} song file(s).\n"
        )

        for file in files:

            try:

                raw_content = file.read_text(
                    encoding="utf-8-sig"
                )

                parsed = parse_chordpro(
                    raw_content
                )

                if dry_run:

                    parsed_count += 1

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"PARSED: {parsed.title} "
                            f"- {parsed.artist}"
                        )
                    )

                    continue

                result = import_song(
                    parsed,
                    publish=publish,
                )

                if result.created:

                    created += 1

                    self.stdout.write(
                        self.style.SUCCESS(
                            f"IMPORTED: {result.song.title}"
                        )
                    )

                else:

                    skipped += 1

                    self.stdout.write(
                        self.style.WARNING(
                            f"SKIPPED: {result.song.title}"
                        )
                    )

                missing_chords.update(
                    result.missing_chords
                )

                if result.missing_chords:

                    self.stdout.write(
                        self.style.WARNING(
                            "Missing chord definitions: "
                            + ", ".join(
                                result.missing_chords
                            )
                        )
                    )

            except (
                ChordProParseError,
                ValidationError,
                IntegrityError,
                OSError,
                UnicodeError,
            ) as exc:

                failed += 1

                self.stderr.write(
                    self.style.ERROR(
                        f"FAILED: {file.name} - {exc}"
                    )
                )

        self.stdout.write("\nImport summary")
        self.stdout.write("-" * 30)

        self.stdout.write(f"Files: {len(files)}")
        self.stdout.write(f"Created: {created}")
        self.stdout.write(f"Skipped: {skipped}")
        self.stdout.write(f"Failed: {failed}")

        if dry_run:
            self.stdout.write(
                f"Parsed successfully: {parsed_count}"
            )

        if missing_chords:

            self.stdout.write(
                self.style.WARNING(
                    "\nMissing chord definitions: "
                    + ", ".join(sorted(missing_chords))
                )
            )

        if failed:
            raise CommandError(
                f"{failed} file(s) failed."
            )

        self.stdout.write(
            self.style.SUCCESS(
                "\nImport completed."
            )
        )
