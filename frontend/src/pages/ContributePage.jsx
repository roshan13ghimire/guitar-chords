
import {
  cloneElement,
  useEffect,
  useId,
  useState,
} from "react";

import {
  ArrowRight,
  CheckCircle2,
  MessageSquareWarning,
  Music2,
  Send,
} from "lucide-react";

import {
  getSong,
  getSongs,
  submitCommunitySubmission,
} from "../lib/api";

const languages = [
  { value: "ne", label: "Nepali" },
  { value: "hi", label: "Hindi" },
  { value: "en", label: "English" },
];

const initialForm = {
  song_title: "",
  artist_name: "",
  language: "ne",
  details: "",
  reference_url: "",
  contributor_name: "",
  company_website: "",
};

const inputClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3.5 text-sm text-ink outline-none transition focus:border-copper focus:ring-2 focus:ring-copper/15";

function Field({ label, children, help }) {
  const inputId = useId();
  const helpId = `${inputId}-help`;

  const control = cloneElement(children, {
    id: inputId,
    ...(help
      ? { "aria-describedby": helpId }
      : {}),
  });

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold text-ink"
      >
        {label}
      </label>

      {control}

      {help && (
        <p
          id={helpId}
          className="mt-2 text-xs leading-5 text-muted"
        >
          {help}
        </p>
      )}
    </div>
  );
}

export default function ContributePage() {
  const [kind, setKind] = useState("song");
  const [form, setForm] = useState(initialForm);

  const [songs, setSongs] = useState([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [songsError, setSongsError] = useState("");

  const [selectedSongId, setSelectedSongId] = useState("");
  const [arrangements, setArrangements] = useState([]);
  const [arrangementId, setArrangementId] = useState("");
  const [arrangementsLoading, setArrangementsLoading] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const clearArrangementSelection = () => {
    setArrangements([]);
    setArrangementId("");
  };

  const handleSongChange = (value) => {
    setSelectedSongId(value);
    clearArrangementSelection();
    setSongsError("");
  };

  const switchKind = (nextKind) => {
    setKind(nextKind);
    setMessage("");
    setError("");
    setSongsError("");
    setSelectedSongId("");
    clearArrangementSelection();
  };

  useEffect(() => {
    if (kind !== "correction") return;

    const controller = new AbortController();

    async function loadSongs() {
      setSongsLoading(true);
      setSongsError("");

      try {
        const data = await getSongs({
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setSongs(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSongsError(
            "Could not load the published song library."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setSongsLoading(false);
        }
      }
    }

    loadSongs();

    return () => controller.abort();
  }, [kind]);

  useEffect(() => {
    if (kind !== "correction" || !selectedSongId) {
      return;
    }

    const controller = new AbortController();

    async function loadArrangements() {
      setArrangementsLoading(true);

      try {
        const song = await getSong(selectedSongId, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setArrangements(song.arrangements || []);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSongsError(
            "Unable to load this song's arrangements."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setArrangementsLoading(false);
        }
      }
    }

    loadArrangements();

    return () => controller.abort();
  }, [kind, selectedSongId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (kind === "correction" && !arrangementId) {
      setError("Choose a published chord arrangement.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    setError("");

    const shared = {
      kind,
      details: form.details.trim(),
      contributor_name: form.contributor_name.trim(),
      reference_url: form.reference_url.trim(),
      company_website: form.company_website,
    };

    const payload =
      kind === "song"
        ? {
            ...shared,
            song_title: form.song_title.trim(),
            artist_name: form.artist_name.trim(),
            language: form.language,
          }
        : {
            ...shared,
            arrangement_id: Number(arrangementId),
          };

    try {
      const response = await submitCommunitySubmission(
        payload
      );

      setMessage(
        response.message ||
          "Your submission was received for review."
      );

      setForm(initialForm);
      setSelectedSongId("");
      clearArrangementSelection();
    } catch (submissionError) {
      setError(
        submissionError.message ||
          "Unable to submit your suggestion."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[75vh] bg-paper">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <header className="mb-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-copper">
            Community contributions
          </p>

          <h1 className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">
            Help improve the songbook.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
            Suggest a song you'd like to play or help
            correct an existing chord arrangement.
            Every contribution is reviewed before
            changes are made.
          </p>
        </header>

        <div className="rounded-3xl border border-line bg-white p-5 shadow-[0_10px_40px_rgba(36,41,37,0.03)] sm:p-9">
          <div className="mb-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={kind === "song"}
              onClick={() => switchKind("song")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-semibold transition ${
                kind === "song"
                  ? "bg-ink text-white"
                  : "bg-paper text-muted hover:text-ink"
              }`}
            >
              <Music2 size={18} />
              Suggest song
            </button>

            <button
              type="button"
              aria-pressed={kind === "correction"}
              onClick={() => switchKind("correction")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-semibold transition ${
                kind === "correction"
                  ? "bg-ink text-white"
                  : "bg-paper text-muted hover:text-ink"
              }`}
            >
              <MessageSquareWarning size={18} />
              Report error
            </button>
          </div>

          {message && (
            <div
              role="status"
              className="mb-7 flex items-start gap-3 rounded-xl border border-[#CDE2D1] bg-[#F0F8F1] p-4 text-sm leading-6 text-[#326848]"
            >
              <CheckCircle2
                size={20}
                className="shrink-0"
              />
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-7 rounded-xl border border-[#E5C6BD] bg-[#FFF6F3] p-4 text-sm leading-6 text-[#934A35]"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="relative space-y-6"
          >
            {/* Honeypot: deliberately not visible,
                focusable, or available to assistive
                technologies. */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-10000px",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
            >
              <label htmlFor="company-website">
                Company website
              </label>

              <input
                id="company-website"
                name="company_website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.company_website}
                onChange={(event) =>
                  updateField(
                    "company_website",
                    event.target.value
                  )
                }
              />
            </div>

            {kind === "song" ? (
              <>
                <Field label="Song title">
                  <input
                    className={inputClass}
                    required
                    maxLength={255}
                    value={form.song_title}
                    onChange={(event) =>
                      updateField(
                        "song_title",
                        event.target.value
                      )
                    }
                    placeholder="Enter the song title"
                  />
                </Field>

                <Field label="Artist or band">
                  <input
                    className={inputClass}
                    required
                    maxLength={200}
                    value={form.artist_name}
                    onChange={(event) =>
                      updateField(
                        "artist_name",
                        event.target.value
                      )
                    }
                    placeholder="Singer or band name"
                  />
                </Field>

                <Field label="Song language">
                  <select
                    className={inputClass}
                    value={form.language}
                    onChange={(event) =>
                      updateField(
                        "language",
                        event.target.value
                      )
                    }
                  >
                    {languages.map((language) => (
                      <option
                        key={language.value}
                        value={language.value}
                      >
                        {language.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            ) : (
              <>
                <Field label="Select a song">
                  <select
                    className={inputClass}
                    required
                    disabled={
                      songsLoading || songs.length === 0
                    }
                    value={selectedSongId}
                    onChange={(event) =>
                      handleSongChange(event.target.value)
                    }
                  >
                    <option value="">
                      {songsLoading
                        ? "Loading songs..."
                        : "Choose a song"}
                    </option>

                    {songs.map((song) => (
                      <option
                        key={song.id}
                        value={song.id}
                      >
                        {song.title} — {song.artist?.name}
                      </option>
                    ))}
                  </select>
                </Field>

                {songsError && (
                  <p
                    role="alert"
                    className="text-sm text-[#934A35]"
                  >
                    {songsError}
                  </p>
                )}

                <Field label="Chord arrangement">
                  <select
                    className={inputClass}
                    required
                    value={arrangementId}
                    disabled={
                      !selectedSongId ||
                      arrangementsLoading ||
                      arrangements.length === 0
                    }
                    onChange={(event) =>
                      setArrangementId(event.target.value)
                    }
                  >
                    <option value="">
                      {arrangementsLoading
                        ? "Loading arrangements..."
                        : "Choose an arrangement"}
                    </option>

                    {arrangements.map((arrangement) => (
                      <option
                        key={arrangement.id}
                        value={arrangement.id}
                      >
                        {arrangement.title} — Key{" "}
                        {arrangement.original_key}
                      </option>
                    ))}
                  </select>
                </Field>

                {songs.length === 0 &&
                  !songsLoading &&
                  !songsError && (
                    <p className="text-sm leading-6 text-muted">
                      No published songs are available
                      to report yet. You can suggest
                      a new song instead.
                    </p>
                  )}
              </>
            )}

            <Field
              label={
                kind === "song"
                  ? "Why should we add this song?"
                  : "What is incorrect in the chords?"
              }
              help={
                kind === "song"
                  ? "Tell us which song you mean and any useful details."
                  : "Mention the section and suggested correction. Don't paste entire copyrighted lyrics."
              }
            >
              <textarea
                className={`${inputClass} min-h-36 resize-y`}
                required
                minLength={12}
                maxLength={2000}
                value={form.details}
                onChange={(event) =>
                  updateField(
                    "details",
                    event.target.value
                  )
                }
                placeholder={
                  kind === "song"
                    ? "Tell us more about the song..."
                    : "For example, the second chord in the verse should be Em instead of G..."
                }
              />
            </Field>

            <Field
              label="Reference URL (optional)"
              help="An official recording or another relevant source. Please don't upload copyrighted song sheets."
            >
              <input
                className={inputClass}
                type="url"
                maxLength={500}
                value={form.reference_url}
                onChange={(event) =>
                  updateField(
                    "reference_url",
                    event.target.value
                  )
                }
                placeholder="https://..."
              />
            </Field>

            <Field label="Your name (optional)">
              <input
                className={inputClass}
                maxLength={100}
                value={form.contributor_name}
                onChange={(event) =>
                  updateField(
                    "contributor_name",
                    event.target.value
                  )
                }
                placeholder="How should we credit you?"
              />
            </Field>

            <div className="border-t border-line pt-6">
              <p className="mb-5 text-xs leading-6 text-muted">
                Submissions are reviewed manually.
                Please avoid including private information
                or full copyrighted lyrics. Sending a
                suggestion does not guarantee publication.
              </p>

              <button
                type="submit"
                disabled={
                  submitting ||
                  (kind === "correction" && !arrangementId)
                }
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-copper disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send size={17} />
                    Send for review
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
