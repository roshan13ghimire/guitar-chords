
import { useEffect, useState } from 'react'

import { getAllChords } from '../services/chordService'
import { findChord } from '../utils/chordLookup'

import ChordSearch from '../components/chords/ChordSearch'
import ChordFilter from '../components/chords/ChordFilter'
import ChordCard from '../components/chords/ChordCard'
import ChordGuide from '../components/chords/ChordGuide'
import ChordDialog from '../components/chords/ChordDialog'

import Loading from '../components/ui/Loading'
import EmptyState from '../components/ui/EmptyState'

const BEGINNER_CHORDS = [
  'A', 'Am', 'C', 'D',
  'Dm', 'E', 'Em', 'G',
]

function normalizeSearch(value) {
  return value
    .trim()
    .replaceAll('♯', '#')
    .replaceAll('♭', 'b')
}

export default function LearnChords() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedChord, setSelectedChord] = useState(null)

  const [result, setResult] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    document.title = 'Learn Chords — Guitar Chords'

    return () => {
      document.title =
        'Guitar Chords — A personal songbook'
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadChords() {
      try {
        const chords = await getAllChords(
          controller.signal
        )

        if (!controller.signal.aborted) {
          setResult({
            attempt,
            chords,
            error: '',
          })
        }
      } catch {
        if (!controller.signal.aborted) {
          setResult({
            attempt,
            chords: [],
            error: 'Unable to load the chord library.',
          })
        }
      }
    }

    loadChords()

    return () => controller.abort()
  }, [attempt])

  const loading = result?.attempt !== attempt

  const error = loading ? '' : result?.error

  const chords = result?.chords || []

  const query = normalizeSearch(search)

  const equivalentChord = query
    ? findChord(
        query.charAt(0).toUpperCase() + query.slice(1),
        chords
      )
    : null

  const filteredChords = chords.filter(chord => {
    const matchesCategory =
      category === 'all' ||
      (
        category === 'beginner'
          ? BEGINNER_CHORDS.includes(chord.name)
          : chord.category === category
      )

    const matchesSearch =
      !query ||
      chord.name.toLowerCase().includes(
        query.toLowerCase()
      ) ||
      chord.category_display.toLowerCase().includes(
        query.toLowerCase()
      ) ||
      chord.id === equivalentChord?.id

    return matchesCategory && matchesSearch
  })

  function clearFilters() {
    setSearch('')
    setCategory('all')
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
          Learn chords
        </h1>

        <p className="mt-2 text-sm text-muted">
          Find the right shape for every chord.
        </p>
      </div>

      <div className="mt-7">
        <ChordSearch
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className="mt-5">
        <ChordFilter
          value={category}
          onChange={setCategory}
        />
      </div>

      <div className="mt-6">
        <ChordGuide />
      </div>

      <div
        className="
          mb-4 mt-6 flex items-center
          justify-between gap-3
        "
      >
        <p
          aria-live="polite"
          className="text-xs text-muted"
        >
          {loading
            ? 'Loading...'
            : `${filteredChords.length} chord shapes`}
        </p>

        <span className="text-xs text-muted">
          Standard tuning
        </span>
      </div>

      {loading ? (
        <Loading message="Loading chords..." />
      ) : error ? (
        <div
          role="alert"
          className="py-14 text-center"
        >
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
      ) : filteredChords.length === 0 ? (
        <EmptyState
          title="No chords found"
          description="Try a different chord name or category."
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
              View all chords
            </button>
          }
        />
      ) : (
        <div
          className="
            grid grid-cols-2 gap-3
            sm:grid-cols-3 sm:gap-4
            lg:grid-cols-4
          "
        >
          {filteredChords.map(chord => (
            <ChordCard
              key={chord.id}
              chord={chord}
              onSelect={setSelectedChord}
            />
          ))}
        </div>
      )}

      {selectedChord && (
        <ChordDialog
          name={selectedChord.name}
          chord={selectedChord}
          loading={false}
          error={false}
          onClose={() => setSelectedChord(null)}
        />
      )}
    </section>
  )
}
