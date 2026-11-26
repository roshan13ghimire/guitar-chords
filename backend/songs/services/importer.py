
from dataclasses import dataclass
from hashlib import sha256

from django.db import transaction
from django.utils.text import slugify

from chords.models import Chord
from songs.models import Artist, Song

from .chordpro import ParsedSong


@dataclass
class ImportResult:

    song: Song
    created: bool
    missing_chords: list[str]


def generate_unique_slug(
    model,
    value: str,
    max_length: int,
) -> str:

    base_slug = slugify(
        value,
        allow_unicode=True,
    )

    if not base_slug:
        base_slug = sha256(
            value.encode("utf-8")
        ).hexdigest()[:12]

    base_slug = base_slug[:max_length].strip("-")

    slug = base_slug
    counter = 2

    while model.objects.filter(slug=slug).exists():

        suffix = f"-{counter}"

        slug = (
            base_slug[:max_length - len(suffix)]
            + suffix
        )

        counter += 1

    return slug


@transaction.atomic
def import_song(
    parsed: ParsedSong,
    publish: bool = False,
) -> ImportResult:

    artist = Artist.objects.filter(
        name__iexact=parsed.artist
    ).first()

    if artist is None:

        artist = Artist(
            name=parsed.artist,
            slug=generate_unique_slug(
                Artist,
                parsed.artist,
                180,
            ),
        )

        artist.full_clean()
        artist.save()

    existing_song = Song.objects.filter(
        artist=artist,
        title__iexact=parsed.title,
    ).first()

    if existing_song is not None:

        return ImportResult(
            song=existing_song,
            created=False,
            missing_chords=[],
        )

    song = Song(
        artist=artist,
        title=parsed.title,
        slug=generate_unique_slug(
            Song,
            parsed.title,
            250,
        ),
        alternate_title=parsed.alternate_title,
        language=parsed.language,
        musical_key=parsed.musical_key,
        capo=parsed.capo,
        difficulty=parsed.difficulty,
        tuning=parsed.tuning,
        strumming_pattern=parsed.strumming_pattern,
        chordpro_content=parsed.content,
        source_url=parsed.source_url,
        rights_status=parsed.rights_status,
        rights_notes=parsed.rights_notes,
        is_published=publish,
    )

    song.full_clean()
    song.save()

    known_chords = list(
        Chord.objects.filter(
            name__in=parsed.chords
        )
    )

    song.chords.add(*known_chords)

    known_names = {
        chord.name for chord in known_chords
    }

    missing_chords = sorted(
        set(parsed.chords) - known_names
    )

    return ImportResult(
        song=song,
        created=True,
        missing_chords=missing_chords,
    )
