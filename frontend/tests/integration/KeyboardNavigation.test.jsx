
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import App from "../../src/App";

vi.mock("../../src/components/SiteHeader", () => ({
  default: () => (
    <header>
      <nav aria-label="Primary">
        <a href="/songs">Songs</a>
      </nav>
    </header>
  ),
}));

vi.mock("../../src/pages/HomePage", () => ({
  default: () => (
    <main>
      <h1>Test homepage</h1>
    </main>
  ),
}));

vi.mock("../../src/pages/SongPage", () => ({
  default: () => <main>Song</main>,
}));

vi.mock("../../src/pages/BrowseSongsPage", () => ({
  default: () => <main>Browse songs</main>,
}));

vi.mock("../../src/pages/ChordLibraryPage", () => ({
  default: () => <main>Chord library</main>,
}));

vi.mock("../../src/pages/ContributePage", () => ({
  default: () => <main>Contribute</main>,
}));

vi.mock("../../src/pages/ArtistsPage", () => ({
  default: () => <main>Artists</main>,
}));

vi.mock("../../src/pages/ArtistDetailPage", () => ({
  default: () => <main>Artist profile</main>,
}));

vi.mock("../../src/pages/LessonsPage", () => ({
  default: () => <main>Lessons</main>,
  LessonDetailPage: () => <main>Lesson detail</main>,
}));

vi.mock("../../src/pages/PracticePage", () => ({
  default: () => <main>Practice</main>,
}));

beforeEach(() => {
  window.history.replaceState({}, "", "/");
  vi.stubGlobal("scrollTo", vi.fn());
});

describe("Keyboard accessibility", () => {
  it("allows keyboard users to skip navigation", async () => {
    const user = userEvent.setup();

    render(<App />);

    const skipLink = screen.getByRole("link", {
      name: "Skip to main content",
    });

    expect(skipLink).toHaveAttribute(
      "href",
      "#main-content"
    );

    await user.tab();

    expect(skipLink).toHaveFocus();

    await user.keyboard("{Enter}");

    const mainContent =
      document.getElementById("main-content");

    expect(mainContent).toHaveFocus();

    expect(
      screen.getByRole("heading", {
        name: "Test homepage",
      })
    ).toBeInTheDocument();
  });
});
