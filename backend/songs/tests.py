
from django.test import SimpleTestCase

from songs.services.chordpro import (
    ChordProParseError,
    extract_chords,
    parse_chordpro,
)


class ChordProParserTests(SimpleTestCase):

    def test_extract_unique_chords(self):

        content = "[G]Hello [D]world [G]again"

        self.assertEqual(
            extract_chords(content),
            ["D", "G"],
        )

    def test_normalize_sharp_and_flat_symbols(self):

        content = "[F♯m]Hello [B♭]world"

        self.assertEqual(
            extract_chords(content),
            ["Bb", "F#m"],
        )

    def test_parse_valid_song(self):

        content = """
{title: Test Song}
{artist: Test Artist}
{language: Nepali}
{key: G}
{capo: 2}
[G]Hello [D]world
"""

        song = parse_chordpro(content)

        self.assertEqual(song.title, "Test Song")
        self.assertEqual(song.artist, "Test Artist")
        self.assertEqual(song.language, "ne")
        self.assertEqual(song.musical_key, "G")
        self.assertEqual(song.capo, 2)
        self.assertEqual(song.chords, ["D", "G"])

    def test_missing_title(self):

        content = """
{artist: Test Artist}
{language: English}
[G]Hello world
"""

        with self.assertRaises(ChordProParseError):
            parse_chordpro(content)

    def test_missing_artist(self):

        content = """
{title: Test Song}
{language: English}
[G]Hello world
"""

        with self.assertRaises(ChordProParseError):
            parse_chordpro(content)

    def test_invalid_language(self):

        content = """
{title: Test Song}
{artist: Test Artist}
{language: Invalid}
[G]Hello world
"""

        with self.assertRaises(ChordProParseError):
            parse_chordpro(content)

    def test_invalid_capo(self):

        content = """
{title: Test Song}
{artist: Test Artist}
{language: English}
{capo: 15}
[G]Hello world
"""

        with self.assertRaises(ChordProParseError):
            parse_chordpro(content)

    def test_missing_chords(self):

        content = """
{title: Test Song}
{artist: Test Artist}
{language: English}
Hello world
"""

        with self.assertRaises(ChordProParseError):
            parse_chordpro(content)

    def test_unicode_content(self):

        content = """
{title: सानो सपना}
{artist: Test Artist}
{language: Nepali}
[G]सानो सपना [D]मनमा
"""

        song = parse_chordpro(content)

        self.assertEqual(song.title, "सानो सपना")
        self.assertIn("मनमा", song.content)

    def test_preserve_section_directives(self):

        content = """
{title: Test Song}
{artist: Test Artist}
{language: English}
{start_of_verse}
[G]Hello world
{end_of_verse}
"""

        song = parse_chordpro(content)

        self.assertIn(
            "{start_of_verse}",
            song.content,
        )

        self.assertIn(
            "{end_of_verse}",
            song.content,
        )
