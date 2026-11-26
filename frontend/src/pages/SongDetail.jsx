
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Heart } from 'lucide-react'

import { getSong } from '../services/songService'

import useFavorites from '../hooks/useFavorites'
import useAutoScroll from '../hooks/useAutoScroll'
import useReaderPreferences from '../hooks/useReaderPreferences'

import Loading from '../components/ui/Loading'
import ChordSheet from '../components/songs/ChordSheet'
import SongMetadata from '../components/songs/SongMetadata'
import ReaderSettings from '../components/songs/ReaderSettings'
import PracticeToolbar from '../components/songs/PracticeToolbar'


import TransposeControls from '../components/songs/TransposeControls'
import ChordDialog from '../components/chords/ChordDialog'

import { getAllChords } from '../services/chordService'

import {
  transposeChord,
  transposeChordPro,
  extractChordNames,
} from '../utils/transpose'

import { findChord } from '../utils/chordLookup'


function SongReader({ song }) {
  const autoScroll = useAutoScroll()
  const preferences = useReaderPreferences()

  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites()

  const favorite = isFavorite(song.slug)

const [transpose, setTranspose] = useState(0)

const [preferFlats, setPreferFlats] = useState(false)

const [selectedChord, setSelectedChord] = useState(null)

const [chordLibrary, setChordLibrary] = useState([])

const [chordsLoading, setChordsLoading] = useState(true)

const [chordsError, setChordsError] = useState(false)


useEffect(() => {
  const controller = new AbortController()

  async function loadChordLibrary() {
    try {
      const data = await getAllChords(
        controller.signal
      )

      if (!controller.signal.aborted) {
        setChordLibrary(data)
      }
    } catch {
      if (!controller.signal.aborted) {
        setChordsError(true)
      }
    } finally {
      if (!controller.signal.aborted) {
        setChordsLoading(false)
      }
    }
  }

  loadChordLibrary()

  return () => controller.abort()
}, [])

  useEffect(() => {
    document.title = `${song.title} — Guitar Chords`

    return () => {
      document.title = 'Guitar Chords — A personal songbook'
    }
  }, [song.title])

const displayedContent = transposeChordPro(
  song.chordpro_content,
  transpose,
  preferFlats
)

const displayedKey = transposeChord(
  song.musical_key,
  transpose,
  preferFlats
)

const displayedChords = extractChordNames(
  displayedContent
)

const selectedChordData = selectedChord
  ? findChord(selectedChord, chordLibrary)
  : null

function handleChordClick(name) {
  autoScroll.pause()
  setSelectedChord(name)
}


  return (
    <section
      className="
        reader-container pt-8 pb-36
        sm:pt-12 sm:pb-28
      "
    >
      <Link
        to="/"
        className="
          inline-flex items-center gap-2
          text-[13px] text-muted
          hover:text-accent
        "
      >
        <ArrowLeft size={16} strokeWidth={1.7} />
        All songs
      </Link>

      <div className="mt-7 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="
              break-words text-[28px]
              font-semibold tracking-tight
              sm:text-[34px]
            "
          >
            {song.title}
          </h1>

          <p className="mt-2 text-sm text-muted">
            {song.artist.name}
            {' · '}
            {song.language_display}
          </p>
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(song.slug)}
          aria-pressed={favorite}
          aria-label={
            favorite
              ? 'Remove from saved songs'
              : 'Save song'
          }
          className="
            grid size-10 shrink-0
            place-items-center rounded-md
            border border-line
            text-muted hover:text-accent
          "
        >
          <Heart
            size={19}
            strokeWidth={1.7}
            className={
              favorite
                ? 'fill-accent text-accent'
                : ''
            }
          />
        </button>
      </div>

      <div className="mt-7">
       <SongMetadata
  song={{
    ...song,
    musical_key: displayedKey,
  }}
/>
      </div>

<TransposeControls
  value={transpose}
  onChange={value => {
    autoScroll.pause()
    setTranspose(value)
  }}
  preferFlats={preferFlats}
  onPreferFlatsChange={setPreferFlats}
/>


      
{displayedChords.length > 0 && (
  <div className="mt-6">
    <p className="text-xs font-medium text-muted">
      Chords used
    </p>

    <div className="mt-3 flex flex-wrap gap-2">
      {displayedChords.map(chord => (
        <button
          key={chord}
          type="button"
          onClick={() => handleChordClick(chord)}
          aria-label={`View ${chord} chord diagram`}
          className="
            rounded-md bg-accent-soft
            px-3 py-2 font-mono
            text-sm font-medium text-accent
            hover:opacity-80
          "
        >
          {chord}
        </button>
      ))}
    </div>
  </div>
)}


      <div
        className="
          mt-7 flex flex-wrap
          items-center justify-between
          gap-4 border-b border-line pb-4
        "
      >
        <div>
          {song.strumming_pattern && (
            <>
              <p className="text-xs text-muted">
                Strumming pattern
              </p>

              <p className="mt-1.5 font-mono text-sm">
                {song.strumming_pattern}
              </p>
            </>
          )}
        </div>

        <ReaderSettings preferences={preferences} />
      </div>

      <div className="mt-8">
        <ChordSheet
          content={song.chordpro_content}
          fontSize={preferences.fontSize}
          onChordClick={handleChordClick}
        />
      </div>

      <div className="mt-10 border-t border-line pt-5">
        <p className="text-xs text-muted">
          End of song
        </p>
      </div>

      <PracticeToolbar autoScroll={autoScroll} />

{selectedChord && (
  <ChordDialog
    name={selectedChord}
    chord={selectedChordData}
    loading={chordsLoading}
    error={chordsError}
    onClose={() => setSelectedChord(null)}
  />
)}

    </section>
  )
}

function SongDetailContent({ slug }) {
  const [song, setSong] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    window.scrollTo(0, 0)

    async function loadSong() {
      try {
        const data = await getSong(
          slug,
          controller.signal
        )

        if (!controller.signal.aborted) {
          setSong(data)
          setError('')
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err.response?.status === 404
              ? 'This song could not be found.'
              : 'Unable to load this song.'
          )
        }
      }
    }

    loadSong()

    return () => controller.abort()
  }, [slug, attempt])

  if (error) {
    return (
      <section className="reader-container py-16">
        <div role="alert" className="text-center">
          <h1 className="text-xl font-semibold">
            Unable to open song
          </h1>

          <p className="mt-3 text-sm text-muted">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/"
              className="
                rounded-md border border-line
                px-4 py-2 text-sm
                hover:bg-surface-hover
              "
            >
              All songs
            </Link>

            <button
              type="button"
              onClick={() => {
                setError('')
                setAttempt(current => current + 1)
              }}
              className="
                rounded-md border border-line
                px-4 py-2 text-sm
                hover:bg-surface-hover
              "
            >
              Try again
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!song) {
    return (
      <div className="reader-container">
        <Loading message="Loading song..." />
      </div>
    )
  }

  return <SongReader song={song} />
}

export default function SongDetail() {
  const { slug } = useParams()

  return (
    <SongDetailContent
      key={slug}
      slug={slug}
    />
  )
}
