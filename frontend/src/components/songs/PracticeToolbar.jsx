
import {
  Minus,
  Plus,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'

const buttonClass = `
  grid size-10 shrink-0 place-items-center
  rounded-md border border-line
  text-muted hover:bg-surface-hover
  hover:text-foreground
`

export default function PracticeToolbar({
  autoScroll,
}) {
  const {
    playing,
    speed,
    toggle,
    restart,
    increaseSpeed,
    decreaseSpeed,
    minSpeed,
    maxSpeed,
  } = autoScroll

  return (
    <div
      className="
        fixed inset-x-0 bottom-0 z-40
        border-t border-line bg-surface
      "
    >
      <div
        className="
          reader-container flex flex-wrap
          items-center justify-between
          gap-3 py-3
          pb-[max(0.75rem,env(safe-area-inset-bottom))]
        "
      >
        <div>
          <p className="text-[13px] font-medium">
            Auto-scroll
          </p>

          <p className="mt-1 text-xs text-muted">
            {playing ? 'Playing' : 'Paused'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={restart}
            aria-label="Restart from beginning"
            title="Restart from beginning"
            className={buttonClass}
          >
            <RotateCcw size={16} />
          </button>

          <div className="mx-1 h-6 w-px bg-line" />

          <button
            type="button"
            onClick={decreaseSpeed}
            disabled={speed <= minSpeed}
            aria-label="Decrease scroll speed"
            className={buttonClass}
          >
            <Minus size={16} />
          </button>

          <span
            aria-live="polite"
            className="
              min-w-6 text-center
              font-mono text-sm
            "
          >
            {speed}
          </span>

          <button
            type="button"
            onClick={increaseSpeed}
            disabled={speed >= maxSpeed}
            aria-label="Increase scroll speed"
            className={buttonClass}
          >
            <Plus size={16} />
          </button>

          <button
            type="button"
            onClick={toggle}
            className="
              ml-1 flex h-10 min-w-22.5
              items-center justify-center
              gap-2 rounded-md
              bg-accent px-3 text-sm font-medium
              text-white dark:text-[#181b19]
              hover:opacity-90
            "
          >
            {playing ? (
              <>
                <Pause size={16} />
                Pause
              </>
            ) : (
              <>
                <Play size={16} />
                Play
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
