
const PITCHES = {
  C: 0, "C#": 1, Db: 1,
  D: 2, "D#": 3, Eb: 3,
  E: 4,
  F: 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8,
  A: 9, "A#": 10, Bb: 10,
  B: 11,
};

// Strings run from low E to high E.
// null = muted, 0 = open, positive number = fret.
// Finger numbers: 1 index, 2 middle, 3 ring, 4 pinky.
const OPEN_CHORDS = {
  C: {
    frets: [null, 3, 2, 0, 1, 0],
    fingers: [null, 3, 2, 0, 1, 0],
  },
  D: {
    frets: [null, null, 0, 2, 3, 2],
    fingers: [null, null, 0, 1, 3, 2],
  },
  E: {
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [0, 2, 3, 1, 0, 0],
  },
  G: {
    frets: [3, 2, 0, 0, 0, 3],
    fingers: [2, 1, 0, 0, 0, 3],
  },
  A: {
    frets: [null, 0, 2, 2, 2, 0],
    fingers: [null, 0, 1, 2, 3, 0],
  },
  Am: {
    frets: [null, 0, 2, 2, 1, 0],
    fingers: [null, 0, 2, 3, 1, 0],
  },
  Dm: {
    frets: [null, null, 0, 2, 3, 1],
    fingers: [null, null, 0, 2, 3, 1],
  },
  Em: {
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [0, 2, 3, 0, 0, 0],
  },
};

function barreShape(fret, base, minor) {
  if (base === "E") {
    return {
      frets: minor
        ? [fret, fret + 2, fret + 2, fret, fret, fret]
        : [fret, fret + 2, fret + 2, fret + 1, fret, fret],
      fingers: minor
        ? [1, 3, 4, 1, 1, 1]
        : [1, 3, 4, 2, 1, 1],
      barre: { fret, from: 0, to: 5 },
    };
  }

  return {
    frets: minor
      ? [null, fret, fret + 2, fret + 2, fret + 1, fret]
      : [null, fret, fret + 2, fret + 2, fret + 2, fret],
    fingers: minor
      ? [null, 1, 3, 4, 2, 1]
      : [null, 1, 2, 3, 4, 1],
    barre: { fret, from: 1, to: 5 },
  };
}

export function getChordShape(chord) {
  // Only major and minor triads for now.
  const match = /^([A-G](?:#|b)?)(m?)$/.exec(chord);

  if (!match) return null;

  const [, root, quality] = match;
  const pitch = PITCHES[root];

  if (pitch === undefined) return null;

  const minor = quality === "m";

  const openName =
    Object.keys(OPEN_CHORDS).find((name) => {
      const parsed = /^([A-G](?:#|b)?)(m?)$/.exec(name);
      return (
        parsed &&
        PITCHES[parsed[1]] === pitch &&
        (parsed[2] === "m") === minor
      );
    });

  if (openName) {
    return OPEN_CHORDS[openName];
  }

  // Movable E and A major/minor barre shapes.
  const eFret = (pitch - 4 + 12) % 12;
  const aFret = (pitch - 9 + 12) % 12;

  if (eFret <= aFret) {
    return barreShape(eFret, "E", minor);
  }

  return barreShape(aFret, "A", minor);
}

export function extractChords(content = "") {
  const matches = [...content.matchAll(/\[([^\]\r\n]+)\]/g)];

  const chordPattern =
    /^[A-G](?:#|b)?(?:m|maj7|m7|7|sus2|sus4|dim|aug|add9)?(?:\/[A-G](?:#|b)?)?$/;

  return [
    ...new Set(
      matches
        .map((match) => match[1].trim())
        .filter((chord) => chordPattern.test(chord))
    ),
  ];
}
