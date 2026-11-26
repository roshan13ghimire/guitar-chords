
import { Link } from 'react-router-dom'
import { ChevronRight, Heart } from 'lucide-react'

export default function SongRow({
  song,
  favorite,
  onToggleFavorite,
}) {
  return (
    <article
      className="
        group flex items-center gap-2
        border-b border-line
        transition-colors
        hover:bg-surface-hover
      "
    >
      <Link
        to={`/songs/${encodeURIComponent(song.slug)}`}
        className="
          flex min-w-0 flex-1
          items-center justify-between
          gap-3 px-2 py-4 sm:px-3
        "
      >
        <div className="min-w-0">
          <h2
            className="
              truncate text-[15px] font-medium
              group-hover:text-accent
            "
          >
            {song.title}
          </h2>

          <p className="mt-1 truncate text-[12px] text-muted">
            {song.artist.name}
            {' · '}
            {song.language_display}
          </p>
        </div>

        <span
          title="Musical key"
          className="
            min-w-8 shrink-0 rounded
            bg-accent-soft px-2 py-1
            text-center font-mono
            text-xs text-accent
          "
        >
          {song.musical_key || '—'}
        </span>
      </Link>

      <button
        type="button"
        onClick={() => onToggleFavorite(song.slug)}
        aria-pressed={favorite}
        aria-label={
          favorite
            ? `Remove ${song.title} from favorites`
            : `Save ${song.title} to favorites`
        }
        className="
          grid size-10 shrink-0
          place-items-center rounded-md
          text-muted hover:text-accent
        "
      >
        <Heart
          size={18}
          strokeWidth={1.7}
          className={
            favorite
              ? 'fill-accent text-accent'
              : ''
          }
        />
      </button>

      <Link
        to={`/songs/${encodeURIComponent(song.slug)}`}
        tabIndex={-1}
        aria-label={`Open ${song.title}`}
        className="px-2 py-4 text-muted"
      >
        <ChevronRight size={16} strokeWidth={1.7} />
      </Link>
    </article>
  )
}
