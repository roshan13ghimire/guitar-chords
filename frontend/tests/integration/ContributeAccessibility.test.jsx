
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

import { MemoryRouter } from "react-router";

import ContributePage from "../../src/pages/ContributePage";

import { getSongs } from "../../src/lib/api";

vi.mock("../../src/lib/api", () => ({
  getSongs: vi.fn(),
  getSong: vi.fn(),
  submitCommunitySubmission: vi.fn(),
}));

function renderForm() {
  return render(
    <MemoryRouter>
      <ContributePage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.resetAllMocks();

  getSongs.mockResolvedValue([
    {
      id: 1,
      title: "Practice Song",
      artist: {
        id: 10,
        name: "Practice Artist",
      },
    },
  ]);
});

describe("Contribution form accessibility", () => {
  it("associates suggestion labels with inputs", async () => {
    const user = userEvent.setup();

    renderForm();

    const songTitle = screen.getByRole("textbox", {
      name: "Song title",
    });

    expect(songTitle).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: "Artist or band",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", {
        name: "Song language",
      })
    ).toBeInTheDocument();

    const details = screen.getByRole("textbox", {
      name: "Why should we add this song?",
    });

    expect(details).toHaveAccessibleDescription(
      /Tell us which song/
    );

    expect(
      screen.getByRole("textbox", {
        name: "Reference URL (optional)",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: "Your name (optional)",
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByText("Song title")
    );

    expect(songTitle).toHaveFocus();
  });

  it("provides labels in correction mode", async () => {
    const user = userEvent.setup();

    renderForm();

    await user.click(
      screen.getByRole("button", {
        name: "Report error",
      })
    );

    expect(
      screen.getByRole("combobox", {
        name: "Select a song",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("combobox", {
        name: "Chord arrangement",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: "What is incorrect in the chords?",
      })
    ).toHaveAccessibleDescription(
      /Mention the section/
    );

    expect(
      screen.getByRole("button", {
        name: "Report error",
      })
    ).toHaveAttribute("aria-pressed", "true");
  });
});
