
import { useEffect, useState } from 'react'

const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 28

function getInitialFontSize() {
  try {
    const saved = Number(
      localStorage.getItem('guitar-chords-font-size')
    )

    if (
      Number.isInteger(saved) &&
      saved >= MIN_FONT_SIZE &&
      saved <= MAX_FONT_SIZE
    ) {
      return saved
    }
  } catch {
    // Use default size.
  }

  return 16
}

export default function useReaderPreferences() {
  const [fontSize, setFontSize] = useState(
    getInitialFontSize
  )

  useEffect(() => {
    try {
      localStorage.setItem(
        'guitar-chords-font-size',
        String(fontSize)
      )
    } catch {
      // Storage is optional.
    }
  }, [fontSize])

  function increaseFontSize() {
    setFontSize(current =>
      Math.min(MAX_FONT_SIZE, current + 2)
    )
  }

  function decreaseFontSize() {
    setFontSize(current =>
      Math.max(MIN_FONT_SIZE, current - 2)
    )
  }

  return {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    minFontSize: MIN_FONT_SIZE,
    maxFontSize: MAX_FONT_SIZE,
  }
}
