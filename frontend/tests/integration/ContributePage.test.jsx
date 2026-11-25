
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { MemoryRouter } from "react-router";

import ContributePage from "../../src/pages/ContributePage";

import {
  getSongs,
  getSong,
  submitCommunitySubmission,
} from "../../src/lib/api";


vi.mock("../../src/lib/api", () => ({
  getSongs: vi.fn(),
  getSong: vi.fn(),
  submitCommunitySubmission: vi.fn(),
}));


function renderContributionForm() {
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
      title: "Alpha Lesson",
      artist: {
        id: 10,
        name: "Acoustic Artist",
      },
    },
  ]);

  getSong.mockResolvedValue({
    id: 1,
    title: "Alpha Lesson",
    arrangements: [
      {
        id: 9,
        title: "Standard",
        original_key: "G",
      },
    ],
  });

  submitCommunitySubmission.mockResolvedValue({
    message:
      "Your submission was received and is awaiting review.",
  });
});


describe("Community contribution integration", () => {
  it("submits a new song suggestion", async () => {
    const user = userEvent.setup();

    renderContributionForm();

    await user.type(
      screen.getByPlaceholderText("Enter the song title"),
      "Original Practice Song"
    );

    await user.type(
      screen.getByPlaceholderText("Singer or band name"),
      "Practice Artist"
    );

    await user.type(
      screen.getByPlaceholderText(
        "Tell us more about the song..."
      ),
      "Please consider adding this original practice song."
    );

    await user.click(
      screen.getByRole("button", {
        name: "Send for review",
      })
    );

    await waitFor(() => {
      expect(
        submitCommunitySubmission
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "song",
          song_title: "Original Practice Song",
          artist_name: "Practice Artist",
          language: "ne",
          company_website: "",
        })
      );
    });

    expect(
      await screen.findByRole("status")
    ).toHaveTextContent("awaiting review");
  });


  it("reports a correction for a published arrangement", async () => {
    const user = userEvent.setup();

    renderContributionForm();

    await user.click(
      screen.getByRole("button", {
        name: "Report error",
      })
    );

    await waitFor(() => {
      expect(getSongs).toHaveBeenCalled();
    });

    const selects = screen.getAllByRole("combobox");

    await user.selectOptions(selects[0], "1");

    await waitFor(() => {
      expect(getSong).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          signal: expect.any(Object),
        })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole("option", {
          name: /Standard/,
        })
      ).toBeInTheDocument();
    });

    await user.selectOptions(
      screen.getAllByRole("combobox")[1],
      "9"
    );

    await user.type(
      screen.getByPlaceholderText(
        /For example, the second chord/
      ),
      "The first verse should use Em instead of G."
    );

    await user.click(
      screen.getByRole("button", {
        name: "Send for review",
      })
    );

    await waitFor(() => {
      expect(
        submitCommunitySubmission
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: "correction",
          arrangement_id: 9,
          details:
            "The first verse should use Em instead of G.",
        })
      );
    });
  });


  it("displays submission errors without showing success", async () => {
    const user = userEvent.setup();

    submitCommunitySubmission.mockRejectedValue(
      new Error(
        "Too many submissions. Please try again later."
      )
    );

    renderContributionForm();

    await user.type(
      screen.getByPlaceholderText("Enter the song title"),
      "Test Song"
    );

    await user.type(
      screen.getByPlaceholderText("Singer or band name"),
      "Test Artist"
    );

    await user.type(
      screen.getByPlaceholderText(
        "Tell us more about the song..."
      ),
      "Please consider adding this practice song."
    );

    await user.click(
      screen.getByRole("button", {
        name: "Send for review",
      })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent(
      "Too many submissions"
    );

    expect(
      screen.queryByRole("status")
    ).not.toBeInTheDocument();
  });
});
