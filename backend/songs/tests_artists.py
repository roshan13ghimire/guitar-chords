
from django.test import TestCase

from .models import (
    Artist,
    Song,
    ChordArrangement,
)


class PublicArtistTests(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.artist = Artist.objects.create(
            name="Acoustic Artist",
            bio="An artist creating original practice songs.",
        )

        cls.second_artist = Artist.objects.create(
            name="Second Artist",
        )

        cls.hidden_artist = Artist.objects.create(
            name="Unpublished Artist",
        )

        cls.first_song = Song.objects.create(
            title="First Lesson",
            artist=cls.artist,
            language="ne",
        )

        cls.second_song = Song.objects.create(
            title="Second Lesson",
            artist=cls.artist,
            language="hi",
        )

        cls.private_song = Song.objects.create(
            title="Private Song",
            artist=cls.artist,
            language="en",
        )

        cls.other_song = Song.objects.create(
            title="Another Lesson",
            artist=cls.second_artist,
            language="en",
        )

        cls.hidden_song = Song.objects.create(
            title="Hidden Lesson",
            artist=cls.hidden_artist,
            language="ne",
        )

        def create_arrangement(
            song,
            title,
            difficulty,
            published=True,
        ):
            return ChordArrangement.objects.create(
                song=song,
                title=title,
                original_key="G",
                difficulty=difficulty,
                chord_content="[G]Original practice line",
                source_notes=(
                    "Original authorized test content."
                    if published
                    else ""
                ),
                review_notes="Internal review only.",
                rights_basis=(
                    ChordArrangement.RightsBasis.ORIGINAL
                    if published
                    else ChordArrangement.RightsBasis.UNKNOWN
                ),
                publication_status=(
                    ChordArrangement.PublicationStatus.PUBLISHED
                    if published
                    else ChordArrangement.PublicationStatus.DRAFT
                ),
                is_verified=published,
            )

        create_arrangement(
            cls.first_song,
            "Beginner",
            "beginner",
        )

        create_arrangement(
            cls.first_song,
            "Alternative",
            "intermediate",
        )

        create_arrangement(
            cls.first_song,
            "Private Advanced",
            "advanced",
            published=False,
        )

        create_arrangement(
            cls.second_song,
            "Standard",
            "intermediate",
        )

        create_arrangement(
            cls.private_song,
            "Draft",
            "beginner",
            published=False,
        )

        create_arrangement(
            cls.other_song,
            "Standard",
            "beginner",
        )

        create_arrangement(
            cls.hidden_song,
            "Draft",
            "beginner",
            published=False,
        )

    def test_artist_directory_only_shows_public_artists(self):
        response = self.client.get("/api/artists/")

        self.assertEqual(response.status_code, 200)

        names = [
            artist["name"]
            for artist in response.json()
        ]

        self.assertEqual(
            names,
            ["Acoustic Artist", "Second Artist"],
        )

    def test_published_song_count_is_distinct(self):
        response = self.client.get("/api/artists/")

        artists = {
            item["name"]: item
            for item in response.json()
        }

        self.assertEqual(
            artists["Acoustic Artist"][
                "published_song_count"
            ],
            2,
        )

        self.assertEqual(
            artists["Second Artist"][
                "published_song_count"
            ],
            1,
        )

    def test_artist_detail_has_published_songs_only(self):
        response = self.client.get(
            f"/api/artists/{self.artist.pk}/"
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()

        self.assertEqual(
            data["name"],
            "Acoustic Artist",
        )

        self.assertEqual(
            data["published_song_count"],
            2,
        )

        self.assertEqual(
            [song["title"] for song in data["songs"]],
            ["First Lesson", "Second Lesson"],
        )

    def test_artist_song_difficulties_are_public_only(self):
        response = self.client.get(
            f"/api/artists/{self.artist.pk}/"
        )

        first = response.json()["songs"][0]

        self.assertEqual(
            first["difficulties"],
            ["beginner", "intermediate"],
        )

        self.assertNotIn(
            "advanced",
            first["difficulties"],
        )

    def test_artist_with_only_drafts_is_hidden(self):
        response = self.client.get(
            f"/api/artists/{self.hidden_artist.pk}/"
        )

        self.assertEqual(
            response.status_code,
            404,
        )

    def test_missing_artist_returns_404(self):
        response = self.client.get(
            "/api/artists/99999999/"
        )

        self.assertEqual(
            response.status_code,
            404,
        )

    def test_private_notes_not_in_artist_response(self):
        response = self.client.get(
            f"/api/artists/{self.artist.pk}/"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        data = response.json()

        self.assertNotIn(
            "source_notes",
            str(data),
        )

        self.assertNotIn(
            "review_notes",
            str(data),
        )

        self.assertNotIn(
            "chord_content",
            str(data),
        )

    def test_artist_filter_matches_artist_profile(self):
        detail = self.client.get(
            f"/api/artists/{self.artist.pk}/"
        ).json()

        filtered = self.client.get(
            f"/api/songs/?artist={self.artist.pk}"
        ).json()

        detail_ids = {
            item["id"]
            for item in detail["songs"]
        }

        filtered_ids = {
            item["id"]
            for item in filtered
        }

        self.assertEqual(
            detail_ids,
            filtered_ids,
        )

    def test_artist_endpoints_are_read_only(self):
        response = self.client.post(
            "/api/artists/",
            {
                "name": "Unauthorized Artist",
            },
        )

        self.assertEqual(
            response.status_code,
            405,
        )
