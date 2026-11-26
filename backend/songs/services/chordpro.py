
import re
from dataclasses import dataclass, field


METADATA_PATTERN = re.compile(
    r"^\s*\{([a-zA-Z_]+)\s*:\s*(.*?)\}\s*$"
)

CHORD_PATTERN = re.compile(
    r"\[([^\[\]\n]+)\]"
)


METADATA_ALIASES = {
    "t": "title",
    "title": "title",
    "artist": "artist",
    "key": "musical_key",
    "capo": "capo",
    "language": "language",
    "difficulty": "difficulty",
    "tuning": "tuning",
    "alternate_title": "alternate_title",
    "strumming": "strumming_pattern",
    "source": "source_url",
    "rights": "rights_status",
    "rights_notes": "rights_notes",
}


LANGUAGE_ALIASES = {
    "ne": "ne",
    "nepali": "ne",
    "hi": "hi",
    "hindi": "hi",
    "en": "en",
    "english": "en",
}


@dataclass
class ParsedSong:

    title: str
    artist: str
    language: str
    content: str

    alternate_title: str = ""
    musical_key: str = ""
    capo: int = 0
    difficulty: str = "beginner"
    tuning: str = "E A D G B E"
    strumming_pattern: str = ""
    source_url: str = ""
    rights_status: str = "unknown"
    rights_notes: str = ""

    chords: list[str] = field(default_factory=list)


class ChordProParseError(ValueError):
    pass


def extract_chords(content: str) -> list[str]:

    chords = set()

    for match in CHORD_PATTERN.findall(content):

        chord = match.strip()

        chord = (
            chord.replace("♯", "#")
            .replace("♭", "b")
        )

        if chord:
            chords.add(chord)

    return sorted(chords)


def parse_chordpro(raw_content: str) -> ParsedSong:

    metadata = {}
    content_lines = []

    for line in raw_content.splitlines():

        stripped_line = line.strip()

        # Ignore ChordPro comment lines.
        if stripped_line.startswith("#"):
            continue

        match = METADATA_PATTERN.match(line)

        if match:
            key, value = match.groups()
            key = key.lower()

            if key in METADATA_ALIASES:
                metadata[METADATA_ALIASES[key]] = value.strip()
                continue

        # Preserve verse, chorus and other directives.
        content_lines.append(line)

    title = metadata.get("title", "").strip()
    artist = metadata.get("artist", "").strip()

    if not title:
        raise ChordProParseError("Song title is required.")

    if not artist:
        raise ChordProParseError("Artist name is required.")

    language_value = metadata.get(
        "language", ""
    ).lower()

    language = LANGUAGE_ALIASES.get(language_value)

    if not language:
        raise ChordProParseError(
            "Language must be Nepali, Hindi or English."
        )

    try:
        capo = int(metadata.get("capo", "0"))

    except ValueError as exc:
        raise ChordProParseError(
            "Capo must be an integer."
        ) from exc

    if not 0 <= capo <= 12:
        raise ChordProParseError(
            "Capo must be between 0 and 12."
        )

    content = "\n".join(content_lines).strip()

    if not content:
        raise ChordProParseError(
            "Song content cannot be empty."
        )

    chords = extract_chords(content)

    if not chords:
        raise ChordProParseError(
            "No inline guitar chords were found."
        )

    return ParsedSong(
        title=title,
        artist=artist,
        language=language,
        content=content,
        alternate_title=metadata.get(
            "alternate_title", ""
        ),
        musical_key=metadata.get("musical_key", ""),
        capo=capo,
        difficulty=metadata.get(
            "difficulty", "beginner"
        ).lower(),
        tuning=metadata.get(
            "tuning", "E A D G B E"
        ),
        strumming_pattern=metadata.get(
            "strumming_pattern", ""
        ),
        source_url=metadata.get("source_url", ""),
        rights_status=metadata.get(
            "rights_status", "unknown"
        ).lower(),
        rights_notes=metadata.get("rights_notes", ""),
        chords=chords,
    )
