
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "guitar-chords-lesson-progress-v1";

function readSavedProgress() {
  if (typeof window === "undefined") return {};

  try {
    const stored = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "{}"
    );

    return (
      stored &&
      typeof stored === "object" &&
      !Array.isArray(stored)
    )
      ? stored
      : {};
  } catch {
    return {};
  }
}

export default function useLessonProgress() {
  const [progress, setProgress] = useState(readSavedProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(progress)
      );
    } catch {
      // Browsers may block local storage.
      // Exercises still work for this visit.
    }
  }, [progress]);

  const toggleExercise = useCallback((slug, exerciseId) => {
    setProgress((current) => {
      const previous = Array.isArray(current[slug])
        ? current[slug]
        : [];

      const next = previous.includes(exerciseId)
        ? previous.filter((id) => id !== exerciseId)
        : [...previous, exerciseId];

      return { ...current, [slug]: next };
    });
  }, []);

  const resetProgress = useCallback(
    () => setProgress({}),
    []
  );

  return {
    progress,
    toggleExercise,
    resetProgress,
  };
}
