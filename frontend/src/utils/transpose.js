
const SHARP_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F',
  'F#', 'G', 'G#', 'A', 'A#', 'B',
]

const FLAT_NOTES = [
  'C', 'Db', 'D', 'Eb', 'E', 'F',
  'Gb', 'G', 'Ab', 'A', 'Bb', 'B',
]

const NOTE_INDEX = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
}

export function transposeNote(
  note,
  semitones,
  preferFlats = false
) {
  const index = NOTE_INDEX[note]

  if (index === undefined) return note

  const targetIndex =
    ((index + semitones) % 12 + 12) % 12

  const notes = preferFlats
    ? FLAT_NOTES
    : SHARP_NOTES

  return notes[targetIndex]
}

export function transposeChord(
  chord,
  semitones,
  preferFlats = false
) {
  if (!chord || semitones === 0) return chord

  const normalized = chord
    .replaceAll('♯', '#')
    .replaceAll('♭', 'b')

  const match = normalized.match(
    /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/
  )

  if (!match) return chord

  const [, root, quality, bass] = match

  const transposedRoot = transposeNote(
    root,
    semitones,
    preferFlats
  )

  const transposedBass = bass
    ? `/${transposeNote(
        bass,
        semitones,
        preferFlats
      )}`
    : ''

  return (
    transposedRoot +
    quality +
    transposedBass
  )
}

export function transposeChordPro(
  content,
  semitones,
  preferFlats = false
) {
  if (semitones === 0) return content

  return content.replace(
    /\[([^ [\]\n]+)\]/g,
    (_, chord) =>
      `[${transposeChord(
        chord.trim(),
        semitones,
        preferFlats
      )}]`
  )
}

export function extractChordNames(content = '') {
  const matches = [
    ...content.matchAll(/\[([^ [\]\n]+)\]/g),
  ]

  return [
    ...new Set(
      matches.map(match =>
        match[1]
          .trim()
          .replaceAll('♯', '#')
          .replaceAll('♭', 'b')
      )
    ),
  ]
}
