
import { useState } from 'react'
import { ChevronDown, BookOpen } from 'lucide-react'

export default function ChordGuide() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="
        rounded-lg border border-line
        bg-surface
      "
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="chord-reading-guide"
        onClick={() => setExpanded(value => !value)}
        className="
          flex w-full items-center
          justify-between gap-3
          px-4 py-3.5 text-left
        "
      >
        <div className="flex items-center gap-2.5">
          <BookOpen
            size={17}
            strokeWidth={1.7}
            className="text-accent"
          />

          <span className="text-sm font-medium">
            How to read chord diagrams
          </span>
        </div>

        <ChevronDown
          size={17}
          className={`
            shrink-0 text-muted
            ${expanded ? 'rotate-180' : ''}
          `}
        />
      </button>

      {expanded && (
        <div
          id="chord-reading-guide"
          className="
            space-y-4 border-t border-line
            p-4 text-[13px] leading-relaxed
            text-muted
          "
        >
          <p>
            Vertical lines represent the six guitar
            strings, from the thickest low E string
            to the thinnest high E string.
            Horizontal lines represent frets.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <p>
              <span className="mr-2 font-mono font-semibold text-accent">
                ×
              </span>
              Muted string
            </p>

            <p>
              <span className="mr-2 font-mono font-semibold text-accent">
                ○
              </span>
              Open string
            </p>
          </div>

          <div
            className="
              grid grid-cols-2 gap-3
              border-t border-line pt-4
              sm:grid-cols-4
            "
          >
            {[
              'Index',
              'Middle',
              'Ring',
              'Pinky',
            ].map((finger, index) => (
              <div
                key={finger}
                className="flex items-center gap-2"
              >
                <span
                  className="
                    grid size-6 place-items-center
                    rounded-full bg-accent-soft
                    text-xs font-medium text-accent
                  "
                >
                  {index + 1}
                </span>

                {finger}
              </div>
            ))}
          </div>

          <p>
            A horizontal bar across several strings
            means your index finger holds those
            strings down together. This is called
            a barre chord.
          </p>

          <p>
            All diagrams use standard guitar tuning:
            E A D G B E.
          </p>
        </div>
      )}
    </div>
  )
}
