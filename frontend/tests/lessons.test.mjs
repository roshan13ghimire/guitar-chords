
import test from "node:test";
import assert from "node:assert/strict";

import {
  LESSONS,
  lessonIsComplete,
} from "../src/data/lessons.js";


test("learning path contains at least five lessons", () => {
  assert.ok(LESSONS.length >= 5);
});


test("lesson slugs and numbers are unique", () => {
  const slugs = LESSONS.map((lesson) => lesson.slug);
  const numbers = LESSONS.map((lesson) => lesson.number);

  assert.equal(new Set(slugs).size, LESSONS.length);
  assert.equal(new Set(numbers).size, LESSONS.length);
});


test("all lessons have valid content", () => {
  for (const lesson of LESSONS) {
    assert.ok(lesson.title.trim());
    assert.ok(lesson.summary.trim());
    assert.ok(lesson.intro.trim());
    assert.ok(lesson.minutes > 0);

    assert.ok(lesson.sections.length > 0);
    assert.ok(lesson.exercises.length > 0);

    for (const section of lesson.sections) {
      assert.ok(section.heading.trim());
      assert.ok(section.text.trim());
      assert.ok(section.tips.length > 0);
    }
  }
});


test("exercise identifiers are unique within each lesson", () => {
  for (const lesson of LESSONS) {
    const ids = lesson.exercises.map(
      (exercise) => exercise.id
    );

    assert.equal(
      new Set(ids).size,
      ids.length,
      `Duplicate exercise ID in ${lesson.slug}`
    );
  }
});


test("new lessons are initially incomplete", () => {
  for (const lesson of LESSONS) {
    assert.equal(
      lessonIsComplete(lesson, {}),
      false
    );
  }
});


test("partially completed lessons remain incomplete", () => {
  for (const lesson of LESSONS) {
    const firstExercise = lesson.exercises[0].id;

    assert.equal(
      lessonIsComplete(lesson, {
        [lesson.slug]: [firstExercise],
      }),
      lesson.exercises.length === 1
    );
  }
});


test("all completed exercises mark a lesson complete", () => {
  for (const lesson of LESSONS) {
    const completed = lesson.exercises.map(
      (exercise) => exercise.id
    );

    assert.equal(
      lessonIsComplete(lesson, {
        [lesson.slug]: completed,
      }),
      true
    );
  }
});


test("progress from another lesson does not count", () => {
  const first = LESSONS[0];
  const second = LESSONS[1];

  const progress = {
    [first.slug]: first.exercises.map(
      (exercise) => exercise.id
    ),
  };

  assert.equal(lessonIsComplete(first, progress), true);
  assert.equal(lessonIsComplete(second, progress), false);
});


test("invalid stored progress does not mark completion", () => {
  const lesson = LESSONS[0];

  assert.equal(
    lessonIsComplete(lesson, {
      [lesson.slug]: "invalid",
    }),
    false
  );

  assert.equal(
    lessonIsComplete(lesson, {
      [lesson.slug]: null,
    }),
    false
  );
});
