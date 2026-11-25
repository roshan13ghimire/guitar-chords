
import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock3,
  Guitar,
  RotateCcw,
} from "lucide-react";

import ChordDiagram from "../components/ChordDiagram";
import { LESSONS, lessonIsComplete } from "../data/lessons";
import useLessonProgress from "../hooks/useLessonProgress";


function ProgressTrack({ completed, total }) {
  const percent = total
    ? Math.round((completed / total) * 100)
    : 0;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-ink">
          Your learning progress
        </span>
        <span className="text-muted">
          {completed} of {total} lessons
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-[#E9E5DE]"
        role="progressbar"
        aria-label="Completed lessons"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
      >
        <div
          className="h-full rounded-full bg-copper transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-muted">
        Progress is saved only in this browser. It won't
        sync across devices or private-browsing sessions.
      </p>
    </div>
  );
}


export default function LessonsPage() {
  const { progress, resetProgress } = useLessonProgress();

  const completed = LESSONS.filter((lesson) =>
    lessonIsComplete(lesson, progress)
  ).length;

  const nextLesson = LESSONS.find(
    (lesson) => !lessonIsComplete(lesson, progress)
  );

  function handleReset() {
    if (
      window.confirm(
        "Clear all saved lesson progress on this browser?"
      )
    ) {
      resetProgress();
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 sm:px-8 sm:pt-20">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-copper">
            <BookOpen size={16} />
            Beginner lessons
          </p>

          <h1 className="max-w-3xl font-serif text-[clamp(2.8rem,5vw,4.6rem)] leading-[1.1] tracking-[-0.045em] text-ink">
            Learn guitar,{" "}
            <span className="italic text-copper">
              one chord at a time.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            Five short lessons that take you from your
            first guitar string to a simple four-chord
            progression. No account required.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8">
        <div className="grid gap-5 rounded-2xl border border-line bg-white p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <ProgressTrack
            completed={completed}
            total={LESSONS.length}
          />

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/learn/${
                (nextLesson || LESSONS[0]).slug
              }/`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-copper"
            >
              {nextLesson
                ? "Continue learning"
                : "Review lessons"}
              <ArrowRight size={17} />
            </Link>

            {completed > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-medium text-muted hover:text-ink"
              >
                <RotateCcw size={15} />
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="mb-8 mt-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-copper">
            Learning path
          </p>

          <h2 className="font-serif text-3xl text-ink sm:text-4xl">
            Five steps to get started
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {LESSONS.map((lesson) => {
            const done = lessonIsComplete(
              lesson,
              progress
            );

            const checked = (
              Array.isArray(progress[lesson.slug])
                ? progress[lesson.slug]
                : []
            ).filter((id) =>
              lesson.exercises.some(
                (exercise) => exercise.id === id
              )
            ).length;

            return (
              <Link
                key={lesson.slug}
                to={`/learn/${lesson.slug}/`}
                className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-copper/40 hover:shadow-[0_14px_40px_rgba(36,41,37,0.06)] sm:p-7"
              >
                <div className="mb-6 flex items-start justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-copper-light font-serif text-2xl text-copper">
                    {String(lesson.number).padStart(2, "0")}
                  </span>

                  {done ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#37784F]">
                      <CheckCircle2 size={17} />
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                      <Clock3 size={15} />
                      {lesson.minutes} min
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold uppercase tracking-wide text-copper">
                  {lesson.label}
                </p>

                <h3 className="mt-2 font-serif text-2xl tracking-tight text-ink">
                  {lesson.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted">
                  {lesson.summary}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-5">
                  <span className="text-xs text-muted">
                    {checked}/{lesson.exercises.length} exercises
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-copper">
                    Open lesson
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl bg-night p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D9AA90]">
              Chord reference
            </p>

            <h3 className="mt-3 font-serif text-2xl">
              Need a chord diagram?
            </h3>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
              Visit the chord library for fingering
              diagrams while you practice.
            </p>
          </div>

          <Link
            to="/chords"
            className="mt-5 inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-[#F1DED3] sm:mt-0"
          >
            Explore chords
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}


export function LessonDetailPage() {
  const { slug } = useParams();
  const { progress, toggleExercise } =
    useLessonProgress();

  const index = LESSONS.findIndex(
    (item) => item.slug === slug
  );

  const lesson = LESSONS[index];

  if (!lesson) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <h1 className="font-serif text-3xl text-ink">
          Lesson not found
        </h1>

        <Link
          to="/learn"
          className="mt-6 text-sm font-semibold text-copper hover:underline"
        >
          Return to lessons
        </Link>
      </main>
    );
  }

  const checked = Array.isArray(progress[lesson.slug])
    ? progress[lesson.slug]
    : [];

  const completedCount = lesson.exercises.filter(
    (exercise) => checked.includes(exercise.id)
  ).length;

  const complete =
    completedCount === lesson.exercises.length;

  const next = LESSONS[index + 1];
  const previous = LESSONS[index - 1];

  return (
    <main className="min-h-screen bg-paper">
      <section className="border-b border-line">
        <div className="mx-auto max-w-5xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-copper"
          >
            <ArrowLeft size={16} />
            All beginner lessons
          </Link>

          <p className="mb-3 mt-10 text-xs font-bold uppercase tracking-[0.16em] text-copper">
            Lesson {lesson.number} of {LESSONS.length} ·{" "}
            {lesson.minutes} min
          </p>

          <h1 className="font-serif text-[clamp(2.5rem,5vw,4.2rem)] leading-tight tracking-[-0.04em] text-ink">
            {lesson.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
            {lesson.intro}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_245px] lg:items-start">
          <div className="space-y-6">
            {lesson.sections.map(
              (section, sectionIndex) => (
                <section
                  key={section.heading}
                  className="rounded-2xl border border-line bg-white p-6 sm:p-8"
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-copper">
                    Part {sectionIndex + 1}
                  </p>

                  <h2 className="font-serif text-2xl text-ink sm:text-3xl">
                    {section.heading}
                  </h2>

                  <p className="mt-4 text-sm leading-8 text-muted sm:text-base">
                    {section.text}
                  </p>

                  <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
                    {section.tips.map((tip) => (
                      <li key={tip}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </section>
              )
            )}

            {lesson.chords.length > 0 && (
              <section className="rounded-2xl border border-line bg-white p-6 sm:p-8">
                <div className="mb-6 flex items-center gap-2 text-copper">
                  <Guitar size={19} />

                  <h2 className="font-serif text-2xl text-ink">
                    Chord diagrams
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {lesson.chords.map((chord) => (
                    <ChordDiagram
                      key={chord}
                      chord={chord}
                    />
                  ))}
                </div>

                <p className="mt-5 text-xs leading-6 text-muted">
                  Diagrams show common fingerings. Play
                  each intended string slowly before
                  strumming.
                </p>
              </section>
            )}

            <section
              className="rounded-2xl border border-line bg-white p-6 sm:p-8"
              aria-labelledby="practice-title"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-copper">
                    Try it yourself
                  </p>

                  <h2
                    id="practice-title"
                    className="font-serif text-2xl text-ink sm:text-3xl"
                  >
                    Practice exercises
                  </h2>
                </div>

                <span className="text-sm font-medium text-muted">
                  {completedCount}/{lesson.exercises.length} complete
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-muted">
                Check an exercise only after trying it
                on your guitar. Your progress is saved
                locally in this browser.
              </p>

              <div className="mt-6 space-y-3">
                {lesson.exercises.map((exercise) => {
                  const isChecked = checked.includes(
                    exercise.id
                  );

                  return (
                    <label
                      key={exercise.id}
                      className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition sm:p-5 ${
                        isChecked
                          ? "border-[#C7DCCB] bg-[#F3F8F3]"
                          : "border-line bg-paper hover:border-copper/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          toggleExercise(
                            lesson.slug,
                            exercise.id
                          )
                        }
                        className="mt-1 h-4 w-4 shrink-0 accent-copper"
                      />

                      <span className="block">
                        <span className="block text-sm font-semibold text-ink">
                          {exercise.title}
                        </span>

                        <span className="mt-1 block text-sm leading-6 text-muted">
                          {exercise.detail}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              {complete && (
                <div
                  role="status"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-[#C7DCCB] bg-[#F3F8F3] p-4 text-sm leading-6 text-[#326848]"
                >
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0"
                  />
                  All exercises completed. You can
                  move to the next lesson or return
                  here to review.
                </div>
              )}
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              {previous ? (
                <Link
                  to={`/learn/${previous.slug}/`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
                >
                  <ArrowLeft size={17} />
                  Previous lesson
                </Link>
              ) : (
                <span />
              )}

              {next ? (
                <Link
                  to={`/learn/${next.slug}/`}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-copper"
                >
                  Next lesson
                  <ArrowRight size={17} />
                </Link>
              ) : (
                <Link
                  to="/learn"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-copper"
                >
                  Back to learning path
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-copper">
              Your place
            </p>

            <div className="mt-4 flex items-center gap-3">
              {complete ? (
                <CheckCircle2
                  size={23}
                  className="text-[#37784F]"
                />
              ) : (
                <Circle
                  size={23}
                  className="text-copper"
                />
              )}

              <span className="font-semibold text-ink">
                {complete
                  ? "Lesson completed"
                  : "In progress"}
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-muted">
              {completedCount} of {lesson.exercises.length}{" "}
              exercises completed
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E9E5DE]">
              <div
                className="h-full rounded-full bg-copper transition-all"
                style={{
                  width: `${
                    (completedCount /
                      lesson.exercises.length) *
                    100
                  }%`,
                }}
              />
            </div>

            <Link
              to="/chords"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-copper hover:underline"
            >
              View chord library
              <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
