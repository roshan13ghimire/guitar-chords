
import { useMemo, useState } from "react";
import {
  BookOpen,
  Guitar,
  Info,
  Music2,
  Search,
  X,
} from "lucide-react";

import ChordDiagram from "../components/ChordDiagram";

// Twelve pitch classes with common enharmonic spellings.
// For example, Db and C# represent the same pitch.
const ROOTS = [
  { note: "C", alternate: "" },
  { note: "Db", alternate: "C#" },
  { note: "D", alternate: "" },
  { note: "Eb", alternate: "D#" },
  { note: "E", alternate: "" },
  { note: "F", alternate: "" },
  { note: "F#", alternate: "Gb" },
  { note: "G", alternate: "" },
  { note: "Ab", alternate: "G#" },
  { note: "A", alternate: "" },
  { note: "Bb", alternate: "A#" },
  { note: "B", alternate: "" },
];

const OPEN_CHORDS = new Set([
  "C",
  "D",
  "E",
  "G",
  "A",
  "Am",
  "Dm",
  "Em",
]);

const CHORDS = ROOTS.flatMap(({ note, alternate }) => {
  return [
    {
      name: note,
      alternate,
      quality: "major",
      isOpen: OPEN_CHORDS.has(note),
    },
    {
      name: `${note}m`,
      alternate: alternate ? `${alternate}m` : "",
      quality: "minor",
      isOpen: OPEN_CHORDS.has(`${note}m`),
    },
  ];
});

const FILTERS = [
  { value: "all", label: "All chords" },
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "open", label: "Open chords" },
];

const READING_GUIDE = [
  {
    symbol: "×",
    title: "Muted string",
    description: "Do not play this string.",
  },
  {
    symbol: "○",
    title: "Open string",
    description: "Play the string without holding a fret.",
  },
  {
    symbol: "1–4",
    title: "Finger numbers",
    description:
      "1 = index, 2 = middle, 3 = ring, 4 = pinky.",
  },
  {
    symbol: "—",
    title: "Barre",
    description:
      "Hold down multiple strings with one finger.",
  },
];

export default function ChordLibraryPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredChords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return CHORDS.filter((chord) => {
      let matchesFilter = true;

      if (filter === "major") {
        matchesFilter = chord.quality === "major";
      } else if (filter === "minor") {
        matchesFilter = chord.quality === "minor";
      } else if (filter === "open") {
        matchesFilter = chord.isOpen;
      }

      const matchesSearch =
        !query ||
        chord.name.toLowerCase().includes(query) ||
        chord.alternate.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [search, filter]);

  function clearFilters() {
    setSearch("");
    setFilter("all");
  }

  return (
    <main className="min-h-screen bg-paper">
      {/* Introduction */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:px-8 lg:pb-20 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-copper">
                <Guitar size={16} />
                Guitar learning
              </p>

              <h1 className="max-w-2xl font-serif text-[clamp(2.8rem,5vw,4.8rem)] leading-[1.09] tracking-[-0.045em] text-ink">
                Every song starts
                <br />
                with a{" "}
                <span className="italic text-copper">
                  chord.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg">
                Discover guitar chord shapes, learn finger
                placement, and build confidence before
                playing your favorite songs.
              </p>

              <a
                href="#chords"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-copper"
              >
                Explore chords
                <BookOpen size={17} />
              </a>
            </div>

            <aside className="rounded-[26px] bg-night p-7 text-white sm:p-8">
              <div className="mb-7 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#D9AA90]">
                <Music2 size={17} />
                Start with the basics
              </div>

              <p className="font-serif text-3xl leading-tight tracking-tight">
                Small steps.
                <br />
                Better playing.
              </p>

              <p className="mt-5 text-sm leading-7 text-white/65">
                Begin with a few common open chords.
                Practice changing between them slowly,
                then try a simple progression.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {["G", "C", "D", "Em"].map((chord) => (
                  <span
                    key={chord}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 font-serif text-xl"
                  >
                    {chord}
                  </span>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Searchable chord library */}
      <section
        id="chords"
        className="scroll-mt-28 bg-[#fcfbf8] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-9">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-copper">
              Chord reference
            </p>

            <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
              Explore chord shapes
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Browse major and minor chords in standard
              guitar tuning. Select open chords for
              beginner-friendly shapes.
            </p>
          </div>

          {/* Search and filters */}
          <div className="mb-8 rounded-2xl border border-line bg-white p-4 sm:p-5">
            <div className="relative">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="search"
                aria-label="Search guitar chords"
                placeholder="Search G, Am, F#, Bb..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-line bg-paper py-4 pl-12 pr-12 text-sm text-ink outline-none placeholder:text-muted focus:border-copper focus:ring-2 focus:ring-copper/15"
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear chord search"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div
              role="group"
              aria-label="Filter chord types"
              className="mt-4 flex flex-wrap gap-2"
            >
              {FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={filter === option.value}
                  onClick={() => setFilter(option.value)}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                    filter === option.value
                      ? "bg-ink text-white"
                      : "bg-paper text-muted hover:bg-copper-light hover:text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted" role="status">
              Showing{" "}
              <span className="font-semibold text-ink">
                {filteredChords.length}
              </span>{" "}
              {filteredChords.length === 1
                ? "chord"
                : "chords"}
            </p>

            <p className="text-xs text-muted">
              Standard tuning: E · A · D · G · B · e
            </p>
          </div>

          {filteredChords.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {filteredChords.map((chord) => (
                <div
                  key={chord.name}
                  className="flex h-full flex-col"
                >
                  <ChordDiagram chord={chord.name} />

                  {(chord.alternate || chord.isOpen) && (
                    <div className="flex flex-wrap items-center gap-2 px-2 pt-3 text-xs text-muted">
                      {chord.alternate && (
                        <span>
                          Also: {chord.alternate}
                        </span>
                      )}

                      {chord.isOpen && (
                        <span className="rounded-full bg-copper-light px-2.5 py-1 font-medium text-copper">
                          Open chord
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
              <Guitar
                size={32}
                className="mx-auto text-copper"
              />

              <h3 className="mt-4 text-lg font-semibold text-ink">
                No matching chords
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted">
                Try another chord name or change the filter.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-copper"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-white p-4">
            <Info
              size={19}
              className="mt-0.5 shrink-0 text-copper"
            />

            <p className="text-xs leading-6 text-muted">
              Each diagram shows one possible fingering.
              Some chords can be played in several positions.
              This library currently covers basic major and
              minor chords. More variations will be added later.
            </p>
          </div>
        </div>
      </section>

      {/* Learning guide */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mb-9">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-copper">
            For beginners
          </p>

          <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            How to read a chord diagram
          </h2>

          <p className="mt-4 max-w-2xl leading-7 text-muted">
            The six vertical lines represent your guitar
            strings, from low E on the left to high E on
            the right. Horizontal lines represent frets.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {READING_GUIDE.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-line bg-white p-6"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-copper-light font-mono text-xl font-semibold text-copper">
                {item.symbol}
              </div>

              <h3 className="text-base font-semibold text-ink">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-muted">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-line bg-white p-6 sm:p-8">
          <h3 className="text-xl font-semibold text-ink">
            A simple practice routine
          </h3>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
            Start with G, C, D, and Em. Hold each shape
            carefully, play the strings slowly, and
            check that every intended note sounds clear.
            Once comfortable, practice changing chords
            without stopping.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["G", "C", "D", "Em"].map((chord) => (
              <span
                key={chord}
                className="rounded-xl border border-line bg-paper px-5 py-3 font-serif text-xl text-ink"
              >
                {chord}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
