
import { getChordShape } from "../lib/chordDiagrams";

const STRING_X = [28, 53, 78, 103, 128, 153];
const TOP = 36;
const FRET_HEIGHT = 25;

export default function ChordDiagram({ chord }) {
  const shape = getChordShape(chord);

  if (!shape) {
    return (
      <div className="flex min-h-64 flex-col rounded-2xl border border-line bg-white p-4">
        <h3 className="font-serif text-2xl font-semibold text-ink">
          {chord}
        </h3>

        <div className="flex flex-1 items-center justify-center text-center">
          <p className="max-w-40 text-xs leading-6 text-muted">
            Fingering diagram not available for this chord variation.
          </p>
        </div>
      </div>
    );
  }

  const fretted = shape.frets.filter(
    (fret) => typeof fret === "number" && fret > 0
  );

  const lowestFret = fretted.length
    ? Math.min(...fretted)
    : 1;

  const firstFret = lowestFret > 2 ? lowestFret : 1;

  const fretY = (fret) =>
    TOP + (fret - firstFret + 0.5) * FRET_HEIGHT;

  return (
    <div className="rounded-2xl border border-line bg-white p-4 transition hover:border-[#d7c9bc]">
      <h3 className="mb-2 font-serif text-2xl font-semibold text-ink">
        {chord}
      </h3>

      <svg
        viewBox="0 0 180 180"
        className="mx-auto block w-full max-w-44"
        role="img"
        aria-label={`${chord} guitar fingering diagram`}
      >
        <title>{chord} guitar chord</title>

        {/* Horizontal fret lines */}
        {Array.from({ length: 6 }, (_, index) => {
          const y = TOP + index * FRET_HEIGHT;

          return (
            <line
              key={`fret-${index}`}
              x1={28}
              x2={153}
              y1={y}
              y2={y}
              stroke="#969b95"
              strokeWidth={
                index === 0 && firstFret === 1 ? 5 : 1.4
              }
            />
          );
        })}

        {/* Vertical guitar strings */}
        {STRING_X.map((x, index) => (
          <line
            key={`string-${index}`}
            x1={x}
            x2={x}
            y1={TOP}
            y2={TOP + 5 * FRET_HEIGHT}
            stroke="#777e77"
            strokeWidth={1.3}
          />
        ))}

        {/* Starting fret number for movable chords */}
        {firstFret > 1 && (
          <text
            x="5"
            y={TOP + 17}
            fill="#70736e"
            fontSize="12"
          >
            {firstFret}fr
          </text>
        )}

        {/* Muted and open strings */}
        {shape.frets.map((fret, index) => {
          if (fret !== null && fret !== 0) {
            return null;
          }

          return (
            <text
              key={`open-${index}`}
              x={STRING_X[index]}
              y="24"
              fill="#70736e"
              fontSize="16"
              textAnchor="middle"
            >
              {fret === null ? "×" : "○"}
            </text>
          );
        })}

        {/* Barre across multiple strings */}
        {shape.barre && (
          <g>
            <rect
              x={STRING_X[shape.barre.from] - 9}
              y={fretY(shape.barre.fret) - 9}
              width={
                STRING_X[shape.barre.to] -
                STRING_X[shape.barre.from] +
                18
              }
              height="18"
              rx="9"
              fill="#B76B4E"
            />

            <text
              x={
                (STRING_X[shape.barre.from] +
                  STRING_X[shape.barre.to]) / 2
              }
              y={fretY(shape.barre.fret) + 4}
              textAnchor="middle"
              fill="white"
              fontSize="11"
              fontWeight="700"
            >
              1
            </text>
          </g>
        )}

        {/* Fretted finger positions */}
        {shape.frets.map((fret, index) => {
          if (!fret || fret < firstFret) {
            return null;
          }

          const finger = shape.fingers[index];

          if (
            shape.barre &&
            fret === shape.barre.fret &&
            finger === 1
          ) {
            return null;
          }

          const x = STRING_X[index];
          const y = fretY(fret);

          return (
            <g key={`finger-${index}`}>
              <circle
                cx={x}
                cy={y}
                r="9"
                fill="#242925"
              />

              {finger > 0 && (
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize="11"
                  fontWeight="600"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
