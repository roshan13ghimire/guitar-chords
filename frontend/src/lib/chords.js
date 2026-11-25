
const SHARP_NOTES = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B",
];

const FLAT_NOTES = [
  "C", "Db", "D", "Eb", "E", "F",
  "Gb", "G", "Ab", "A", "Bb", "B",
];

const NOTE_INDEX = Object.fromEntries([
  ...SHARP_NOTES.map((note, index) => [note, index]),
  ...FLAT_NOTES.map((note, index) => [note, index]),
]);

export function transposeChord(chord, semitones = 0) {
  if (!chord || !Number.isInteger(semitones)) {
    return chord;
  }

  return chord.replace(
    /(^|\/)([A-G](?:#|b)?)/g,
    (match, prefix, root) => {
      const index = NOTE_INDEX[root];

      if (index === undefined) {
        return match;
      }

      const nextIndex =
        ((index + semitones) % 12 + 12) % 12;

      const preferFlats =
  root.includes("b") ||
  (semitones < 0 && !root.includes("#"));

       const notes = preferFlats ? FLAT_NOTES : SHARP_NOTES;
    

      return prefix + notes[nextIndex];
    }
  );
}
