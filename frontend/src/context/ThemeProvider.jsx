import { useEffect, useState } from 'react'
import { ThemeContext } from './themeContext'

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(
      'guitar-chords-theme'
    )

    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme
    }
  } catch {
    // Storage may be unavailable.
  }

  return window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches
    ? 'dark'
    : 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    try {
      localStorage.setItem('guitar-chords-theme', theme)
    } catch {
      // Theme still works without browser storage.
    }
  }, [theme])

  function toggleTheme() {
    setTheme(current =>
      current === 'light' ? 'dark' : 'light'
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}