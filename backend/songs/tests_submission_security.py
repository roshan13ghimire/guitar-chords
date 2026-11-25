
import json

from django.core.cache import cache
from django.test import TestCase

from .models import CommunitySubmission


class CommunitySubmissionSecurityTests(TestCase):

    def setUp(self):
        cache.clear()

    def submit(self, payload):
        return self.client.post(
            "/api/submissions/",
            data=json.dumps(payload),
            content_type="application/json",
        )

    def valid_suggestion(self):
        return {
            "kind": "song",
            "song_title": "Original Practice Song",
            "artist_name": "Practice Artist",
            "language": "ne",
            "details": (
                "Please consider adding this "
                "original practice song."
            ),
        }

    def test_empty_spam_trap_allows_submission(self):
        payload = self.valid_suggestion()
        payload["company_website"] = ""

        response = self.submit(payload)

        self.assertEqual(
            response.status_code,
            201,
        )

        self.assertEqual(
            CommunitySubmission.objects.count(),
            1,
        )

        submission = CommunitySubmission.objects.get()

        self.assertEqual(
            submission.status,
            "pending",
        )

    def test_filled_spam_trap_does_not_save(self):
        payload = self.valid_suggestion()

        payload["company_website"] = (
            "https://spam.example.com"
        )

        response = self.submit(payload)

        self.assertEqual(
            response.status_code,
            201,
        )

        self.assertFalse(
            CommunitySubmission.objects.exists()
        )

    def test_oversized_request_is_rejected(self):
        payload = self.valid_suggestion()

        payload["details"] = "A" * 20000

        response = self.submit(payload)

        self.assertEqual(
            response.status_code,
            413,
        )

        self.assertFalse(
            CommunitySubmission.objects.exists()
        )

    def test_json_array_is_rejected(self):
        response = self.submit([
            "this is not a valid submission object"
        ])

        self.assertEqual(
            response.status_code,
            400,
        )

        self.assertFalse(
            CommunitySubmission.objects.exists()
        )
