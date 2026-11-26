
import { Minus, Plus } from 'lucide-react'

export default function ReaderSettings({
  preferences,
}) {
  const {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    minFontSize,
    maxFontSize,
  } = preferences

  const buttonClass = `
    grid size-9 place-items-center
    rounded-md border border-line
    text-muted hover:bg-surface-hover
  `

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-xs text-muted">
        Text size
      </span>

      <button
        type="button"
        onClick={decreaseFontSize}
        disabled={fontSize <= minFontSize}
        aria-label="Decrease lyrics font size"
        className={buttonClass}
      >
        <Minus size={15} />
      </button>

      <span
        aria-live="polite"
        className="min-w-6 text-center text-xs"
      >
        {fontSize}
      </span>

      <button
        type="button"
        onClick={increaseFontSize}
        disabled={fontSize >= maxFontSize}
        aria-label="Increase lyrics font size"
        className={buttonClass}
      >
        <Plus size={15} />
      </button>
    </div>
  )
}
