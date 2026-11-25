
from unittest.mock import patch

from django.contrib.admin.sites import AdminSite
from django.core.exceptions import (
    NON_FIELD_ERRORS,
    ValidationError,
)
from django.test import TestCase

from .admin import ChordArrangementAdmin
from .forms import ChordArrangementAdminForm
from .models import (
    Artist,
    Song,
    ChordArrangement,
)


class ArrangementReviewTests(TestCase):

    def setUp(self):
        self.artist = Artist.objects.create(
            name="Demo Artist"
        )

        self.song = Song.objects.create(
            title="Original Practice Song",
            artist=self.artist,
            language="ne",
        )

        self.arrangement = ChordArrangement.objects.create(
            song=self.song,
            title="Standard",
            original_key="G",
            capo=0,
            difficulty="beginner",
            chord_content="[G]Original practice text",
            source_notes=(
                "Original demonstration content "
                "created for testing."
            ),
            rights_basis=(
                ChordArrangement.RightsBasis.ORIGINAL
            ),
            publication_status=(
                ChordArrangement.PublicationStatus.PUBLISHED
            ),
            is_verified=True,
        )

    def test_verified_chord_edit_requires_review(self):
        self.arrangement.chord_content = (
            "[A]Modified practice text"
        )

        with self.assertRaises(ValidationError) as error:
            self.arrangement.full_clean()

        self.assertIn(
            NON_FIELD_ERRORS,
            error.exception.message_dict,
        )

    def test_reopened_arrangement_can_be_edited(self):
        self.arrangement.publication_status = (
            ChordArrangement.PublicationStatus.REVIEW
        )

        self.arrangement.is_verified = False

        self.arrangement.review_notes = (
            "Chord progression requires correction."
        )

        self.arrangement.chord_content = (
            "[A]Corrected practice text"
        )

        self.arrangement.full_clean()
        self.arrangement.save()

        self.assertEqual(
            self.arrangement.publication_status,
            "review",
        )

        self.assertFalse(
            self.arrangement.is_verified
        )

        response = self.client.get(
            f"/api/songs/{self.song.pk}/"
        )

        self.assertEqual(
            response.status_code,
            404,
        )

    def test_review_notes_do_not_change_verification(self):
        self.arrangement.review_notes = (
            "Review completed. No outstanding changes."
        )

        self.arrangement.full_clean()
        self.arrangement.save()

        self.arrangement.refresh_from_db()

        self.assertTrue(
            self.arrangement.is_verified
        )

        self.assertEqual(
            self.arrangement.publication_status,
            "published",
        )

    def test_invalid_chord_tag_rejected_by_admin_form(self):
        form = ChordArrangementAdminForm(
            data={
                "song": self.song.pk,
                "title": "Invalid Version",
                "original_key": "G",
                "capo": 0,
                "difficulty": "beginner",
                "strumming_pattern": "",
                "chord_content": (
                    "[G]Valid [NotAChord]Invalid"
                ),
                "source_notes": "",
                "review_notes": "",
                "rights_basis": "unknown",
                "publication_status": "draft",
            }
        )

        self.assertFalse(
            form.is_valid()
        )

        self.assertIn(
            "chord_content",
            form.errors,
        )

    def test_send_to_review_unpublishes(self):
        model_admin = ChordArrangementAdmin(
            ChordArrangement,
            AdminSite(),
        )

        queryset = ChordArrangement.objects.filter(
            pk=self.arrangement.pk
        )

        with patch.object(
            model_admin,
            "message_user",
        ):
            model_admin.send_to_review(
                None,
                queryset,
            )

        self.arrangement.refresh_from_db()

        self.assertEqual(
            self.arrangement.publication_status,
            "review",
        )

        self.assertFalse(
            self.arrangement.is_verified
        )

        response = self.client.get(
            f"/api/songs/{self.song.pk}/"
        )

        self.assertEqual(
            response.status_code,
            404,
        )

    def test_review_notes_not_exposed_in_public_api(self):
        self.arrangement.review_notes = (
            "Private internal review notes."
        )

        self.arrangement.save()

        response = self.client.get(
            f"/api/songs/{self.song.pk}/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        arrangement_data = (
            response.json()["arrangements"][0]
        )

        self.assertNotIn(
            "review_notes",
            arrangement_data,
        )

        self.assertNotIn(
            "source_notes",
            arrangement_data,
        )
