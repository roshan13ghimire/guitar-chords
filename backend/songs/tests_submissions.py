
import json

from django.core.cache import cache
from django.test import TestCase

from .models import (
    Artist,
    Song,
    ChordArrangement,
    CommunitySubmission,
)


class CommunitySubmissionTests(TestCase):
    def setUp(self):
        cache.clear()

        artist = Artist.objects.create(
            name="Test Artist"
        )

        song = Song.objects.create(
            title="Test Song",
            artist=artist,
            language="ne",
        )

        self.published = ChordArrangement.objects.create(
            song=song,
            title="Standard",
            original_key="G",
            chord_content="[G]Original words",
            source_notes="Original authorized test content.",
            rights_basis=ChordArrangement.RightsBasis.ORIGINAL,
            publication_status=(
                ChordArrangement.PublicationStatus.PUBLISHED
            ),
            is_verified=True,
        )

        self.draft = ChordArrangement.objects.create(
            song=song,
            title="Draft Version",
            original_key="C",
            chord_content="[C]Unpublished words",
            publication_status=(
                ChordArrangement.PublicationStatus.DRAFT
            ),
        )

    def submit(self, data):
        return self.client.post(
            "/api/submissions/",
            data=json.dumps(data),
            content_type="application/json",
        )

    def test_song_suggestion_is_pending(self):
        response = self.submit({
            "kind": "song",
            "song_title": "New Practice Song",
            "artist_name": "New Artist",
            "language": "hi",
            "details": "Please consider adding this song.",
        })

        self.assertEqual(response.status_code, 201)

        submission = CommunitySubmission.objects.get()

        self.assertEqual(submission.status, "pending")
        self.assertEqual(submission.kind, "song")
        self.assertIsNone(submission.arrangement)

    def test_published_chord_correction_is_accepted(self):
        response = self.submit({
            "kind": "correction",
            "arrangement_id": self.published.pk,
            "details": "The second chord should be changed.",
        })

        self.assertEqual(response.status_code, 201)

        submission = CommunitySubmission.objects.get()

        self.assertEqual(
            submission.arrangement_id,
            self.published.pk,
        )

        self.published.refresh_from_db()

        self.assertTrue(self.published.is_verified)
        self.assertEqual(
            self.published.publication_status,
            "published",
        )

    def test_draft_correction_is_rejected(self):
        response = self.submit({
            "kind": "correction",
            "arrangement_id": self.draft.pk,
            "details": "This private arrangement has an error.",
        })

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            CommunitySubmission.objects.exists()
        )

    def test_missing_song_details_rejected(self):
        response = self.submit({
            "kind": "song",
            "language": "ne",
            "details": "Please add this song to the site.",
        })

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            CommunitySubmission.objects.exists()
        )

    def test_public_cannot_list_submissions(self):
        response = self.client.get("/api/submissions/")

        self.assertEqual(response.status_code, 405)

    def test_public_cannot_set_moderation_status(self):
        response = self.submit({
            "kind": "song",
            "song_title": "New Practice Song",
            "artist_name": "New Artist",
            "language": "ne",
            "details": "Please consider adding this song.",
            "status": "reviewed",
            "moderator_notes": "Fake approval",
        })

        self.assertEqual(response.status_code, 201)

        submission = CommunitySubmission.objects.get()

        self.assertEqual(submission.status, "pending")
        self.assertEqual(submission.moderator_notes, "")

    def test_submission_does_not_create_song(self):
        before = Song.objects.count()

        response = self.submit({
            "kind": "song",
            "song_title": "Another Song",
            "artist_name": "New Artist",
            "language": "ne",
            "details": "I would like to see this song added.",
        })

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Song.objects.count(), before)

    def test_submission_limit(self):
        payload = {
            "kind": "song",
            "song_title": "Test Suggestion",
            "artist_name": "Example Artist",
            "language": "ne",
            "details": "Please consider adding this song.",
        }

        responses = [
            self.submit(payload)
            for _ in range(6)
        ]

        self.assertTrue(
            all(
                response.status_code == 201
                for response in responses[:5]
            )
        )

        self.assertEqual(
            responses[5].status_code,
            429,
        )
