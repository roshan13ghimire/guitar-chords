
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/$/, "");


async function readList(response, errorMessage) {
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  throw new Error("Unexpected API response.");
}


export async function getSongs({
  language = "all",
  search = "",
  artist = "",
  difficulty = "",
  sort = "title",
  signal,
} = {}) {
  const params = new URLSearchParams();

  if (language && language !== "all") {
    params.set("language", language);
  }

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (artist && artist !== "all") {
    params.set("artist", String(artist));
  }

  if (difficulty && difficulty !== "all") {
    params.set("difficulty", difficulty);
  }

  if (sort && sort !== "title") {
    params.set("sort", sort);
  }

  const query = params.toString();

  const response = await fetch(
    `${API_BASE_URL}/songs/${query ? `?${query}` : ""}`,
    { signal }
  );

  return readList(
    response,
    "Unable to load the song library."
  );
}


export async function getArtists({ signal } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/artists/`,
    { signal }
  );

  return readList(
    response,
    "Unable to load artists."
  );
}


export async function getArtist(id, { signal } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/artists/${encodeURIComponent(id)}/`,
    { signal }
  );

  if (response.status === 404) {
    throw new Error("Artist not found.");
  }

  if (!response.ok) {
    throw new Error(
      "Unable to load the artist profile."
    );
  }

  return response.json();
}


export async function getSong(id, { signal } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/songs/${encodeURIComponent(id)}/`,
    { signal }
  );

  if (response.status === 404) {
    throw new Error("Song not found");
  }

  if (!response.ok) {
    throw new Error(
      "Unable to load song details."
    );
  }

  return response.json();
}


export async function submitCommunitySubmission(payload) {
  const response = await fetch(
    `${API_BASE_URL}/submissions/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    // A server error may not return JSON.
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        "Too many submissions. Please try again later."
      );
    }

    if (response.status === 400) {
      const message = Object.entries(data)
        .map(([field, value]) => {
          const explanation = Array.isArray(value)
            ? value.join(", ")
            : String(value);

          return `${field}: ${explanation}`;
        })
        .join(" ");

      throw new Error(
        message ||
          "Please check your form and try again."
      );
    }

    throw new Error(
      "Unable to submit your suggestion right now."
    );
  }

  return data;
}
