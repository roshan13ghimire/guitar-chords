
import { useMemo } from "react";
import { transposeChord } from "../lib/chords";

function parseLine(line) {
  const segments = [];
  const pattern = /\[([^\]\r\n]+)\]/g;

  let cursor = 0;
  let currentChord = null;

  for (const match of line.matchAll(pattern)) {
    const text = line.slice(cursor, match.index);

    if (text || currentChord !== null) {
      segments.push({
        chord: currentChord,
        text,
      });
    }

    currentChord = match[1].trim();
    cursor = match.index + match[0].length;
  }

  const remaining = line.slice(cursor);

  if (remaining || currentChord !== null) {
    segments.push({
      chord: currentChord,
      text: remaining,
    });
  }

  if (segments.length === 0) {
    segments.push({
      chord: null,
      text: line,
    });
  }

  return segments;
}

export default function ChordSheet({
  content,
  transpose = 0,
  fontSize = 18,
}) {
  const lines = useMemo(() => {
    return (content || "")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map(parseLine);
  }, [content]);

  return (
    <div
      className="space-y-4 rounded-2xl border border-line bg-white p-5 sm:p-8 lg:p-10"
      style={{ fontSize: `${fontSize}px` }}
    >
      {lines.map((segments, lineIndex) => {
        const isEmpty =
          segments.length === 1 &&
          !segments[0].text &&
          !segments[0].chord;

        if (isEmpty) {
          return (
            <div
              key={lineIndex}
              className="h-3"
              aria-hidden="true"
            />
          );
        }

        return (
          <div
            key={lineIndex}
            className="flex min-w-0 flex-wrap items-end gap-y-3"
          >
            {segments.map((segment, index) => (
              <span
                key={`${lineIndex}-${index}`}
                className="inline-flex max-w-full flex-col align-bottom"
              >
                <span className="h-6 font-mono text-sm font-bold leading-6 text-copper">
                  {segment.chord
                    ? transposeChord(
                        segment.chord,
                        transpose
                      )
                    : "\u00A0"}
                </span>

                <span className="whitespace-pre-wrap wrap-break-word leading-relaxed text-ink">
                  {segment.text || "\u00A0"}
                </span>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
