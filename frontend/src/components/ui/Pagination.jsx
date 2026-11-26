
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export default function Pagination({
  page,
  totalPages,
  onChange,
}) {
  if (totalPages <= 1) {
    return null
  }

  const buttonClass = `
    grid size-9 place-items-center
    rounded-md border border-line
    text-muted hover:bg-surface-hover
  `

  return (
    <nav
      aria-label="Song pagination"
      className="
        mt-7 flex items-center
        justify-between gap-4
      "
    >
      <p className="text-xs text-muted">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
          className={buttonClass}
        >
          <ChevronLeft size={17} />
        </button>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
          className={buttonClass}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </nav>
  )
}
