
const STRINGS = ['E', 'A', 'D', 'G', 'B', 'E']

export default function ChordDiagram({
  chord,
  showName = true,
}) {
  if (!chord) return null

  const {
    name,
    frets,
    fingers,
    base_fret: baseFret,
  } = chord

  const startX = 30
  const startY = 35
  const stringGap = 22
  const fretGap = 30

  const positiveFrets = frets.filter(
    fret => fret > 0
  )

  const fretCount = Math.max(
    4,
    Math.max(...positiveFrets, baseFret)
      - baseFret + 1
  )

  const bottomY = startY + fretCount * fretGap
  const barreStrings = frets
  .map((fret, index) => ({
    fret,
    finger: fingers[index],
    index,
  }))
  .filter(
    item => item.fret > 0 && item.finger === 1
  )

const hasBarre =
  barreStrings.length > 1 &&
  barreStrings.every(
    item => item.fret === barreStrings[0].fret
  )

  return (
    <div className="mx-auto w-full max-w-45">
      {showName && (
        <h3 className="mb-2 text-center font-mono text-lg font-semibold">
          {name}
        </h3>
      )}

      <svg
        viewBox={`0 0 170 ${bottomY + 35}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Guitar chord diagram for ${name}`}
      >
        {baseFret > 1 && (
          <text
            x="4"
            y={startY + 19}
            fontSize="10"
            fill="var(--muted)"
          >
            {baseFret}fr
          </text>
        )}

        {STRINGS.map((string, index) => {
          const x = startX + index * stringGap

          return (
            <g key={index}>
              <line
                x1={x}
                y1={startY}
                x2={x}
                y2={bottomY}
                stroke="var(--muted)"
                strokeWidth="1"
              />

              <text
                x={x}
                y={bottomY + 19}
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted)"
              >
                {string}
              </text>
            </g>
          )
        })}

        {Array.from(
          { length: fretCount + 1 },
          (_, index) => (
            <line
              key={index}
              x1={startX}
              y1={startY + index * fretGap}
              x2={startX + 5 * stringGap}
              y2={startY + index * fretGap}
              stroke="var(--muted)"
              strokeWidth={
                index === 0 && baseFret === 1
                  ? 4
                  : 1
              }
            />
          )
        )}

{hasBarre && (
  <line
    x1={
      startX +
      barreStrings[0].index * stringGap
    }
    x2={
      startX +
      barreStrings[barreStrings.length - 1].index
        * stringGap
    }
    y1={
      startY +
      (barreStrings[0].fret - baseFret + 0.5)
        * fretGap
    }
    y2={
      startY +
      (barreStrings[0].fret - baseFret + 0.5)
        * fretGap
    }
    stroke="var(--accent)"
    strokeWidth="15"
    strokeLinecap="round"
  />
)}


        {frets.map((fret, index) => {
          const x = startX + index * stringGap

          if (fret === -1) {
            return (
              <text
                key={index}
                x={x}
                y={startY - 11}
                textAnchor="middle"
                fontSize="17"
                fill="var(--muted)"
              >
                ×
              </text>
            )
          }

          if (fret === 0) {
            return (
              <circle
                key={index}
                cx={x}
                cy={startY - 16}
                r="5"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="1.3"
              />
            )
          }

          const y =
            startY +
            (fret - baseFret + 0.5) * fretGap

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="9"
                fill="var(--accent)"
              />

              <text
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="var(--background)"
              >
                {fingers[index] || ''}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
