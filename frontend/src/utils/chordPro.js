
const SECTION_NAMES = {
  start_of_verse: 'Verse',
  sov: 'Verse',
  start_of_chorus: 'Chorus',
  soc: 'Chorus',
  start_of_bridge: 'Bridge',
  sob: 'Bridge',
  start_of_tab: 'Tab',
  sot: 'Tab',
}

export function normalizeChord(chord) {
  return chord
    .trim()
    .replaceAll('♯', '#')
    .replaceAll('♭', 'b')
}

export function parseChordLine(line) {
  const segments = []
  const pattern = /\[([^\[\]\n]+)\]/g

  let cursor = 0
  let currentChord = ''

  for (const match of line.matchAll(pattern)) {
    const lyrics = line.slice(cursor, match.index)

    if (lyrics || currentChord) {
      segments.push({
        chord: currentChord,
        lyrics,
      })
    }

    currentChord = normalizeChord(match[1])
    cursor = match.index + match[0].length
  }

  const remainingLyrics = line.slice(cursor)

  if (remainingLyrics || currentChord) {
    segments.push({
      chord: currentChord,
      lyrics: remainingLyrics,
    })
  }

  return segments
}

export function parseChordSheet(content = '') {
  return content.split(/\r?\n/).flatMap(line => {
    const trimmed = line.trim()

    if (!trimmed) {
      return [{ type: 'space' }]
    }

    if (trimmed.startsWith('#')) {
      return []
    }

    const directive = trimmed.match(
      /^\{([^}:]+)(?::\s*(.*))?\}$/
    )

    if (directive) {
      const name = directive[1].trim().toLowerCase()
      const value = directive[2]?.trim()

      if (SECTION_NAMES[name]) {
        return [{
          type: 'section',
          text: value || SECTION_NAMES[name],
        }]
      }

      if (['comment', 'c'].includes(name)) {
        return [{
          type: 'comment',
          text: value || '',
        }]
      }

      return []
    }

    return [{
      type: 'lyrics',
      segments: parseChordLine(line),
    }]
  })
}
