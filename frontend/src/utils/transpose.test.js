
import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  transposeChord,
  transposeChordPro,
  extractChordNames,
} from './transpose'

describe('transposeChord', () => {
  it('transposes major chords', () => {
    expect(transposeChord('G', 2)).toBe('A')
  })

  it('preserves minor chord quality', () => {
    expect(transposeChord('Em', 2)).toBe('F#m')
  })

  it('transposes downwards', () => {
    expect(transposeChord('C', -2)).toBe('A#')
  })

  it('wraps across octaves', () => {
    expect(transposeChord('B', 1)).toBe('C')
  })

  it('supports flat input', () => {
    expect(transposeChord('Bb', 2)).toBe('C')
  })

  it('supports flat output', () => {
    expect(
      transposeChord('A', 1, true)
    ).toBe('Bb')
  })

  it('preserves seventh chords', () => {
    expect(transposeChord('Am7', 2)).toBe('Bm7')
  })

  it('supports slash chords', () => {
    expect(transposeChord('G/B', 2)).toBe('A/C#')
  })

  it('preserves extended chords', () => {
    expect(
      transposeChord('Cadd9', 2)
    ).toBe('Dadd9')
  })

  it('preserves original notation at zero', () => {
    expect(transposeChord('Bb', 0)).toBe('Bb')
  })
})

describe('transposeChordPro', () => {
  it('changes chords without changing lyrics', () => {
    expect(
      transposeChordPro(
        '[G]Morning [D]light',
        2
      )
    ).toBe('[A]Morning [E]light')
  })

  it('preserves section directives', () => {
    const content =
      '{start_of_verse}\n[G]Hello\n{end_of_verse}'

    expect(
      transposeChordPro(content, 2)
    ).toBe(
      '{start_of_verse}\n[A]Hello\n{end_of_verse}'
    )
  })

  it('preserves Unicode lyrics', () => {
    expect(
      transposeChordPro('[G]सानो सपना', 2)
    ).toBe('[A]सानो सपना')
  })
})

describe('extractChordNames', () => {
  it('returns unique chords in appearance order', () => {
    expect(
      extractChordNames(
        '[G]Hello [D]world [G]again'
      )
    ).toEqual(['G', 'D'])
  })

  it('handles empty content', () => {
    expect(extractChordNames('')).toEqual([])
  })
})
