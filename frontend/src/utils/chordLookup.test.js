
import { describe, expect, it } from 'vitest'

import { findChord } from './chordLookup'

const chords = [
  { id: 1, name: 'C' },
  { id: 2, name: 'F#m' },
  { id: 3, name: 'A#' },
  { id: 4, name: 'D#7' },
]

describe('findChord', () => {
  it('finds an exact chord name', () => {
    expect(findChord('C', chords)).toEqual(
      chords[0]
    )
  })

  it('finds equivalent minor chords', () => {
    expect(findChord('Gbm', chords)).toEqual(
      chords[1]
    )
  })

  it('finds equivalent flat chords', () => {
    expect(findChord('Bb', chords)).toEqual(
      chords[2]
    )
  })

  it('preserves seventh chord quality', () => {
    expect(findChord('Eb7', chords)).toEqual(
      chords[3]
    )
  })

  it('returns null for unavailable chords', () => {
    expect(
      findChord('Cmaj9', chords)
    ).toBeNull()
  })

  it('handles an empty chord library', () => {
    expect(findChord('C', [])).toBeNull()
  })
})
