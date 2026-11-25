
from django.core.exceptions import ValidationError
from django.test import TestCase

from .models import (
    Artist,
    Song,
    ChordArrangement,
)


class PublicSongAPITests(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.artist = Artist.objects.create(
            name="Demo Artist"
        )

        cls.song = Song.objects.create(
            title="Guitar Practice Song",
            alternate_title="Practice Geet",
            artist=cls.artist,
            language="ne",
        )

        cls.published_arrangement = (
            ChordArrangement.objects.create(
                song=cls.song,
                title="Beginner Version",
                original_key="G",
                chord_content="[G]Original practice line",
                arranged_by="Demo Contributor",
                source_notes=(
                    "Original words and chord arrangement "
                    "created specifically for testing."
                ),
                rights_basis=(
                    ChordArrangement.RightsBasis.ORIGINAL
                ),
                publication_status=(
                    ChordArrangement.PublicationStatus.PUBLISHED
                ),
                is_verified=True,
            )
        )

        ChordArrangement.objects.create(
            song=cls.song,
            title="Unpublished Version",
            original_key="D",
            chord_content="[D]Private draft",
            publication_status=(
                ChordArrangement.PublicationStatus.DRAFT
            ),
            is_verified=False,
        )

        cls.draft_song = Song.objects.create(
            title="Hidden Song",
            artist=cls.artist,
            language="hi",
        )

        ChordArrangement.objects.create(
            song=cls.draft_song,
            title="Draft",
            original_key="C",
            chord_content="[C]Not published",
            publication_status=(
                ChordArrangement.PublicationStatus.DRAFT
            ),
            is_verified=False,
        )

    def test_public_song_list(self):
        response = self.client.get("/api/songs/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_only_published_arrangements_visible(self):
        response = self.client.get(
            f"/api/songs/{self.song.id}/"
        )

        self.assertEqual(response.status_code, 200)

        arrangements = response.json()["arrangements"]

        self.assertEqual(len(arrangements), 1)

        self.assertEqual(
            arrangements[0]["title"],
            "Beginner Version",
        )

    def test_draft_song_hidden(self):
        response = self.client.get(
            f"/api/songs/{self.draft_song.id}/"
        )

        self.assertEqual(response.status_code, 404)

    def test_language_filter(self):
        response = self.client.get(
            "/api/songs/?language=ne"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_alternate_title_search(self):
        response = self.client.get(
            "/api/songs/?search=Geet"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_public_cannot_create_song(self):
        response = self.client.post(
            "/api/songs/",
            {"title": "Unauthorized Song"},
        )

        self.assertEqual(response.status_code, 405)

    def test_publishing_requires_rights_review(self):
        arrangement = ChordArrangement(
            song=self.song,
            title="Uncleared Version",
            original_key="G",
            chord_content="[G]Test",
            source_notes="Source recorded.",
            is_verified=True,
            publication_status=(
                ChordArrangement.PublicationStatus.PUBLISHED
            ),
            rights_basis=(
                ChordArrangement.RightsBasis.UNKNOWN
            ),
        )

        with self.assertRaises(ValidationError) as error:
            arrangement.full_clean()

        self.assertIn(
            "rights_basis",
            error.exception.message_dict,
        )

    def test_publishing_requires_verification(self):
        arrangement = ChordArrangement(
            song=self.song,
            title="Unverified Version",
            original_key="G",
            chord_content="[G]Test",
            source_notes="Entire content is original.",
            is_verified=False,
            publication_status=(
                ChordArrangement.PublicationStatus.PUBLISHED
            ),
            rights_basis=(
                ChordArrangement.RightsBasis.ORIGINAL
            ),
        )

        with self.assertRaises(ValidationError) as error:
            arrangement.full_clean()

        self.assertIn(
            "is_verified",
            error.exception.message_dict,
        )

    def test_publishing_requires_source_notes(self):
        arrangement = ChordArrangement(
            song=self.song,
            title="Missing Source Notes",
            original_key="G",
            chord_content="[G]Test",
            source_notes="",
            is_verified=True,
            publication_status=(
                ChordArrangement.PublicationStatus.PUBLISHED
            ),
            rights_basis=(
                ChordArrangement.RightsBasis.ORIGINAL
            ),
        )

        with self.assertRaises(ValidationError) as error:
            arrangement.full_clean()

        self.assertIn(
            "source_notes",
            error.exception.message_dict,
        )

    def test_public_api_rejects_invalid_published_record(self):
        unsafe_song = Song.objects.create(
            title="Unreviewed Published Song",
            artist=self.artist,
            language="en",
        )

        # Direct ORM creation intentionally bypasses
        # model-form validation for this regression test.
        ChordArrangement.objects.create(
            song=unsafe_song,
            title="Unsafe Version",
            original_key="C",
            chord_content="[C]Private content",
            publication_status=(
                ChordArrangement.PublicationStatus.PUBLISHED
            ),
            rights_basis=(
                ChordArrangement.RightsBasis.UNKNOWN
            ),
            is_verified=True,
        )

        response = self.client.get(
            f"/api/songs/{unsafe_song.id}/"
        )

        self.assertEqual(response.status_code, 404)
