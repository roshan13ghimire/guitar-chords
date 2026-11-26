
import { ArrowUpRight } from 'lucide-react'

import ChordDiagram from './ChordDiagram'

export default function ChordCard({
  chord,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(chord)}
      aria-label={`Learn ${chord.name} chord`}
      className="
        group relative flex flex-col
        items-center rounded-lg
        border border-line bg-surface
        p-4 text-left
        transition-colors duration-150
        hover:border-accent
      "
    >
      <ArrowUpRight
        size={15}
        strokeWidth={1.6}
        className="
          absolute right-3 top-3
          text-muted opacity-0
          group-hover:opacity-100
          group-focus-visible:opacity-100
        "
      />

      <span className="font-mono text-lg font-semibold">
        {chord.name}
      </span>

      <span className="mt-1 text-[11px] text-muted">
        {chord.category_display}
      </span>

      <div className="mt-4 w-full max-w-32.5">
        <ChordDiagram
          chord={chord}
          showName={false}
        />
      </div>

      <span className="mt-auto pt-2 text-[11px] text-muted">
        {chord.frets.includes(0)
          ? 'Open strings'
          : `Fret ${chord.base_fret}`}
      </span>
    </button>
  )
}
