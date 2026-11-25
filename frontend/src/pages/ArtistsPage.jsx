
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import {
  ArrowRight,
  ArrowUpRight,
  Music2,
  Search,
  Users,
  X,
} from "lucide-react";

import { getArtists } from "../lib/api";


export default function ArtistsPage() {
  const [artists, setArtists] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadArtists() {
      setLoading(true);
      setError("");

      try {
        const data = await getArtists({
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setArtists(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "We couldn't load the artist directory."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadArtists();

    return () => controller.abort();
  }, []);

  const filteredArtists = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return artists;
    }

    return artists.filter((artist) =>
      artist.name.toLowerCase().includes(query)
    );
  }, [artists, search]);

  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-8 sm:pt-20">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-copper">
            <Users size={16} />
            The artist directory
          </p>

          <h1 className="max-w-3xl font-serif text-[clamp(2.8rem,5vw,4.8rem)] leading-[1.1] tracking-[-0.045em] text-ink">
            The artists behind
            <br />
            <span className="italic text-copper">
              the music.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            Discover musicians and browse their available
            guitar chord arrangements. Explore songs in
            Nepali, Hindi, and English.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8">
        <div className="rounded-2xl border border-line bg-white p-4 sm:p-6">
          <label
            htmlFor="artist-search"
            className="mb-3 block text-xs font-semibold uppercase tracking-wide text-muted"
          >
            Search artists
          </label>

          <div className="relative">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              id="artist-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Find an artist or band..."
              className="w-full rounded-xl border border-line bg-paper py-4 pl-12 pr-12 text-sm text-ink outline-none placeholder:text-muted focus:border-copper focus:ring-2 focus:ring-copper/15"
            />

            {search && (
              <button
                type="button"
                aria-label="Clear artist search"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              >
                <X size={19} />
              </button>
            )}
          </div>
        </div>

        <div className="mb-7 mt-10 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-serif text-2xl text-ink sm:text-3xl">
            Browse artists
          </h2>

          <p className="text-sm text-muted" role="status">
            {loading
              ? "Loading artists..."
              : `${filteredArtists.length} ${
                  filteredArtists.length === 1
                    ? "artist"
                    : "artists"
                }`}
          </p>
        </div>

        {loading ? (
          <div
            role="status"
            className="rounded-2xl border border-line bg-white px-6 py-16 text-center text-sm text-muted"
          >
            Loading the artist directory...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-line bg-white p-10 text-center"
          >
            <p className="font-semibold text-ink">
              Artist directory unavailable
            </p>

            <p className="mt-3 text-sm text-muted">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-copper"
            >
              Try again
            </button>
          </div>
        ) : filteredArtists.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArtists.map((artist) => (
              <Link
                key={artist.id}
                to={`/artists/${artist.id}/`}
                className="group flex min-h-64 flex-col rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-[0_14px_40px_rgba(36,41,37,0.07)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-copper-light font-serif text-2xl font-semibold text-copper">
                    {artist.name.trim().charAt(0).toUpperCase()}
                  </div>

                  <ArrowUpRight
                    size={20}
                    className="text-muted transition group-hover:text-copper"
                  />
                </div>

                <h3 className="mt-6 font-serif text-2xl tracking-tight text-ink">
                  {artist.name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {artist.bio
                    ? artist.bio.slice(0, 130) +
                      (artist.bio.length > 130 ? "…" : "")
                    : "Explore available guitar chord arrangements."}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-5">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-muted">
                    <Music2 size={16} className="text-copper" />
                    {artist.published_song_count}{" "}
                    {artist.published_song_count === 1
                      ? "published song"
                      : "published songs"}
                  </span>

                  <span className="text-xs font-semibold text-copper">
                    View artist
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <Users
              size={32}
              className="mx-auto text-copper"
            />

            <h3 className="mt-5 font-serif text-2xl text-ink">
              No artists found
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
              {search
                ? "Try another artist name or clear your search."
                : "Artist profiles will appear when their first approved song is published."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-copper"
              >
                Show all artists
              </button>
            )}
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-night p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D9AA90]">
              Keep discovering
            </p>

            <h2 className="mt-3 font-serif text-2xl">
              Looking for a particular song?
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
              Search the full collection by title, artist,
              language, or difficulty.
            </p>
          </div>

          <Link
            to="/songs"
            className="mt-6 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#F1DED3] sm:mt-0"
          >
            Browse songs
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
