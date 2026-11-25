
import { useEffect, useMemo, useState } from "react";

import {
  Link,
  useParams,
} from "react-router";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Guitar,
  Music2,
  Search,
  UserRound,
} from "lucide-react";

import { getArtist } from "../lib/api";


const LANGUAGES = [
  { value: "all", label: "All languages" },
  { value: "ne", label: "Nepali" },
  { value: "hi", label: "Hindi" },
  { value: "en", label: "English" },
];

const DIFFICULTIES = [
  { value: "all", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
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
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-copper focus:ring-2 focus:ring-copper/15";


function ArtistSongCard({ song }) {
  const difficulties = song.difficulties || [];

  return (
    <Link
      to={`/songs/${song.id}/`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-[0_14px_40px_rgba(36,41,37,0.07)] sm:p-6"
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-muted">
          {LANGUAGE_NAMES[song.language] || song.language}
        </span>

        <ArrowRight
          size={19}
          className="-rotate-45 text-muted transition group-hover:text-copper"
        />
      </div>

      <h3 className="font-serif text-2xl leading-snug tracking-tight text-ink">
        {song.title}
      </h3>

      {song.alternate_title &&
        song.alternate_title !== song.title && (
          <p className="mt-2 text-sm text-muted">
            {song.alternate_title}
          </p>
        )}

      <div className="mt-auto pt-6">
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


export default function ArtistDetailPage() {
  const { id } = useParams();

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => {
    const controller = new AbortController();

    async function loadArtist() {
      setLoading(true);
      setError("");
      setArtist(null);

      try {
        const data = await getArtist(id, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setArtist(data);
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(
            requestError.message ||
              "Unable to load the artist profile."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadArtist();

    return () => controller.abort();
  }, [id]);

  const filteredSongs = useMemo(() => {
    const songs = artist?.songs || [];
    const query = search.trim().toLowerCase();

    return songs.filter((song) => {
      const matchesSearch =
        !query ||
        song.title.toLowerCase().includes(query) ||
        (song.alternate_title || "")
          .toLowerCase()
          .includes(query);

      const matchesLanguage =
        language === "all" ||
        song.language === language;

      const matchesDifficulty =
        difficulty === "all" ||
        (song.difficulties || []).includes(difficulty);

      return (
        matchesSearch &&
        matchesLanguage &&
        matchesDifficulty
      );
    });
  }, [artist, search, language, difficulty]);

  const resetFilters = () => {
    setSearch("");
    setLanguage("all");
    setDifficulty("all");
  };

  if (loading) {
    return (
      <main
        role="status"
        className="flex min-h-[65vh] items-center justify-center bg-paper px-5 text-center text-muted"
      >
        Loading artist profile...
      </main>
    );
  }

  if (error || !artist) {
    return (
      <main className="flex min-h-[65vh] flex-col items-center justify-center bg-paper px-5 text-center">
        <UserRound
          size={36}
          className="text-copper"
        />

        <h1 className="mt-5 font-serif text-3xl text-ink">
          Artist unavailable
        </h1>

        <p className="mt-3 text-sm leading-7 text-muted">
          {error || "This artist profile could not be found."}
        </p>

        <Link
          to="/artists"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-copper"
        >
          <ArrowLeft size={16} />
          Back to artists
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
          <Link
            to="/artists"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-copper"
          >
            <ArrowLeft size={16} />
            All artists
          </Link>

          <div className="mt-10 grid gap-8 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-9">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-copper-light font-serif text-5xl text-copper sm:h-32 sm:w-32">
              {artist.name.trim().charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-copper">
                Artist profile
              </p>

              <h1 className="font-serif text-[clamp(2.5rem,5vw,4.6rem)] leading-tight tracking-[-0.045em] text-ink">
                {artist.name}
              </h1>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-muted">
                <Music2 size={16} className="text-copper" />
                {artist.published_song_count}{" "}
                {artist.published_song_count === 1
                  ? "published song"
                  : "published songs"}
              </div>

              {artist.bio && (
                <div className="mt-6 max-w-2xl whitespace-pre-line text-sm leading-8 text-muted sm:text-base">
                  {artist.bio}
                </div>
              )}

              <Link
                to={`/songs?artist=${artist.id}`}
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-copper hover:underline"
              >
                Open in song browser
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <div className="mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-copper">
            The collection
          </p>

          <h2 className="font-serif text-3xl text-ink sm:text-4xl">
            Songs by {artist.name}
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Browse available chord arrangements, choose
            your level, and open a song to start playing.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <label
            htmlFor="artist-song-search"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Search this artist's songs
          </label>

          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              id="artist-song-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search song titles..."
              className="w-full rounded-xl border border-line bg-paper py-3.5 pl-12 pr-4 text-sm text-ink outline-none focus:border-copper focus:ring-2 focus:ring-copper/15"
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                Language
              </span>

              <select
                className={selectClass}
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value)
                }
              >
                {LANGUAGES.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
                Difficulty
              </span>

              <select
                className={selectClass}
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value)
                }
              >
                {DIFFICULTIES.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mb-6 mt-9 flex flex-wrap items-center justify-between gap-3">
          <p
            role="status"
            className="text-sm text-muted"
          >
            <span className="font-semibold text-ink">
              {filteredSongs.length}
            </span>{" "}
            {filteredSongs.length === 1 ? "song" : "songs"} found
          </p>

          <span className="text-xs text-muted">
            Published arrangements only
          </span>
        </div>

        {filteredSongs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSongs.map((song) => (
              <ArtistSongCard
                key={song.id}
                song={song}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
            <Guitar
              size={32}
              className="mx-auto text-copper"
            />

            <h3 className="mt-5 font-serif text-2xl text-ink">
              No matching songs
            </h3>

            <p className="mt-3 text-sm text-muted">
              Try another language, level, or song title.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-copper"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="mt-12 rounded-2xl border border-line bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
          <div>
            <h3 className="font-serif text-2xl text-ink">
              Missing a song by this artist?
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
              Suggest it for review. New arrangements are
              added only after content and publishing checks.
            </p>
          </div>

          <Link
            to="/contribute"
            className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-copper sm:mt-0"
          >
            <Music2 size={16} />
            Suggest a song
          </Link>
        </div>
      </section>
    </main>
  );
}
