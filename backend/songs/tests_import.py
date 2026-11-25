
import csv
import json

from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory

from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase

from .models import (
    Artist,
    Song,
    ChordArrangement,
)


class SongImportTests(TestCase):

    def setUp(self):
        directory = TemporaryDirectory()

        self.addCleanup(
            directory.cleanup
        )

        self.folder = Path(
            directory.name
        )

        self.example = {
            "artist": "Demo Composer",
            "title": "Original Practice Song",
            "language": "ne",
            "arrangement_title": "Beginner",
            "original_key": "G",
            "capo": 0,
            "difficulty": "beginner",
            "chord_content": (
                "[G]नयाँ बिहान [D]संगीतसँग"
            ),
            "source_notes": (
                "Original practice text for testing."
            ),
        }

    def write_json(self, rows):
        path = self.folder / "songs.json"

        path.write_text(
            json.dumps(
                rows,
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )

        return path

    def import_file(self, path, **options):
        return call_command(
            "import_songs",
            str(path),
            stdout=StringIO(),
            **options,
        )

    def test_json_import_stays_unpublished(self):
        self.import_file(
            self.write_json([self.example])
        )

        self.assertEqual(
            Artist.objects.count(),
            1,
        )

        self.assertEqual(
            Song.objects.count(),
            1,
        )

        arrangement = (
            ChordArrangement.objects.get()
        )

        self.assertEqual(
            arrangement.publication_status,
            "draft",
        )

        self.assertEqual(
            arrangement.rights_basis,
            "unknown",
        )

        self.assertFalse(
            arrangement.is_verified
        )

        self.assertEqual(
            self.client.get("/api/songs/").json(),
            [],
        )

    def test_dry_run_does_not_save(self):
        self.import_file(
            self.write_json([self.example]),
            dry_run=True,
        )

        self.assertEqual(
            Artist.objects.count(),
            0,
        )

        self.assertEqual(
            Song.objects.count(),
            0,
        )

        self.assertEqual(
            ChordArrangement.objects.count(),
            0,
        )

    def test_rerunning_import_does_not_duplicate(self):
        path = self.write_json(
            [self.example]
        )

        self.import_file(path)
        self.import_file(path)

        self.assertEqual(
            Artist.objects.count(),
            1,
        )

        self.assertEqual(
            Song.objects.count(),
            1,
        )

        self.assertEqual(
            ChordArrangement.objects.count(),
            1,
        )

    def test_multiple_arrangements_share_song(self):
        second = {
            **self.example,
            "arrangement_title": "Alternative",
            "chord_content": (
                "[C]New melody [G]New chords"
            ),
        }

        self.import_file(
            self.write_json([
                self.example,
                second,
            ])
        )

        self.assertEqual(
            Song.objects.count(),
            1,
        )

        self.assertEqual(
            ChordArrangement.objects.count(),
            2,
        )

    def test_invalid_chord_rejected_without_changes(self):
        invalid = {
            **self.example,
            "chord_content": "[NotChord]bad text",
        }

        with self.assertRaises(CommandError):
            self.import_file(
                self.write_json([
                    self.example,
                    invalid,
                ])
            )

        self.assertEqual(
            Artist.objects.count(),
            0,
        )

        self.assertEqual(
            ChordArrangement.objects.count(),
            0,
        )

    def test_conflict_rolls_back_entire_batch(self):
        self.import_file(
            self.write_json([self.example])
        )

        new_song = {
            **self.example,
            "artist": "Another Artist",
            "title": "Another Original Song",
        }

        conflicting = {
            **self.example,
            "chord_content": (
                "[A]Different song sheet"
            ),
        }

        with self.assertRaises(CommandError):
            self.import_file(
                self.write_json([
                    new_song,
                    conflicting,
                ])
            )

        self.assertEqual(
            Artist.objects.count(),
            1,
        )

        self.assertEqual(
            Song.objects.count(),
            1,
        )

        self.assertEqual(
            ChordArrangement.objects.count(),
            1,
        )

    def test_csv_import_with_unicode(self):
        path = self.folder / "songs.csv"

        with path.open(
            "w",
            encoding="utf-8-sig",
            newline="",
        ) as handle:

            writer = csv.DictWriter(
                handle,
                fieldnames=list(self.example),
            )

            writer.writeheader()
            writer.writerow(self.example)

        self.import_file(path)

        self.assertIn(
            "नयाँ",
            ChordArrangement.objects
            .get()
            .chord_content,
        )

    def test_import_rejects_publishing_fields(self):
        unsafe = {
            **self.example,
            "publication_status": "published",
        }

        with self.assertRaises(CommandError):
            self.import_file(
                self.write_json([unsafe])
            )

        self.assertFalse(
            ChordArrangement.objects.exists()
        )
