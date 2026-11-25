
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  MemoryRouter,
  Route,
  Routes,
} from "react-router";

import BrowseSongsPage from "../../src/pages/BrowseSongsPage";

import {
  getArtists,
  getSongs,
} from "../../src/lib/api";


vi.mock("../../src/lib/api", () => ({
  getArtists: vi.fn(),
  getSongs: vi.fn(),
}));


const artists = [
  { id: 10, name: "Acoustic Artist" },
  { id: 20, name: "Second Artist" },
];

const songs = [
  {
    id: 1,
    title: "Alpha Lesson",
    alternate_title: "Pahilo Geet",
    language: "ne",
    artist: artists[0],
    difficulties: ["beginner"],
    genre: "Acoustic",
  },
  {
    id: 2,
    title: "Zebra Practice",
    alternate_title: "",
    language: "hi",
    artist: artists[1],
    difficulties: ["advanced"],
    genre: "",
  },
];


function renderBrowser(initialUrl = "/songs") {
  return render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <Routes>
        <Route
          path="/songs"
          element={<BrowseSongsPage />}
        />

        <Route
          path="/songs/:id/"
          element={<div>Song player test route</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}


beforeEach(() => {
  vi.resetAllMocks();

  getArtists.mockResolvedValue(artists);

  getSongs.mockImplementation(async ({
    language = "all",
    search = "",
    artist = "",
    difficulty = "",
    sort = "title",
  } = {}) => {
    const query = search.toLowerCase();

    const result = songs.filter((song) => {
      const matchesSearch =
        !query ||
        song.title.toLowerCase().includes(query) ||
        song.alternate_title.toLowerCase().includes(query) ||
        song.artist.name.toLowerCase().includes(query);

      const matchesLanguage =
        language === "all" ||
        !language ||
        song.language === language;

      const matchesArtist =
        !artist ||
        String(song.artist.id) === String(artist);

      const matchesDifficulty =
        !difficulty ||
        song.difficulties.includes(difficulty);

      return (
        matchesSearch &&
        matchesLanguage &&
        matchesArtist &&
        matchesDifficulty
      );
    });

    if (sort === "title_desc") {
      result.reverse();
    }

    return result;
  });
});


describe("Browse Songs integration", () => {
  it("renders the published song list", async () => {
    renderBrowser();

    expect(
      await screen.findByRole("heading", {
        name: "Alpha Lesson",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Zebra Practice",
      })
    ).toBeInTheDocument();

    expect(getSongs).toHaveBeenCalled();
  });


  it("searches by alternate song title", async () => {
    const user = userEvent.setup();

    renderBrowser();

    await screen.findByRole("heading", {
      name: "Alpha Lesson",
    });

    await user.type(
      screen.getByRole("searchbox"),
      "Pahilo"
    );

    await waitFor(() => {
      expect(getSongs).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "Pahilo",
        })
      );
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", {
          name: "Zebra Practice",
        })
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", {
        name: "Alpha Lesson",
      })
    ).toBeInTheDocument();
  });


  it("combines language and difficulty filters", async () => {
    const user = userEvent.setup();

    renderBrowser();

    await screen.findByRole("heading", {
      name: "Alpha Lesson",
    });

    await user.selectOptions(
      screen.getByLabelText("Language"),
      "hi"
    );

    await user.selectOptions(
      screen.getByLabelText("Difficulty"),
      "advanced"
    );

    await waitFor(() => {
      expect(getSongs).toHaveBeenCalledWith(
        expect.objectContaining({
          language: "hi",
          difficulty: "advanced",
        })
      );
    });

    expect(
      await screen.findByRole("heading", {
        name: "Zebra Practice",
      })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", {
          name: "Alpha Lesson",
        })
      ).not.toBeInTheDocument();
    });
  });


  it("opens a selected song", async () => {
    const user = userEvent.setup();

    renderBrowser();

    await screen.findByRole("heading", {
      name: "Alpha Lesson",
    });

    await user.click(
      screen.getByRole("link", {
        name: /Alpha Lesson/,
      })
    );

    expect(
      screen.getByText("Song player test route")
    ).toBeInTheDocument();
  });
});
