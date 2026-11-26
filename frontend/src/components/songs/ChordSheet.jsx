
import { useMemo } from 'react'
import { parseChordSheet } from '../../utils/chordPro'

export default function ChordSheet({
  content,
  fontSize = 16,
    onChordClick,
}) {
  const lines = useMemo(
    () => parseChordSheet(content),
    [content]
  )

  return (
    <div
      className="chord-sheet"
      style={{ fontSize: `${fontSize}px` }}
    >
      {lines.map((line, index) => {
        if (line.type === 'space') {
          return (
            <div
              key={index}
              className="h-5"
              aria-hidden="true"
            />
          )
        }

        if (line.type === 'section') {
          return (
            <h2
              key={index}
              className="
                mb-4 mt-8 text-xs font-medium
                uppercase tracking-wider text-muted
                first:mt-0
              "
            >
              {line.text}
            </h2>
          )
        }

        if (line.type === 'comment') {
          return (
            <p
              key={index}
              className="my-3 text-sm italic text-muted"
            >
              {line.text}
            </p>
          )
        }

        return (
          <div
            key={index}
            className="chord-line"
          >
            {line.segments.map((segment, i) => (
              <span
                key={i}
                className="chord-segment"
              >
                {segment.chord ? (
  <button
    type="button"
    className="chord-name chord-link"
    onClick={() =>
      onChordClick?.(segment.chord)
    }
    aria-label={`View ${segment.chord} chord diagram`}
  >
    {segment.chord}
  </button>
) : (
  <span className="chord-name">
    {'\u00A0'}
  </span>
)}

                <span className="chord-lyrics">
                  {segment.lyrics || '\u00A0'}
                </span>
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}

