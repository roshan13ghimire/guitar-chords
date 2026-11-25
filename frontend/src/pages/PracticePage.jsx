
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";

import ChordDiagram from "../components/ChordDiagram";
import useMetronome from "../hooks/useMetronome";


const BEATS_PER_CHORD = 4;
const TARGET_ROUNDS = 4;

const PRESETS = [
  {
    id: "first-changes",
    title: "First chord changes",
    description:
      "A gentle two-chord starting point.",
    chords: ["Em", "G"],
    bpm: 55,
  },
  {
    id: "four-chord-flow",
    title: "Four-chord flow",
    description:
      "Build smooth changes across four common open chords.",
    chords: ["G", "D", "Em", "C"],
    bpm: 65,
  },
  {
    id: "minor-colors",
    title: "Minor chord practice",
    description:
      "Practice moving between minor and major shapes.",
    chords: ["Am", "C", "G", "Em"],
    bpm: 60,
  },
];

const clampTempo = (value) =>
  Math.min(160, Math.max(40, value));


export default function PracticePage() {
  const [presetId, setPresetId] = useState(
    PRESETS[0].id
  );

  const [bpm, setBpm] = useState(
    PRESETS[0].bpm
  );

  const [soundEnabled, setSoundEnabled] =
    useState(true);

  const [completedBeats, setCompletedBeats] =
    useState(0);

  const [finished, setFinished] = useState(false);

  const preset =
    PRESETS.find((item) => item.id === presetId) ||
    PRESETS[0];

  const beatsPerRound =
    preset.chords.length * BEATS_PER_CHORD;

  const totalBeats =
    beatsPerRound * TARGET_ROUNDS;

  const onBeat = useCallback(
    (index) => {
      if (index >= totalBeats) return;

      setCompletedBeats(index + 1);

      if (index + 1 === totalBeats) {
        setFinished(true);
      }
    },
    [totalBeats]
  );

  const {
    isPlaying,
    audioError,
    start,
    pause,
    reset,
  } = useMetronome({
    bpm,
    soundEnabled,
    onBeat,
  });

  useEffect(() => {
    if (
      completedBeats >= totalBeats &&
      isPlaying
    ) {
      pause();
    }
  }, [
    completedBeats,
    totalBeats,
    isPlaying,
    pause,
  ]);

  const activeChordIndex =
    Math.floor(
      Math.max(0, completedBeats - 1) /
        BEATS_PER_CHORD
    ) % preset.chords.length;

  const currentChord =
    preset.chords[activeChordIndex];

  const nextChord =
    preset.chords[
      (activeChordIndex + 1) %
        preset.chords.length
    ];

  const currentBeat =
    completedBeats > 0
      ? ((completedBeats - 1) % BEATS_PER_CHORD) + 1
      : 0;

  const completedRounds = Math.floor(
    completedBeats / beatsPerRound
  );

  const progressPercent = Math.round(
    (completedBeats / totalBeats) * 100
  );

  const displayedRound = Math.min(
    TARGET_ROUNDS,
    completedRounds + (finished ? 0 : 1)
  );

  const changePreset = (id) => {
    reset();

    const selected =
      PRESETS.find((item) => item.id === id) ||
      PRESETS[0];

    setPresetId(selected.id);
    setBpm(selected.bpm);
    setCompletedBeats(0);
    setFinished(false);
  };

  const handleStart = async () => {
    if (
      finished ||
      completedBeats >= totalBeats
    ) {
      reset();
      setCompletedBeats(0);
      setFinished(false);
    }

    await start();
  };

  const handleReset = () => {
    reset();
    setCompletedBeats(0);
    setFinished(false);
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-14 sm:px-8 sm:pt-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-copper">
            Guitar practice
          </p>

          <h1 className="font-serif text-[clamp(2.6rem,5vw,4.5rem)] leading-tight tracking-[-0.045em]">
            Make every chord change{" "}
            <span className="italic text-copper">
              count.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
            Practice changing chords with a steady beat.
            Choose a sequence, set a comfortable tempo,
            and complete four rounds without rushing.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0 space-y-6">
          {/* Chord sequence selection */}
          <section className="rounded-2xl border border-line bg-white p-5 sm:p-7">
            <label
              htmlFor="practice-preset"
              className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-muted"
            >
              Practice sequence
            </label>

            <div className="relative">
              <select
                id="practice-preset"
                value={presetId}
                onChange={(event) =>
                  changePreset(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-line bg-paper px-4 py-3.5 pr-10 text-sm font-semibold outline-none focus:border-copper focus:ring-2 focus:ring-copper/15"
              >
                {PRESETS.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.title}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>

            <p className="mt-3 text-sm leading-6 text-muted">
              {preset.description}
            </p>

            <div
              className="mt-5 flex flex-wrap gap-2"
              aria-label="Chord sequence"
            >
              {preset.chords.map((chord, index) => (
                <span
                  key={`${presetId}-${index}`}
                  className={`rounded-xl border px-4 py-3 font-serif text-xl transition ${
                    index === activeChordIndex &&
                    completedBeats > 0
                      ? "border-copper bg-copper-light text-copper"
                      : "border-line bg-paper text-ink"
                  }`}
                >
                  {chord}
                </span>
              ))}
            </div>
          </section>

          {/* Main practice display */}
          <section
            className="rounded-2xl bg-night p-5 text-white sm:p-8"
            aria-labelledby="current-chord-heading"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D9AA90]">
                {finished
                  ? "Session complete"
                  : isPlaying
                    ? "Now playing"
                    : completedBeats
                      ? "Paused"
                      : "Ready to practice"}
              </p>

              <p className="text-sm text-white/70">
                Round {displayedRound} of{" "}
                {TARGET_ROUNDS}
              </p>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p
                  id="current-chord-heading"
                  className="text-sm text-white/65"
                >
                  Current chord
                </p>

                <p
                  className="mt-1 font-serif text-7xl tracking-tight sm:text-8xl"
                  aria-live="polite"
                >
                  {currentChord}
                </p>

                <p className="mt-5 text-sm text-white/70">
                  Up next:{" "}
                  <span className="font-semibold text-white">
                    {nextChord}
                  </span>
                </p>
              </div>

              <div
                className="flex gap-2"
                aria-label={`Beat ${currentBeat} of ${BEATS_PER_CHORD}`}
              >
                {Array.from(
                  { length: BEATS_PER_CHORD },
                  (_, index) => (
                    <span
                      key={index}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold tabular-nums ${
                        index + 1 === currentBeat
                          ? "border-[#D9AA90] bg-[#D9AA90] text-night"
                          : "border-white/25 text-white/70"
                      }`}
                    >
                      {index + 1}
                    </span>
                  )
                )}
              </div>
            </div>

            <div
              className="mt-8 h-2 overflow-hidden rounded-full bg-white/15"
              role="progressbar"
              aria-label="Practice session progress"
              aria-valuemin={0}
              aria-valuemax={totalBeats}
              aria-valuenow={completedBeats}
            >
              <div
                className="h-full rounded-full bg-[#D9AA90] transition-[width]"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-white/65">
              <span>
                {completedRounds} of{" "}
                {TARGET_ROUNDS} rounds completed
              </span>
              <span>{progressPercent}%</span>
            </div>
          </section>

          {/* Metronome controls */}
          <section
            className="rounded-2xl border border-line bg-white p-5 sm:p-7"
            aria-labelledby="tempo-heading"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2
                id="tempo-heading"
                className="font-serif text-2xl"
              >
                Tempo & controls
              </h2>

              <button
                type="button"
                aria-pressed={soundEnabled}
                onClick={() =>
                  setSoundEnabled((value) => !value)
                }
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-copper/50"
              >
                {soundEnabled ? (
                  <Volume2 size={17} />
                ) : (
                  <VolumeX size={17} />
                )}
                Sound {soundEnabled ? "on" : "off"}
              </button>
            </div>

            <div className="mt-7 flex items-center justify-between gap-5">
              <div>
                <p className="font-serif text-4xl tabular-nums">
                  {bpm}
                </p>
                <p className="mt-1 text-xs text-muted">
                  beats per minute
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Decrease tempo by five"
                  onClick={() =>
                    setBpm((value) =>
                      clampTempo(value - 5)
                    )
                  }
                  disabled={bpm <= 40}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-line hover:bg-paper disabled:opacity-40"
                >
                  <Minus size={18} />
                </button>

                <button
                  type="button"
                  aria-label="Increase tempo by five"
                  onClick={() =>
                    setBpm((value) =>
                      clampTempo(value + 5)
                    )
                  }
                  disabled={bpm >= 160}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-line hover:bg-paper disabled:opacity-40"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <label
              htmlFor="practice-bpm"
              className="sr-only"
            >
              Metronome tempo in beats per minute
            </label>

            <input
              id="practice-bpm"
              type="range"
              min="40"
              max="160"
              step="5"
              value={bpm}
              onChange={(event) =>
                setBpm(
                  clampTempo(
                    Number(event.target.value)
                  )
                )
              }
              className="mt-6 w-full accent-copper"
            />

            <div className="mt-1 flex justify-between text-xs text-muted">
              <span>40 BPM</span>
              <span>160 BPM</span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3 border-t border-line pt-6">
              <button
                type="button"
                onClick={
                  isPlaying
                    ? pause
                    : handleStart
                }
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-copper sm:flex-none"
              >
                {isPlaying ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} />
                )}

                {isPlaying
                  ? "Pause"
                  : finished
                    ? "Practice again"
                    : completedBeats
                      ? "Resume"
                      : "Start practice"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold hover:bg-paper"
              >
                <RotateCcw size={17} />
                Reset
              </button>
            </div>

            {audioError && (
              <p
                role="alert"
                className="mt-4 text-sm text-[#934A35]"
              >
                {audioError}
              </p>
            )}

            {finished && (
              <p
                role="status"
                className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#37784F]"
              >
                <CheckCircle2 size={18} />
                Four rounds complete. Try a slightly
                faster tempo when ready.
              </p>
            )}
          </section>
        </div>

        {/* Right-side practice guidance */}
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-28">
          <div className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-serif text-xl">
              Current chord shape
            </h2>

            <p className="mb-5 mt-2 text-xs leading-6 text-muted">
              Standard tuning · E A D G B e
            </p>

            <ChordDiagram chord={currentChord} />
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <h3 className="text-sm font-semibold">
              How to practice
            </h3>

            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted">
              <li>
                Set a slow tempo you can follow.
              </li>
              <li>
                Strum once on every beat.
              </li>
              <li>
                Change chords after four beats.
              </li>
              <li>
                Finish four rounds, then increase
                the speed.
              </li>
            </ol>

            <p className="mt-4 text-xs leading-6 text-muted">
              The timer pauses if you switch browser
              tabs. Keep this page visible during
              practice.
            </p>
          </div>

          <div className="rounded-2xl bg-copper-light p-5">
            <p className="text-sm font-semibold text-ink">
              Ready to play a song?
            </p>

            <p className="mt-2 text-sm leading-6 text-muted">
              Put these chord changes to work in
              the songbook, or review the
              beginner lessons.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/songs?difficulty=beginner"
                className="inline-flex items-center gap-2 text-sm font-semibold text-copper hover:underline"
              >
                <ArrowRight size={16} />
                Browse beginner songs
              </Link>

              <Link
                to="/learn"
                className="inline-flex items-center gap-2 text-sm font-semibold text-copper hover:underline"
              >
                <BookOpen size={16} />
                Review lessons
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
