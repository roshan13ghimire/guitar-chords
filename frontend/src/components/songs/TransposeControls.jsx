
import {
  Minus,
  Plus,
  RotateCcw,
} from 'lucide-react'

const buttonClass = `
  grid size-9 place-items-center
  rounded-md border border-line
  text-muted hover:bg-surface-hover
  hover:text-foreground
`

export default function TransposeControls({
  value,
  onChange,
  preferFlats,
  onPreferFlatsChange,
}) {
  return (
    <div
      className="
        flex flex-wrap items-center
        justify-between gap-4
        border-b border-line py-4
      "
    >
      <div>
        <p className="text-[13px] font-medium">
          Transpose
        </p>

        <p className="mt-1 text-xs text-muted">
          Change the song key
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={value <= -11}
          onClick={() => onChange(value - 1)}
          aria-label="Transpose down one semitone"
          className={buttonClass}
        >
          <Minus size={16} />
        </button>

        <span
          aria-live="polite"
          className="
            min-w-8 text-center
            font-mono text-sm
          "
        >
          {value > 0 ? `+${value}` : value}
        </span>

        <button
          type="button"
          disabled={value >= 11}
          onClick={() => onChange(value + 1)}
          aria-label="Transpose up one semitone"
          className={buttonClass}
        >
          <Plus size={16} />
        </button>

        <button
          type="button"
          aria-label={
            preferFlats
              ? 'Use sharp chord names'
              : 'Use flat chord names'
          }
          title="Switch between sharps and flats"
          onClick={() =>
            onPreferFlatsChange(!preferFlats)
          }
          className={buttonClass}
        >
          <span className="font-mono text-sm">
            {preferFlats ? '♭' : '♯'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChange(0)}
          disabled={value === 0}
          aria-label="Reset original key"
          title="Reset original key"
          className={buttonClass}
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  )
}
