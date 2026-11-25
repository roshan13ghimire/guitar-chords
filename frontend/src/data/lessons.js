
export const LESSONS = [
  {
    slug: "start-here",
    number: 1,
    label: "Getting started",
    title: "Meet your guitar",
    minutes: 6,
    summary:
      "Learn string names, standard tuning, and a comfortable playing position.",
    intro:
      "Before learning chords, get comfortable holding your guitar and recognizing its six strings.",
    sections: [
      {
        heading: "Know the six strings",
        text:
          "From the thickest string to the thinnest, standard guitar tuning is E – A – D – G – B – e. The lower-case e is the high E string. These are the pitches of the open strings, not finger positions.",
        tips: [
          "String 6 (thickest): low E; string 1 (thinnest): high e.",
          "A guitar tuner can help you match each open string to its target pitch.",
          "Tune slowly and never tighten a string if you are unsure which pitch it should reach.",
        ],
      },
      {
        heading: "Set up a relaxed posture",
        text:
          "Sit steadily, rest the guitar against your body, and keep your fretting wrist relaxed. Press with your fingertips near (not directly on) the fret wire. Your thumb can rest lightly behind the neck.",
        tips: [
          "Avoid squeezing the neck harder than necessary.",
          "If your wrist or hand hurts, stop and adjust your position.",
        ],
      },
    ],
    chords: [],
    exercises: [
      {
        id: "identify-strings",
        title: "Name all six strings",
        detail:
          "Say E, A, D, G, B, e from thickest to thinnest without looking at the guide.",
      },
      {
        id: "tuning",
        title: "Check standard tuning",
        detail:
          "Use a reliable tuner to check all six open strings.",
      },
      {
        id: "clear-notes",
        title: "Play six clear open notes",
        detail:
          "Pick each string separately and listen for an even sound.",
      },
    ],
  },
  {
    slug: "read-chord-diagrams",
    number: 2,
    label: "Reading diagrams",
    title: "Understand chord charts",
    minutes: 7,
    summary:
      "Read strings, frets, open strings, muted strings, and finger positions.",
    intro:
      "A chord diagram is a small map of the guitar neck. Learn its symbols before memorizing shapes.",
    sections: [
      {
        heading: "Read the grid",
        text:
          "The six vertical lines represent strings: low E on the left and high e on the right. Horizontal lines represent frets. A dot marks where to press the string.",
        tips: [
          "An O above a string means play it open.",
          "An X means do not play that string.",
          "Fretting-hand fingers are numbered 1 index, 2 middle, 3 ring, and 4 pinky.",
        ],
      },
      {
        heading: "Try the E minor shape",
        text:
          "E minor (Em) can be played 0-2-2-0-0-0 from low E to high e. Fret the A and D strings at the second fret and let the other four strings ring open.",
        tips: [
          "Place fingers just behind the second fret, not on the fret wire.",
          "Pick each string individually before strumming all six.",
        ],
      },
    ],
    chords: ["Em"],
    exercises: [
      {
        id: "symbols",
        title: "Explain O and X",
        detail:
          "Say what an open-string symbol and a muted-string symbol mean.",
      },
      {
        id: "finger-map",
        title: "Place the Em fingering",
        detail:
          "Put two fingertips on the second frets of the A and D strings.",
      },
      {
        id: "check-strings",
        title: "Play Em cleanly",
        detail:
          "Pick all six strings and check that every intended note sounds clear.",
      },
    ],
  },
  {
    slug: "first-two-chords",
    number: 3,
    label: "First chord shapes",
    title: "Play Em and G",
    minutes: 9,
    summary:
      "Learn two useful chord shapes and practice your first change.",
    intro:
      "Start with two familiar sounds. The goal is not speed; it is playing every note clearly.",
    sections: [
      {
        heading: "E minor (Em)",
        text:
          "Use the shape 0-2-2-0-0-0, reading strings from low E to high e. All six strings can sound.",
        tips: [
          "Keep your fingertips curved so neighboring strings remain clear.",
        ],
      },
      {
        heading: "G major (G)",
        text:
          "One common open G shape is 3-2-0-0-0-3. Fret low E at 3, A at 2, and high e at 3; let D, G, and B ring open.",
        tips: [
          "G has several valid fingerings; use the one represented by your chosen diagram consistently.",
          "Switch slowly between Em and G, then pick individual strings to check for buzzing.",
        ],
      },
    ],
    chords: ["Em", "G"],
    exercises: [
      {
        id: "em-clear",
        title: "Play Em four times",
        detail:
          "Strum Em four times without unwanted buzzing.",
      },
      {
        id: "g-clear",
        title: "Play G four times",
        detail:
          "Form G and strum four clean, evenly spaced sounds.",
      },
      {
        id: "em-g",
        title: "Change between Em and G",
        detail:
          "Make five slow Em → G → Em changes without rushing.",
      },
    ],
  },
  {
    slug: "add-c-and-d",
    number: 4,
    label: "Build your vocabulary",
    title: "Add C and D",
    minutes: 10,
    summary:
      "Learn C major and D major, and discover which strings to avoid.",
    intro:
      "You now know Em and G. Add C and D to play many simple four-chord progressions.",
    sections: [
      {
        heading: "C major (C)",
        text:
          "A common open C shape is x-3-2-0-1-0. Play from the A string to the high e; do not strum the low E string.",
        tips: [
          "A string fret 3, D string fret 2, B string fret 1; G and high e ring open.",
        ],
      },
      {
        heading: "D major (D)",
        text:
          "A common open D shape is x-x-0-2-3-2. Strum only the D, G, B, and high e strings.",
        tips: [
          "Keep the low E and A strings out of your strum.",
          "Pick the four sounding strings individually before playing the chord together.",
        ],
      },
    ],
    chords: ["C", "D"],
    exercises: [
      {
        id: "c-clear",
        title: "Play C without low E",
        detail:
          "Strum C four times, starting your strum at the A string.",
      },
      {
        id: "d-clear",
        title: "Play D using four strings",
        detail:
          "Strum D four times, starting your strum at the D string.",
      },
      {
        id: "g-c-d",
        title: "Change G → C → D",
        detail:
          "Make three slow rounds with a pause between changes if needed.",
      },
    ],
  },
  {
    slug: "first-progression",
    number: 5,
    label: "Put it together",
    title: "Your first progression",
    minutes: 12,
    summary:
      "Practice G – D – Em – C with a steady four-beat rhythm.",
    intro:
      "Bring your first four chords together. Consistent timing matters more than playing fast.",
    sections: [
      {
        heading: "Count four steady beats",
        text:
          "Count '1, 2, 3, 4' at an even pace. Strum downward once on each count, then move to the next chord. Try a relaxed tempo around 60 beats per minute using a metronome if available.",
        tips: [
          "Four downstrokes per chord is enough to start.",
          "If a change takes too long, slow down rather than skipping beats.",
        ],
      },
      {
        heading: "Play G – D – Em – C",
        text:
          "Hold G for four beats, D for four, Em for four, and C for four. Then repeat. This is a generic practice exercise, not a transcription of any particular song.",
        tips: [
          "First practice the changes without strumming.",
          "Then add one downstroke per beat and repeat the sequence three times.",
        ],
      },
    ],
    chords: ["G", "D", "Em", "C"],
    exercises: [
      {
        id: "count",
        title: "Count four-beat measures",
        detail:
          "Count 1–2–3–4 aloud for four measures at an even tempo.",
      },
      {
        id: "progression",
        title: "Play one complete sequence",
        detail:
          "Strum G → D → Em → C using four downstrokes per chord.",
      },
      {
        id: "repeat",
        title: "Repeat the sequence three times",
        detail:
          "Keep a steady pace, even if you need a slower tempo.",
      },
    ],
  },
];

export function lessonIsComplete(lesson, progress) {
  const checked = Array.isArray(progress[lesson.slug])
    ? progress[lesson.slug]
    : [];

  return lesson.exercises.every((exercise) =>
    checked.includes(exercise.id)
  );
}
