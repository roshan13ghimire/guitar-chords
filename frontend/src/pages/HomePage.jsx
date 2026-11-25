
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Guitar,
  Languages,
  Music2,
  Search,
  X,
} from "lucide-react";

import SongCard from "../components/SongCard";
import { getSongs } from "../lib/api";

const filters = [
  { label: "All songs", value: "all" },
  { label: "Nepali", value: "ne" },
  { label: "Hindi", value: "hi" },
  { label: "English", value: "en" },
];

const starterChords = [
  { name: "G", fingering: "320003" },
  { name: "D", fingering: "xx0232" },
  { name: "Em", fingering: "022000" },
  { name: "C", fingering: "x32010" },
];
const COPYRIGHT_YEAR = new Date().getFullYear();

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 lg:pb-28 lg:pt-24">
      <div className="grid items-center gap-14 lg:grid-cols-[1.07fr_0.93fr]">
        <div>
          <div className="mb-8 inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.17em] text-copper">
            <span className="h-1.5 w-1.5 rounded-full bg-copper" />
            Your digital guitar songbook
          </div>

          <h1 className="max-w-2xl font-serif text-[clamp(3.2rem,6vw,5.6rem)] leading-[1.05] tracking-[-0.055em] text-ink">
            Find the chords.
            <br />
            <span className="italic text-copper">
              Play the music.
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-base leading-8 text-muted sm:text-lg">
            Discover guitar chords for the songs you love.
            A growing collection of Nepali, Hindi, and English
            music, organized for easy browsing and practice.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#songs"
              className="inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-copper"
            >
              Browse songs
              <ArrowRight size={17} />
            </a>

            <span className="text-sm text-muted">
              Search by song or artist
            </span>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-6 text-sm text-muted">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-copper" />
              Verified arrangements
            </span>
            <span className="flex items-center gap-2">
              <Languages size={17} className="text-copper" />
              Multiple languages
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[28px] bg-night p-6 text-white shadow-[0_28px_65px_rgba(36,41,37,0.13)] sm:p-8">
            <div className="mb-9 flex items-center justify-between border-b border-white/15 pb-5">
              <div className="flex items-center gap-2.5">
                <Guitar size={19} className="text-[#d9aa90]" />
                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                  Chord notebook
                </span>
              </div>
              <span className="text-xs text-white/65">
                01 / Basics
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.14em] text-[#cba48f]">
                A progression to get started
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight">
                Four chords. One beginning.
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {starterChords.map((chord) => (
                <div
                  key={chord.name}
                  className="rounded-2xl border border-white/10 bg-white/[0.07] p-5"
                >
                  <span className="font-serif text-4xl text-white">
                    {chord.name}
                  </span>
                  <p className="mt-5 font-mono text-xs tracking-[0.14em] text-white/65">
                    {chord.fingering}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-5 text-xs text-white/65">
              <span>Standard guitar tuning</span>
              <span className="font-mono tracking-wide">
                E · A · D · G · B · e
              </span>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-line bg-white px-5 py-3 shadow-lg sm:block">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-copper-light p-2 text-copper">
                <Music2 size={19} />
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">
                  Learn by playing
                </p>
                <p className="text-xs text-muted">
                  One chord at a time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SongLibrary() {
  const [language, setLanguage] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [songs, setSongs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSongs() {
      setStatus("loading");

      try {
        const data = await getSongs({
          language,
          search: debouncedSearch,
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setSongs(data);
          setStatus("success");
        }
      } catch  {
        if (!controller.signal.aborted) {
          setStatus("error");
        }
      }
    }

    loadSongs();

    return () => controller.abort();
  }, [language, debouncedSearch, retry]);

  const resetFilters = () => {
    setLanguage("all");
    setSearch("");
  };

  return (
    <section
      id="songs"
      className="scroll-mt-24 border-y border-line bg-[#fcfbf8] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-copper">
              The song library
            </p>
            <h2 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">
              Explore the music
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-muted">
              Browse our growing song collection or find a
              particular song or artist.
            </p>
          </div>

          {status === "success" && (
            <span className="rounded-full border border-line bg-white px-4 py-2 text-sm text-muted">
              {songs.length}{" "}
              {songs.length === 1 ? "song" : "songs"} found
            </span>
          )}
        </div>

        <div className="mb-8 rounded-2xl border border-line bg-white p-4 sm:p-5">
          <div className="relative">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search songs or artists..."
              aria-label="Search songs or artists"
              className="w-full rounded-xl border border-line bg-paper py-4 pl-12 pr-12 text-sm text-ink outline-none placeholder:text-muted focus:border-copper focus:ring-2 focus:ring-copper/15"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                aria-pressed={language === filter.value}
                onClick={() => setLanguage(filter.value)}
                className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${
                  language === filter.value
                    ? "bg-ink text-white"
                    : "bg-paper text-muted hover:bg-copper-light hover:text-ink"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {status === "loading" && (
          <div role="status" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <span className="sr-only">Loading songs</span>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-60 animate-pulse rounded-2xl border border-line bg-white motion-reduce:animate-none"
              />
            ))}
          </div>
        )}

        {status === "error" && (
          <div role="alert" className="rounded-2xl border border-line bg-white px-6 py-16 text-center">
            <BookOpen size={30} className="mx-auto text-copper" />
            <h3 className="mt-4 text-lg font-semibold">
              Couldn't load the song library
            </h3>
            <p className="mt-2 text-sm text-muted">
              Check that your Django backend is running.
            </p>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-copper"
            >
              Try again
            </button>
          </div>
        )}

        {status === "success" && songs.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}

        {status === "success" && songs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <Music2 size={32} className="mx-auto text-copper" />
            <h3 className="mt-4 text-lg font-semibold">
              No songs found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              Try a different search or language. Only songs
              with verified arrangements appear here.
            </p>

            {(search || language !== "all") && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-copper"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function AboutSection() {
  const items = [
    {
      icon: Search,
      title: "Find your song",
      description: "Search the catalogue by song title or artist.",
    },
    {
      icon: Languages,
      title: "Browse by language",
      description: "Keep Nepali, Hindi, and English songs together in one place.",
    },
    {
      icon: BookOpen,
      title: "Curated chord sheets",
      description: "Browse arrangements reviewed before publication.",
    },
  ];

  return (
    <section id="about" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="mb-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-copper">
          Made for guitar players
        </p>
        <h2 className="font-serif text-3xl tracking-tight sm:text-4xl">
          Simple tools. More music.
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {items.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl border border-line bg-white p-6">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-copper-light text-copper">
              <Icon size={21} />
            </div>

            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <main id="top">
        <Hero />
        <SongLibrary />
        <AboutSection />
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:px-8">
          <span className="font-semibold text-ink">
            guitar<span className="text-copper">chords.</span>
          </span>
          <span>A multilingual guitar songbook.</span>
          <span>© {COPYRIGHT_YEAR} Guitar Chords</span>
        </div>
      </footer>
    </>
  );
}
