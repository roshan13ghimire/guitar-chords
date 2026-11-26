
const EQUIVALENT_NOTES = {
  'C#': 'Db',
  Db: 'C#',
  'D#': 'Eb',
  Eb: 'D#',
  'F#': 'Gb',
  Gb: 'F#',
  'G#': 'Ab',
  Ab: 'G#',
  'A#': 'Bb',
  Bb: 'A#',
  'B#': 'C',
  Cb: 'B',
  'E#': 'F',
  Fb: 'E',
}

export function findChord(name, chords = []) {
  const exact = chords.find(
    chord => chord.name === name
  )

  if (exact) return exact

  const match = name.match(
    /^([A-G][#b]?)(.*)$/
  )

  if (!match) return null

  const [, root, suffix] = match

  const equivalent = EQUIVALENT_NOTES[root]

  if (!equivalent) return null

  return chords.find(
    chord => chord.name === equivalent + suffix
  ) || null
}
