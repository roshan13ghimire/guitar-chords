import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  Minus,
  Plus,
  RotateCcw,
  Type,
} from "lucide-react";

import ChordGallery from "../components/ChordGallery";
import ChordSheet from "../components/ChordSheet";
import PracticeToolbar from "../components/PracticeToolbar";
import useAutoScroll from "../hooks/useAutoScroll";
import { getSong } from "../lib/api";
import { transposeChord } from "../lib/chords";
import { extractChords } from "../lib/chordDiagrams";

const languageNames = {
  ne: "Nepali",
  hi: "Hindi",
  en: "English",
};

function ControlButton({ onClick, disabled, label, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export default function SongPage() {
  const { id } = useParams();
  const chordSheetRef = useRef(null);

  const [song, setSong] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [arrangementId, setArrangementId] = useState(null);
  const [transpose, setTranspose] = useState(0);
  const [capo, setCapo] = useState(0);
  const [fontSize, setFontSize] = useState(18);

  // Practice state: defined before the auto-scroll hook uses it.
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(35);
  const [focusMode, setFocusMode] = useState(false);

  useAutoScroll({
    playing: isScrolling && status === "success",
    speed: scrollSpeed,
    targetRef: chordSheetRef,
    onStop: () => setIsScrolling(false),
  });

  // Use the same focus-mode body class as the existing CSS rule.
  useEffect(() => {
    document.body.classList.toggle("practice-focus-mode", focusMode);

    return () => {
      document.body.classList.remove("practice-focus-mode");
    };
  }, [focusMode]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSong() {
      setStatus("loading");
      setSong(null);
      setErrorMessage("");
      setArrangementId(null);
      setTranspose(0);
      setCapo(0);
      setIsScrolling(false);
      setFocusMode(false);

      try {
        const data = await getSong(id, { signal: controller.signal });

        if (!controller.signal.aborted) {
          const firstArrangement = data.arrangements?.[0];
          setSong(data);
          setArrangementId(firstArrangement?.id ?? null);
          setCapo(Number(firstArrangement?.capo ?? 0));
          setStatus("success");
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(error.message || "Unable to load song details.");
          setStatus("error");
        }
      }
    }

    loadSong();
    return () => controller.abort();
  }, [id]);

  const arrangements = song?.arrangements ?? [];
  const selectedArrangement =
    arrangements.find((item) => item.id === arrangementId) ?? arrangements[0];

  const savedCapo = Number(selectedArrangement?.capo ?? 0);
  // The sounding key is changed by transpose; adjusting capo keeps that key.
  const chordShift = transpose - (capo - savedCapo);

  const visibleChords = useMemo(() => {
    const chords = extractChords(selectedArrangement?.chord_content || "");
    return [...new Set(chords.map((chord) => transposeChord(chord, chordShift)))];
  }, [selectedArrangement?.chord_content, chordShift]);

  const handleArrangementChange = (event) => {
    const nextId = Number(event.target.value);
    const nextArrangement = arrangements.find((item) => item.id === nextId);
    setArrangementId(nextId);
    setCapo(Number(nextArrangement?.capo ?? 0));
    setTranspose(0);
    setIsScrolling(false);
  };

  const handlePlayPause = () => {
    if (!isScrolling && chordSheetRef.current) {
      // Start from the sheet if it is still well below the screen.
      if (chordSheetRef.current.getBoundingClientRect().top > window.innerHeight * 0.55) {
        chordSheetRef.current.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
      }
    }

    setIsScrolling((current) => !current);
  };

  const handleRestart = () => {
    setIsScrolling(false);
    chordSheetRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleFocusChange = () => {
    setIsScrolling(false);
    setFocusMode((current) => !current);
  };

  return (
    <main className="min-h-[75vh] bg-paper">
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        {!focusMode && (
          <Link
            to="/#songs"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-copper"
          >
            <ArrowLeft size={17} />
            Back to song library
          </Link>
        )}

        {status === "loading" && (
          <div
            role="status"
            className="animate-pulse space-y-6 motion-reduce:animate-none"
          >
            <div className="h-12 w-2/3 rounded-xl bg-line" />
            <div className="h-5 w-1/3 rounded-lg bg-line" />
            <div className="h-36 rounded-2xl bg-line" />
            <div className="h-80 rounded-2xl bg-line" />
            <span className="sr-only">Loading song</span>
          </div>
        )}

        {status === "error" && (
          <div
            role="alert"
            className="rounded-2xl border border-line bg-white px-6 py-20 text-center"
          >
            <BookOpen size={34} className="mx-auto text-copper" />
            <h1 className="mt-5 font-serif text-3xl">
              {errorMessage === "Song not found"
                ? "Song not found"
                : "Unable to load this song"}
            </h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted">
              {errorMessage === "Song not found"
                ? "This song may not exist or may not have a published arrangement."
                : "Check that the backend is running and try again."}
            </p>
            <Link
              to="/#songs"
              className="mt-7 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-copper"
            >
              Browse songs
            </Link>
          </div>
        )}

        {status === "success" && song && (
          <>
            {!focusMode && (
              <div className="mb-10 border-b border-line pb-9">
                <span className="inline-flex rounded-full bg-copper-light px-3 py-1.5 text-xs font-semibold text-copper">
                  {languageNames[song.language] || "Song"}
                </span>
                <h1 className="mt-5 font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
                  {song.title}
                </h1>
                <p className="mt-3 text-lg text-muted">
                  {song.artist?.name || "Unknown artist"}
                </p>
                {song.genre && (
                  <p className="mt-3 text-sm text-muted">{song.genre}</p>
                )}
              </div>
            )}

            {selectedArrangement ? (
              <>
                {!focusMode && (
                  <>
                    <section
                      aria-label="Chord player controls"
                      className="mb-6 rounded-2xl bg-night p-5 text-white sm:p-7"
                    >
                      <div className="flex flex-col gap-5 border-b border-white/15 pb-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="w-full max-w-sm">
                          <label
                            htmlFor="arrangement"
                            className="mb-2 block text-xs font-semibold uppercase tracking-widest text-[#D5B09D]"
                          >
                            Arrangement
                          </label>
                          <select
                            id="arrangement"
                            value={selectedArrangement.id}
                            onChange={handleArrangementChange}
                            className="w-full rounded-xl border border-white/20 bg-[#373c37] px-4 py-3 text-sm text-white outline-none focus:border-[#D5B09D]"
                          >
                            {arrangements.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/20 px-3 py-2 text-xs text-white/85">
                            Sounding key: {transposeChord(selectedArrangement.original_key, transpose)}
                          </span>
                          <span className="rounded-full border border-white/20 px-3 py-2 text-xs text-white/85">
                            Capo: {capo}
                          </span>
                          <span className="rounded-full border border-white/20 px-3 py-2 text-xs capitalize text-white/85">
                            {selectedArrangement.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-7 pt-6">
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/55">
                            Transpose chords
                          </p>
                          <div className="flex items-center gap-3">
                            <ControlButton
                              label="Transpose down one semitone"
                              disabled={transpose <= -11}
                              onClick={() => setTranspose((value) => value - 1)}
                            >
                              <Minus size={18} />
                            </ControlButton>
                            <span className="min-w-9 text-center text-lg font-semibold tabular-nums">
                              {transpose > 0 ? `+${transpose}` : transpose}
                            </span>
                            <ControlButton
                              label="Transpose up one semitone"
                              disabled={transpose >= 11}
                              onClick={() => setTranspose((value) => value + 1)}
                            >
                              <Plus size={18} />
                            </ControlButton>
                            <button
                              type="button"
                              onClick={() => setTranspose(0)}
                              disabled={transpose === 0}
                              className="ml-2 inline-flex items-center gap-2 text-sm text-white/65 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <RotateCcw size={15} />
                              Reset
                            </button>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="capo-fret"
                            className="mb-3 block text-xs font-semibold uppercase tracking-widest text-white/55"
                          >
                            Capo position
                          </label>
                          <select
                            id="capo-fret"
                            value={capo}
                            onChange={(event) => setCapo(Number(event.target.value))}
                            className="min-w-36 rounded-xl border border-white/20 bg-[#373c37] px-4 py-2.5 text-sm text-white outline-none focus:border-[#D5B09D]"
                          >
                            {Array.from({ length: 13 }, (_, fret) => (
                              <option key={fret} value={fret}>
                                {fret === 0 ? "No capo" : `Fret ${fret}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/55">
                            <Type size={15} />
                            Text size
                          </p>
                          <div className="flex items-center gap-3">
                            <ControlButton
                              label="Decrease text size"
                              disabled={fontSize <= 16}
                              onClick={() => setFontSize((value) => Math.max(16, value - 2))}
                            >
                              <Minus size={18} />
                            </ControlButton>
                            <span className="min-w-11 text-center text-sm font-medium tabular-nums">
                              {fontSize}px
                            </span>
                            <ControlButton
                              label="Increase text size"
                              disabled={fontSize >= 26}
                              onClick={() => setFontSize((value) => Math.min(26, value + 2))}
                            >
                              <Plus size={18} />
                            </ControlButton>
                          </div>
                        </div>
                      </div>
                    </section>

                    {selectedArrangement.strumming_pattern && (
                      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 sm:px-7">
                        <span className="text-sm text-muted">Strumming pattern</span>
                        <span className="rounded-lg bg-copper-light px-3 py-2 font-mono text-sm font-semibold tracking-wide text-copper">
                          {selectedArrangement.strumming_pattern}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Toolbar must be OUTSIDE the chord-sheet section, so it can stick while scrolling. */}
                <PracticeToolbar
                  playing={isScrolling}
                  onPlayPause={handlePlayPause}
                  onRestart={handleRestart}
                  speed={scrollSpeed}
                  onSpeedChange={setScrollSpeed}
                  focusMode={focusMode}
                  onFocusChange={handleFocusChange}
                />

                {!focusMode && <ChordGallery chords={visibleChords} />}

                <section
                  id="chord-sheet"
                  ref={chordSheetRef}
                  aria-label="Song chord sheet"
                  className={focusMode ? "scroll-mt-36" : "scroll-mt-52"}
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight text-ink">
                      Chord sheet
                    </h2>
                    {!focusMode && (
                      <span className="text-xs text-muted">Verified arrangement</span>
                    )}
                  </div>
                  {selectedArrangement.chord_content ? (
                    <div lang={song.language}>
                      <ChordSheet
                        content={selectedArrangement.chord_content}
                        transpose={chordShift}
                        fontSize={fontSize}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-line bg-white p-8 text-muted">
                      No chord content is available.
                    </div>
                  )}
                </section>

                {!focusMode && (
                  <p className="mt-5 text-xs leading-6 text-muted">
                    Transpose changes the sounding key. Changing the capo
                    adjusts the displayed chord shapes to preserve that key.
                    Chord diagrams show positions relative to your capo.
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-line bg-white p-8 text-muted">
                No published chord arrangements are available.
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
