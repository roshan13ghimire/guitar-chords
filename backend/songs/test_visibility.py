
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from songs.models import Artist, Song


class SongVisibilityTests(TestCase):

    @classmethod
    def setUpTestData(cls):
        artist = Artist.objects.create(
            name="Test Artist",
            slug="test-artist",
        )

        Song.objects.create(
            title="Public Song",
            slug="public-song",
            artist=artist,
            language="en",
            musical_key="G",
            chordpro_content="[G]Original test content",
            rights_status="original",
            is_published=True,
        )

        Song.objects.create(
            title="Private Song",
            slug="private-song",
            artist=artist,
            language="en",
            musical_key="Am",
            chordpro_content="[Am]Private test content",
            rights_status="private",
            is_published=False,
        )

    def setUp(self):
        self.client = APIClient()

    @override_settings(
        DEBUG=False,
        ALLOW_LOCAL_PRIVATE_SONGS=False,
    )
    def test_public_song_accessible(self):
        response = self.client.get(
            "/api/songs/public-song/",
            secure=True,
        )
        self.assertEqual(response.status_code, 200)

    @override_settings(
        DEBUG=False,
        ALLOW_LOCAL_PRIVATE_SONGS=False,
    )
    def test_private_song_hidden(self):
        response = self.client.get(
            "/api/songs/private-song/",
            secure=True,
        )
        self.assertEqual(response.status_code, 404)

    @override_settings(
        DEBUG=False,
        ALLOW_LOCAL_PRIVATE_SONGS=True,
    )
    def test_private_song_hidden_in_production(self):
        response = self.client.get(
            "/api/songs/private-song/",
            secure=True,
        )
        self.assertEqual(response.status_code, 404)

    @override_settings(
        DEBUG=True,
        ALLOW_LOCAL_PRIVATE_SONGS=True,
    )
    def test_private_song_accessible_locally(self):
        response = self.client.get(
            "/api/songs/private-song/",
            secure=True,
        )
        self.assertEqual(response.status_code, 200)

    @override_settings(
        DEBUG=False,
        ALLOW_LOCAL_PRIVATE_SONGS=True,
    )
    def test_private_song_excluded_from_list(self):
        response = self.client.get(
            "/api/songs/",
            secure=True,
        )

        self.assertEqual(response.status_code, 200)

        slugs = [
            song["slug"]
            for song in response.json()["results"]
        ]

        self.assertIn("public-song", slugs)
        self.assertNotIn("private-song", slugs)
