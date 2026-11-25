
import csv
import json
import re
from pathlib import Path

from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError, transaction

from songs.models import Artist, Song, ChordArrangement


FIELDS = {
    "artist",
    "title",
    "language",
    "alternate_title",
    "genre",
    "official_url",
    "arrangement_title",
    "original_key",
    "capo",
    "difficulty",
    "strumming_pattern",
    "chord_content",
    "arranged_by",
    "source_url",
    "source_notes",
}

REQUIRED = {
    "artist",
    "title",
    "language",
    "original_key",
    "chord_content",
}

MAX_BYTES = 2 * 1024 * 1024
MAX_ROWS = 500

CHORD_TAG = re.compile(r"\[([^\[\]\r\n]+)\]")

CHORD_NAME = re.compile(
    r"[A-G](?:#|b)?"
    r"(?:m|maj7|m7|7|sus2|sus4|dim|aug|add9)?"
    r"(?:/[A-G](?:#|b)?)?"
)

KEY_NAME = re.compile(r"[A-G](?:#|b)?m?")


def read_rows(path):
    if not path.is_file():
        raise CommandError(f"File not found: {path}")

    if path.suffix.lower() not in {".csv", ".json"}:
        raise CommandError(
            "Import file must have a .csv or .json extension."
        )

    if path.stat().st_size > MAX_BYTES:
        raise CommandError(
            "Import file exceeds 2 MB; split into smaller batches."
        )

    try:
        with path.open(
            "r",
            encoding="utf-8-sig",
            newline="",
        ) as handle:

            if path.suffix.lower() == ".csv":
                reader = csv.DictReader(handle)

                headers = reader.fieldnames or []

                if len(headers) != len(set(headers)):
                    raise CommandError(
                        "CSV contains duplicate column names."
                    )

                unknown = set(headers) - FIELDS

                if unknown:
                    raise CommandError(
                        "Unknown CSV columns: "
                        + ", ".join(sorted(unknown))
                    )

                missing = REQUIRED - set(headers)

                if missing:
                    raise CommandError(
                        "Missing CSV columns: "
                        + ", ".join(sorted(missing))
                    )

                rows = list(reader)

            else:
                rows = json.load(handle)

    except (
        OSError,
        UnicodeError,
        csv.Error,
        json.JSONDecodeError,
    ) as exc:
        raise CommandError(
            f"Unable to read import file: {exc}"
        ) from exc

    if not isinstance(rows, list) or not rows:
        raise CommandError(
            "File must contain at least one song row."
        )

    if len(rows) > MAX_ROWS:
        raise CommandError(
            f"Too many rows; maximum is {MAX_ROWS} per import."
        )

    return rows


def validate_chords(content, row_number):
    tags = CHORD_TAG.findall(content)

    leftover = CHORD_TAG.sub("", content)

    if (
        not tags
        or "[" in leftover
        or "]" in leftover
    ):
        raise CommandError(
            f"Row {row_number}: use properly paired "
            "chord tags, e.g. [G]."
        )

    invalid = [
        tag
        for tag in tags
        if not CHORD_NAME.fullmatch(tag.strip())
    ]

    if invalid:
        raise CommandError(
            f"Row {row_number}: unsupported "
            f"chord tag [{invalid[0]}]."
        )


def normalize_row(raw, number):
    if not isinstance(raw, dict):
        raise CommandError(
            f"Row {number}: expected an object "
            "with named fields."
        )

    unknown = set(raw) - FIELDS

    if unknown:
        raise CommandError(
            f"Row {number}: unknown fields: "
            + ", ".join(str(value) for value in unknown)
        )

    row = {}

    for field in FIELDS:
        value = raw.get(field, "")

        if value is None:
            value = ""

        if isinstance(value, bool) or not (
            isinstance(value, str)
            or (
                field == "capo"
                and isinstance(value, int)
            )
        ):
            raise CommandError(
                f"Row {number}: {field} must be text."
            )

        row[field] = str(value).strip()

    for field in REQUIRED:
        if not row[field]:
            raise CommandError(
                f"Row {number}: {field} is required."
            )

    row["language"] = row["language"].lower()

    if row["language"] not in {"ne", "hi", "en"}:
        raise CommandError(
            f"Row {number}: language must be ne, hi, or en."
        )

    row["arrangement_title"] = (
        row["arrangement_title"] or "Standard"
    )

    row["difficulty"] = (
        row["difficulty"] or "beginner"
    ).lower()

    if row["difficulty"] not in {
        "beginner",
        "intermediate",
        "advanced",
    }:
        raise CommandError(
            f"Row {number}: invalid difficulty."
        )

    if not KEY_NAME.fullmatch(row["original_key"]):
        raise CommandError(
            f"Row {number}: invalid original_key."
        )

    try:
        capo = int(row["capo"] or "0")
    except ValueError as exc:
        raise CommandError(
            f"Row {number}: capo must be an integer."
        ) from exc

    if not 0 <= capo <= 12:
        raise CommandError(
            f"Row {number}: capo must be from 0 to 12."
        )

    row["capo"] = capo

    row["chord_content"] = (
        row["chord_content"]
        .replace("\r\n", "\n")
    )

    validate_chords(
        row["chord_content"],
        number,
    )

    return row


def get_one(queryset, kind, number):
    matches = list(queryset[:2])

    if len(matches) > 1:
        raise CommandError(
            f"Row {number}: more than one matching "
            f"{kind} exists; resolve in admin."
        )

    return matches[0] if matches else None


def validated_save(instance, number):
    try:
        instance.full_clean()
        instance.save()

    except ValidationError as exc:
        raise CommandError(
            f"Row {number}: {exc}"
        ) from exc


class Command(BaseCommand):
    help = (
        "Import CSV or JSON chord arrangements "
        "as unpublished drafts."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "file",
            type=Path,
            help="UTF-8 CSV or JSON file",
        )

        parser.add_argument(
            "--dry-run",
            action="store_true",
            help=(
                "Check the import and roll back "
                "all changes."
            ),
        )

    def handle(self, *args, **options):
        path = options["file"]

        rows = [
            normalize_row(item, index)
            for index, item in enumerate(
                read_rows(path),
                start=1,
            )
        ]

        counts = {
            "artists": 0,
            "songs": 0,
            "arrangements": 0,
            "skipped": 0,
        }

        try:
            with transaction.atomic():
                for number, row in enumerate(
                    rows,
                    start=1,
                ):
                    artist = get_one(
                        Artist.objects.filter(
                            name__iexact=row["artist"],
                        ),
                        "artist",
                        number,
                    )

                    if artist is None:
                        artist = Artist(
                            name=row["artist"]
                        )

                        validated_save(
                            artist,
                            number,
                        )

                        counts["artists"] += 1

                    song = get_one(
                        Song.objects.filter(
                            title__iexact=row["title"],
                            artist=artist,
                            language=row["language"],
                        ),
                        "song",
                        number,
                    )

                    if song is None:
                        song = Song(
                            title=row["title"],
                            alternate_title=(
                                row["alternate_title"]
                            ),
                            artist=artist,
                            language=row["language"],
                            genre=row["genre"],
                            official_url=(
                                row["official_url"]
                            ),
                        )

                        validated_save(
                            song,
                            number,
                        )

                        counts["songs"] += 1

                    existing = get_one(
                        ChordArrangement.objects.filter(
                            song=song,
                            title__iexact=(
                                row["arrangement_title"]
                            ),
                        ),
                        "arrangement",
                        number,
                    )

                    if existing is not None:
                        if (
                            existing.chord_content.strip()
                            != row["chord_content"].strip()
                        ):
                            raise CommandError(
                                f"Row {number}: "
                                f"'{row['arrangement_title']}' "
                                "already exists with different "
                                "chord content. Review it in "
                                "Django Admin; nothing was imported."
                            )

                        counts["skipped"] += 1
                        continue

                    arrangement = ChordArrangement(
                        song=song,
                        title=row["arrangement_title"],
                        original_key=row["original_key"],
                        capo=row["capo"],
                        difficulty=row["difficulty"],
                        strumming_pattern=(
                            row["strumming_pattern"]
                        ),
                        chord_content=(
                            row["chord_content"]
                        ),
                        arranged_by=row["arranged_by"],
                        source_url=row["source_url"],
                        source_notes=row["source_notes"],
                        rights_basis=(
                            ChordArrangement
                            .RightsBasis.UNKNOWN
                        ),
                        publication_status=(
                            ChordArrangement
                            .PublicationStatus.DRAFT
                        ),
                        is_verified=False,
                    )

                    validated_save(
                        arrangement,
                        number,
                    )

                    counts["arrangements"] += 1

                if options["dry_run"]:
                    transaction.set_rollback(True)

        except IntegrityError as exc:
            raise CommandError(
                "Database conflict; entire import "
                f"rolled back: {exc}"
            ) from exc

        label = (
            "DRY RUN (not saved)"
            if options["dry_run"]
            else "IMPORT COMPLETE"
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"{label}: "
                f"{counts['artists']} new artists, "
                f"{counts['songs']} new songs, "
                f"{counts['arrangements']} "
                "new draft arrangements, "
                f"{counts['skipped']} already existing."
            )
        )
