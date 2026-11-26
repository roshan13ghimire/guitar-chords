
const CATEGORIES = [
  { label: 'All chords', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Major', value: 'major' },
  { label: 'Minor', value: 'minor' },
  { label: 'Seventh', value: 'seventh' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Other', value: 'other' },
]

export default function ChordFilter({
  value,
  onChange,
}) {
  return (
    <div
      role="group"
      aria-label="Filter chord categories"
      className="
        flex items-center gap-5
        overflow-x-auto border-b border-line
        sm:gap-6
      "
    >
      {CATEGORIES.map(category => (
        <button
          key={category.value}
          type="button"
          aria-pressed={value === category.value}
          onClick={() => onChange(category.value)}
          className={`
            shrink-0 whitespace-nowrap
            border-b-2 px-0.5 py-3
            text-[13px] font-medium
            transition-colors
            ${
              value === category.value
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-foreground'
            }
          `}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
