
import { Search, X } from 'lucide-react'

export default function ChordSearch({
  value,
  onChange,
}) {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-lg border border-line
        bg-surface px-4
        focus-within:border-accent
      "
    >
      <Search
        size={19}
        strokeWidth={1.7}
        className="shrink-0 text-muted"
      />

      <input
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Search chords, e.g. Am, G, D7..."
        aria-label="Search guitar chords"
        className="
          min-w-0 flex-1 bg-transparent
          py-3.5 text-sm text-foreground
          outline-none placeholder:text-muted
          focus-visible:outline-none
          [&::-webkit-search-cancel-button]:hidden
        "
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear chord search"
          className="p-1 text-muted hover:text-foreground"
        >
          <X size={17} />
        </button>
      )}
    </div>
  )
}
