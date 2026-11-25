
from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from .models import Artist, Song, ChordArrangement


class SongDiscoveryTests(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.artist_one = Artist.objects.create(
            name="Acoustic Artist"
        )

        cls.artist_two = Artist.objects.create(
            name="Second Artist"
        )

        cls.alpha = Song.objects.create(
            title="Alpha Lesson",
            alternate_title="Pahilo Geet",
            artist=cls.artist_one,
            language="ne",
        )

        cls.mixed = Song.objects.create(
            title="Mixed Practice",
            alternate_title="Roman Mixed",
            artist=cls.artist_one,
            language="ne",
        )

        cls.zebra = Song.objects.create(
            title="Zebra Practice",
            artist=cls.artist_two,
            language="hi",
        )

        cls.hidden = Song.objects.create(
            title="Hidden Draft",
            artist=cls.artist_two,
            language="en",
        )

        def add_arrangement(
            song,
            title,
            difficulty,
            published=True,
        ):
            return ChordArrangement.objects.create(
                song=song,
                title=title,
                original_key="G",
                chord_content="[G]Original practice line",
                difficulty=difficulty,
                publication_status=(
                    "published" if published else "draft"
                ),
                rights_basis=(
                    "original" if published else "unknown"
                ),
                source_notes=(
                    "Original test content."
                    if published else ""
                ),
                is_verified=published,
            )

        add_arrangement(
            cls.alpha, "Beginner", "beginner"
        )

        add_arrangement(
            cls.mixed, "Intermediate", "intermediate"
        )

        # An unpublished beginner version must NOT
        # cause this song to match a beginner filter.
        add_arrangement(
            cls.mixed,
            "Private Beginner",
            "beginner",
            published=False,
        )

        add_arrangement(
            cls.zebra, "Advanced", "advanced"
        )

        add_arrangement(
            cls.hidden,
            "Unpublished",
            "beginner",
            published=False,
        )

    def titles(self, query=""):
        response = self.client.get(
            f"/api/songs/{query}"
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        return [
            item["title"]
            for item in response.json()
        ]

    def test_public_list_excludes_draft_songs(self):
        self.assertEqual(
            self.titles(),
            [
                "Alpha Lesson",
                "Mixed Practice",
                "Zebra Practice",
            ],
        )

        response = self.client.get(
            f"/api/songs/{self.hidden.pk}/"
        )

        self.assertEqual(
            response.status_code,
            404,
        )

    def test_language_filter(self):
        self.assertEqual(
            self.titles("?language=hi"),
            ["Zebra Practice"],
        )

    def test_artist_filter(self):
        self.assertEqual(
            self.titles(
                f"?artist={self.artist_one.pk}"
            ),
            [
                "Alpha Lesson",
                "Mixed Practice",
            ],
        )

    def test_difficulty_ignores_unpublished_versions(self):
        self.assertEqual(
            self.titles("?difficulty=beginner"),
            ["Alpha Lesson"],
        )

        self.assertEqual(
            self.titles("?difficulty=intermediate"),
            ["Mixed Practice"],
        )

    def test_search_by_alternate_title_or_artist(self):
        self.assertEqual(
            self.titles("?search=Pahilo"),
            ["Alpha Lesson"],
        )

        self.assertEqual(
            self.titles("?search=Second%20Artist"),
            ["Zebra Practice"],
        )

    def test_combining_filters(self):
        self.assertEqual(
            self.titles(
                f"?language=ne&artist={self.artist_one.pk}"
                "&difficulty=intermediate"
            ),
            ["Mixed Practice"],
        )

    def test_sorting(self):
        self.assertEqual(
            self.titles("?sort=title_desc"),
            [
                "Zebra Practice",
                "Mixed Practice",
                "Alpha Lesson",
            ],
        )

        Song.objects.filter(
            pk=self.alpha.pk
        ).update(
            created_at=timezone.now() + timedelta(days=1)
        )

        self.assertEqual(
            self.titles("?sort=newest")[0],
            "Alpha Lesson",
        )

    def test_difficulties_exclude_unpublished(self):
        response = self.client.get(
            "/api/songs/?search=Mixed"
        )

        data = response.json()

        self.assertEqual(len(data), 1)

        self.assertEqual(
            data[0]["difficulties"],
            ["intermediate"],
        )

    def test_invalid_filters_return_400(self):
        invalid_queries = [
            "?difficulty=expert",
            "?language=invalid",
            "?artist=abc",
            "?sort=random",
        ]

        for query in invalid_queries:
            with self.subTest(query=query):
                response = self.client.get(
                    f"/api/songs/{query}"
                )

                self.assertEqual(
                    response.status_code,
                    400,
                )
