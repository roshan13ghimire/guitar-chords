
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router";

import {
  ArrowRight,
  BookOpen,
  Guitar,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import {
  getArtists,
  getSongs,
} from "../lib/api";

const LANGUAGES = [
  { value: "", label: "All languages" },
  { value: "ne", label: "Nepali" },
  { value: "hi", label: "Hindi" },
  { value: "en", label: "English" },
];

const DIFFICULTIES = [
  { value: "", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const SORT_OPTIONS = [
  { value: "title", label: "Title: A to Z" },
  { value: "title_desc", label: "Title: Z to A" },
  { value: "newest", label: "Recently added" },
  { value: "oldest", label: "Oldest first" },
];

const LANGUAGE_NAMES = {
  ne: "Nepali",
  hi: "Hindi",
  en: "English",
};

const DIFFICULTY_NAMES = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const selectClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/15";

function FilterSelect({
  label,
  value,
  onChange,
  children,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>

      <select
        className={selectClass}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
      >
        {children}
      </select>
    </label>
  );
}

function SongResultCard({ song }) {
  const difficulties = song.difficulties || [];

  return (
    <Link
      to={`/songs/${song.id}/`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-[0_14px_40px_rgba(36,41,37,0.07)] sm:p-6"
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-muted">
          <Guitar size={13} />
          {LANGUAGE_NAMES[song.language] || song.language}
        </span>

        <ArrowRight
          size={19}
          className="-rotate-45 text-muted transition group-hover:translate-x-0.5 group-hover:text-copper"
        />
      </div>

      <h3 className="font-serif text-[1.45rem] leading-snug tracking-tight text-ink">
        {song.title}
      </h3>

      {song.alternate_title &&
        song.alternate_title !== song.title && (
          <p className="mt-2 text-sm text-muted">
            {song.alternate_title}
          </p>
        )}

      <p className="mt-3 text-sm text-muted">
        {song.artist?.name || "Unknown artist"}
      </p>

      <div className="mt-auto pt-7">
        <div className="flex flex-wrap gap-2">
          {difficulties.map((difficulty) => (
            <span
              key={difficulty}
              className="rounded-full bg-copper-light px-3 py-1.5 text-xs font-medium text-copper"
            >
              {DIFFICULTY_NAMES[difficulty] || difficulty}
            </span>
          ))}

          {song.genre && (
            <span className="rounded-full border border-line px-3 py-1.5 text-xs text-muted">
              {song.genre}
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 border-t border-line pt-4 text-sm font-semibold text-ink">
          <BookOpen size={16} className="text-copper" />
          View chords
        </div>
      </div>
    </Link>
  );
}

export default function BrowseSongsPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const searchValue =
    searchParams.get("search") || "";

  const language =
    searchParams.get("language") || "";

  const artist =
    searchParams.get("artist") || "";

  const difficulty =
    searchParams.get("difficulty") || "";

  const sort =
    searchParams.get("sort") || "title";

  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [artistsError, setArtistsError] = useState("");

  const queryString = searchParams.toString();

  const updateParam = useCallback(
    (name, value, options = {}) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          if (
            !value ||
            value === "all" ||
            (name === "sort" && value === "title")
          ) {
            next.delete(name);
          } else {
            next.set(name, value);
          }

          return next;
        },
        options
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadArtists() {
      try {
        const data = await getArtists({
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setArtists(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setArtistsError(
            "Artist filters are temporarily unavailable."
          );
        }
      }
    }

    loadArtists();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(queryString);

    // The URL changes immediately as someone types,
    // but the network request waits 350 ms.
    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getSongs({
          language: params.get("language") || "all",
          search: params.get("search") || "",
          artist: params.get("artist") || "",
          difficulty: params.get("difficulty") || "",
          sort: params.get("sort") || "title",
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setSongs(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "We couldn't load the song library. Please try again."
          );
          setSongs([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, searchValue ? 350 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [queryString, searchValue]);

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  const hasActiveFilters = Boolean(
    searchValue ||
    language ||
    artist ||
    difficulty ||
    (sort && sort !== "title")
  );

  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-14 sm:px-8 sm:pt-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-copper">
            The songbook
          </p>

          <h1 className="font-serif text-[clamp(2.8rem,5vw,4.6rem)] leading-tight tracking-[-0.045em] text-ink">
            Find something
            <br />
            <span className="italic text-copper">
              worth playing.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
            Browse Nepali, Hindi, and English chord
            arrangements. Search by song or artist,
            find your playing level, and start practicing.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8">
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="mb-6 flex items-center gap-2">
            <SlidersHorizontal
              size={18}
              className="text-copper"
            />

            <h2 className="text-base font-semibold text-ink">
              Search and filters
            </h2>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
              Search songs or artists
            </span>

            <div className="relative">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="search"
                value={searchValue}
                maxLength={100}
                onChange={(event) =>
                  updateParam(
                    "search",
                    event.target.value,
                    { replace: true }
                  )
                }
                placeholder="Song title, Romanized title, or artist..."
                className="w-full rounded-xl border border-line bg-paper py-4 pl-12 pr-4 text-sm text-ink outline-none placeholder:text-muted focus:border-copper focus:ring-2 focus:ring-copper/15"
              />
            </div>
          </label>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Language"
              value={language}
              onChange={(value) =>
                updateParam("language", value)
              }
            >
              {LANGUAGES.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Artist"
              value={artist}
              onChange={(value) =>
                updateParam("artist", value)
              }
              disabled={Boolean(artistsError)}
            >
              <option value="">All artists</option>

              {artists.map((item) => (
                <option
                  key={item.id}
                  value={String(item.id)}
                >
                  {item.name}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Difficulty"
              value={difficulty}
              onChange={(value) =>
                updateParam("difficulty", value)
              }
            >
              {DIFFICULTIES.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              label="Sort by"
              value={sort}
              onChange={(value) =>
                updateParam("sort", value)
              }
            >
              {SORT_OPTIONS.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </FilterSelect>
          </div>

          {artistsError && (
            <p className="mt-3 text-xs text-muted">
              {artistsError}
            </p>
          )}

          {hasActiveFilters && (
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-sm font-semibold text-copper hover:underline"
              >
                <RotateCcw size={15} />
                Clear all filters
              </button>
            </div>
          )}
        </div>

        <div className="mb-7 mt-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl text-ink sm:text-3xl">
              Available songs
            </h2>

            <p
              role="status"
              className="mt-2 text-sm text-muted"
            >
              {loading
                ? "Searching the songbook..."
                : `${songs.length} ${
                    songs.length === 1
                      ? "song"
                      : "songs"
                  } found`}
            </p>
          </div>

          <span className="text-xs text-muted">
            Published arrangements only
          </span>
        </div>

        {loading ? (
          <div
            role="status"
            className="rounded-2xl border border-line bg-white px-6 py-16 text-center text-sm text-muted"
          >
            Loading songs...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-line bg-white px-6 py-14 text-center"
          >
            <p className="font-semibold text-ink">
              Something went wrong
            </p>

            <p className="mt-3 text-sm text-muted">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-copper"
            >
              Retry
            </button>
          </div>
        ) : songs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <SongResultCard
                key={song.id}
                song={song}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <Guitar
              size={34}
              className="mx-auto text-copper"
            />

            <h3 className="mt-5 font-serif text-2xl text-ink">
              No songs found
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
              Try a different search term or remove
              some filters. The catalogue only
              includes published arrangements.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-copper"
            >
              Show all songs
            </button>
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-line bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div>
            <h3 className="font-serif text-2xl text-ink">
              Missing a song?
            </h3>

            <p className="mt-2 text-sm leading-7 text-muted">
              Suggest a song for our review queue.
              Community requests help guide what we
              add to the songbook.
            </p>
          </div>

          <Link
            to="/contribute"
            className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-copper sm:mt-0"
          >
            Suggest a song
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
