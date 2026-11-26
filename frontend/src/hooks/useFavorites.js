
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'guitar-chords-favorites'

function getInitialFavorites() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    )

    return Array.isArray(saved)
      ? saved.filter(item => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

export default function useFavorites() {
  const [favorites, setFavorites] = useState(
    getInitialFavorites
  )

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(favorites)
      )
    } catch {
      // Favorites still work for the current session.
    }
  }, [favorites])

  function toggleFavorite(slug) {
    setFavorites(current =>
      current.includes(slug)
        ? current.filter(item => item !== slug)
        : [...current, slug]
    )
  }

  function isFavorite(slug) {
    return favorites.includes(slug)
  }

  return {
    favorites,
    toggleFavorite,
    isFavorite,
  }
}
