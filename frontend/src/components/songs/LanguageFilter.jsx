
import { Heart } from 'lucide-react'

const filters = [
  { label: 'All songs', value: '' },
  { label: 'Nepali', value: 'ne' },
  { label: 'Hindi', value: 'hi' },
  { label: 'English', value: 'en' },
  { label: 'Saved', value: 'saved' },
]

export default function LanguageFilter({
  value,
  onChange,
}) {
  return (
    <div
      aria-label="Filter songs"
      className="
        flex items-center gap-5
        overflow-x-auto border-b border-line
        sm:gap-7
      "
    >
      {filters.map(filter => (
        <button
          key={filter.value}
          type="button"
          aria-pressed={value === filter.value}
          onClick={() => onChange(filter.value)}
          className={`
            -mb-px flex shrink-0 items-center
            gap-1.5 whitespace-nowrap
            border-b-2 px-0.5 py-3
            text-[13px] font-medium
            transition-colors
            ${
              value === filter.value
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-foreground'
            }
          `}
        >
          {filter.value === 'saved' && (
            <Heart size={14} strokeWidth={1.8} />
          )}

          {filter.label}
        </button>
      ))}
    </div>
  )
}
