
import { useEffect, useState } from 'react'

import { getSongs } from '../services/songService'

import useDebounce from '../hooks/useDebounce'
import useFavorites from '../hooks/useFavorites'

import SongSearch from '../components/songs/SongSearch'
import LanguageFilter from '../components/songs/LanguageFilter'
import SongRow from '../components/songs/SongRow'

import Loading from '../components/ui/Loading'
import EmptyState from '../components/ui/EmptyState'
import Pagination from '../components/ui/Pagination'

const PAGE_SIZE = 20

const sortOptions = [
  { value: 'title', label: 'Title A–Z' },
  { value: '-title', label: 'Title Z–A' },
  { value: '-created_at', label: 'Recently added' },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState('')
  const [ordering, setOrdering] = useState('title')
  const [page, setPage] = useState(1)
  const [attempt, setAttempt] = useState(0)

  const [result, setResult] = useState(null)

  const debouncedSearch = useDebounce(search)

  const {
    favorites,
    isFavorite,
    toggleFavorite,
  } = useFavorites()

  const savedOnly = language === 'saved'

  const requestKey = JSON.stringify([
    debouncedSearch,
    language,
    ordering,
    page,
    attempt,
  ])

  useEffect(() => {
    const controller = new AbortController()

    async function loadSongs() {
      try {
        const params = {
          ordering,
          page: savedOnly ? 1 : page,
        }

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim()
        }

        if (language && !savedOnly) {
          params.language = language
        }

        const data = await getSongs(
          params,
          controller.signal
        )

        let songs = data.results

        // Saved songs can exist on any API page.
        if (savedOnly) {
          let next = data.next
          let nextPage = 2

          while (next) {
            const nextData = await getSongs(
              { ...params, page: nextPage },
              controller.signal
            )

            songs = [...songs, ...nextData.results]
            next = nextData.next
            nextPage += 1
          }
        }

        if (!controller.signal.aborted) {
          setResult({
            key: requestKey,
            songs,
            count: data.count,
            error: '',
          })
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult({
            key: requestKey,
            songs: [],
            count: 0,
            error: 'Unable to load songs. Please try again.',
          })
        }
      }
    }

    loadSongs()

    return () => controller.abort()
  }, [
    requestKey,
    debouncedSearch,
    language,
    ordering,
    page,
    savedOnly,
  ])

  const loading =
    result?.key !== requestKey ||
    search !== debouncedSearch

  const error = loading ? '' : result?.error

  const songs = savedOnly
    ? (result?.songs || []).filter(
        song => favorites.includes(song.slug)
      )
    : result?.songs || []

  const count = savedOnly
    ? songs.length
    : result?.count || 0

  const totalPages = Math.max(
    1,
    Math.ceil(count / PAGE_SIZE)
  )

  function handleSearch(value) {
    setSearch(value)
    setPage(1)
  }

  function handleLanguage(value) {
    setLanguage(value)
    setPage(1)
  }

  function handleOrdering(event) {
    setOrdering(event.target.value)
    setPage(1)
  }

  function clearFilters() {
    setSearch('')
    setLanguage('')
    setOrdering('title')
    setPage(1)
  }

  return (
    <section className="site-container py-9 sm:py-12">
      <div>
        <h1
          className="
            text-[28px] font-semibold
            tracking-tight sm:text-[32px]
          "
        >
          Song library
        </h1>

        <p className="mt-2 text-sm text-muted">
          Find a song and start playing.
        </p>
      </div>

      <div className="mt-7">
        <SongSearch
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className="mt-5">
        <LanguageFilter
          value={language}
          onChange={handleLanguage}
        />
      </div>

      <div
        className="
          flex items-center justify-between
          gap-3 border-b border-line py-4
        "
      >
        <p
          aria-live="polite"
          className="text-xs text-muted"
        >
          {loading
            ? 'Loading...'
            : `${count} ${count === 1 ? 'song' : 'songs'}`}
        </p>

        <select
          value={ordering}
          onChange={handleOrdering}
          aria-label="Sort songs"
          className="
            cursor-pointer rounded
            bg-transparent px-2 py-1
            text-xs text-muted
          "
        >
          {sortOptions.map(option => (
            <option
              key={option.value}
              value={option.value}
              className="bg-surface text-foreground"
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loading message="Loading songs..." />
      ) : error ? (
        <div role="alert" className="py-14 text-center">
          <p className="text-sm text-danger">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setAttempt(value => value + 1)}
            className="
              mt-4 rounded-md border border-line
              px-4 py-2 text-sm
              hover:bg-surface-hover
            "
          >
            Try again
          </button>
        </div>
      ) : songs.length === 0 ? (
        <EmptyState
          title={
            savedOnly && !search
              ? 'No saved songs yet'
              : 'No songs found'
          }
          description={
            savedOnly && !search
              ? 'Tap the heart beside a song to save it here.'
              : 'Try another title, artist or language.'
          }
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="
                rounded-md border border-line
                px-4 py-2 text-sm
                hover:bg-surface-hover
              "
            >
              Browse all songs
            </button>
          }
        />
      ) : (
        <>
          <div>
            {songs.map(song => (
              <SongRow
                key={song.id}
                song={song}
                favorite={isFavorite(song.slug)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>

          {!savedOnly && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
            />
          )}
        </>
      )}
    </section>
  )
}
