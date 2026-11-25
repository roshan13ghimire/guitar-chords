import { Pause, Play, RotateCcw, Maximize2, Minimize2 } from "lucide-react";

export default function PracticeToolbar({
  playing,
  onPlayPause,
  onRestart,
  speed,
  onSpeedChange,
  focusMode,
  onFocusChange,
}) {
  return (
    <section
      aria-label="Practice controls"
      className={`sticky z-40 mb-6 rounded-2xl bg-night p-4 text-white shadow-lg sm:p-5 ${
        focusMode ? "top-3" : "top-23"
      }`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onPlayPause}
          aria-pressed={playing}
          className="inline-flex items-center gap-2 rounded-xl bg-copper px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a65d42]"
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
          {playing ? "Pause" : "Auto-scroll"}
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          title="Return to the beginning of the chord sheet"
          aria-label="Back to start of chord sheet"
        >
          <RotateCcw size={16} />
          <span className="hidden sm:inline">Back to top</span>
        </button>

        <div className="flex min-w-40 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-xs">
            <label htmlFor="scroll-speed" className="font-medium text-white/80">
              Scroll speed
            </label>
            <span className="tabular-nums text-[#D9AA90]">{speed} px/s</span>
          </div>
          <input
            id="scroll-speed"
            type="range"
            min="15"
            max="90"
            step="5"
            value={speed}
            onChange={(event) => onSpeedChange(Number(event.target.value))}
            className="w-full accent-copper"
          />
        </div>

        <button
          type="button"
          onClick={onFocusChange}
          aria-pressed={focusMode}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          {focusMode ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          {focusMode ? "Exit focus" : "Focus"}
        </button>
      </div>
    </section>
  );
}
