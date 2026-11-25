
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_SECONDS = 0.12;

function scheduleClick(context, output, time, accented) {
  const oscillator = context.createOscillator();
  const volume = context.createGain();

  oscillator.type = "sine";

  oscillator.frequency.setValueAtTime(
    accented ? 1040 : 760,
    time
  );

  volume.gain.setValueAtTime(0.0001, time);

  volume.gain.exponentialRampToValueAtTime(
    accented ? 0.2 : 0.12,
    time + 0.004
  );

  volume.gain.exponentialRampToValueAtTime(
    0.0001,
    time + 0.055
  );

  oscillator.connect(volume);
  volume.connect(output);

  oscillator.start(time);
  oscillator.stop(time + 0.06);

  oscillator.onended = () => {
    oscillator.disconnect();
    volume.disconnect();
  };
}

export default function useMetronome({
  bpm,
  soundEnabled,
  onBeat,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");

  const contextRef = useRef(null);
  const outputRef = useRef(null);
  const timerRef = useRef(null);

  const pendingRef = useRef(new Set());

  const nextTimeRef = useRef(0);
  const nextIndexRef = useRef(0);
  const lastDeliveredRef = useRef(-1);

  const generationRef = useRef(0);
  const playingRef = useRef(false);
  const startingRef = useRef(false);

  const bpmRef = useRef(bpm);
  const soundRef = useRef(soundEnabled);
  const onBeatRef = useRef(onBeat);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    onBeatRef.current = onBeat;
  }, [onBeat]);

  const schedule = useCallback(() => {
    const context = contextRef.current;
    const output = outputRef.current;

    if (
      !playingRef.current ||
      !context ||
      !output
    ) {
      return;
    }

    // Avoid playing a burst of missed beats when
    // the browser resumes from suspension.
    if (
      nextTimeRef.current <
      context.currentTime - 0.25
    ) {
      nextTimeRef.current = context.currentTime + 0.05;
    }

    while (
      nextTimeRef.current <
      context.currentTime + SCHEDULE_AHEAD_SECONDS
    ) {
      const time = nextTimeRef.current;
      const index = nextIndexRef.current;
      const generation = generationRef.current;

      if (soundRef.current) {
        scheduleClick(
          context,
          output,
          time,
          index % 4 === 0
        );
      }

      const delay = Math.max(
        0,
        (time - context.currentTime) * 1000
      );

      const timeoutId = window.setTimeout(() => {
        pendingRef.current.delete(timeoutId);

        if (
          !playingRef.current ||
          generationRef.current !== generation
        ) {
          return;
        }

        lastDeliveredRef.current = index;
        onBeatRef.current(index);
      }, delay);

      pendingRef.current.add(timeoutId);

      nextIndexRef.current += 1;
      nextTimeRef.current += 60 / bpmRef.current;
    }
  }, []);

  // Stop all scheduled work without updating React
  // state. Safe to call when the component unmounts.
  const stopTransport = useCallback(() => {
    playingRef.current = false;
    generationRef.current += 1;

    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    for (const timeoutId of pendingRef.current) {
      window.clearTimeout(timeoutId);
    }

    pendingRef.current.clear();

    if (outputRef.current) {
      outputRef.current.disconnect();
      outputRef.current = null;
    }

    nextIndexRef.current =
      lastDeliveredRef.current + 1;
  }, []);

  const pause = useCallback(() => {
    stopTransport();
    setIsPlaying(false);
  }, [stopTransport]);

  const reset = useCallback(() => {
    pause();

    nextIndexRef.current = 0;
    lastDeliveredRef.current = -1;

    setAudioError("");
  }, [pause]);

  const closeAudio = useCallback(() => {
    const context = contextRef.current;
    contextRef.current = null;

    if (
      context &&
      context.state !== "closed"
    ) {
      void context.close().catch(() => {});
    }
  }, []);

  const start = useCallback(async () => {
    if (
      playingRef.current ||
      startingRef.current
    ) {
      return false;
    }

    startingRef.current = true;

    const generationBeforeStart =
      generationRef.current;

    try {
      const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error(
          "Audio timing is unavailable in this browser."
        );
      }

      if (
        !contextRef.current ||
        contextRef.current.state === "closed"
      ) {
        contextRef.current =
          new AudioContextClass();
      }

      const context = contextRef.current;

      await context.resume();

      // The visitor might have reset, changed
      // presets, or navigated away during resume.
      if (
        generationRef.current !==
        generationBeforeStart
      ) {
        return false;
      }

      const output = context.createGain();
      output.connect(context.destination);

      outputRef.current = output;

      playingRef.current = true;
      generationRef.current += 1;

      nextTimeRef.current =
        context.currentTime + 0.06;

      setAudioError("");
      setIsPlaying(true);

      schedule();

      timerRef.current = window.setInterval(
        schedule,
        LOOKAHEAD_MS
      );

      return true;
    } catch (error) {
      setAudioError(
        error.message ||
          "Unable to start the practice timer."
      );

      return false;
    } finally {
      startingRef.current = false;
    }
  }, [schedule]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) {
        pause();
      }
    }

    document.addEventListener(
      "visibilitychange",
      onVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );
    };
  }, [pause]);

  // Cleanup uses stable callbacks rather than
  // reading mutable refs directly inside the
  // effect cleanup function.
  useEffect(() => {
    return () => {
      stopTransport();
      closeAudio();
    };
  }, [stopTransport, closeAudio]);

  return {
    isPlaying,
    audioError,
    start,
    pause,
    reset,
  };
}
