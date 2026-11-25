
(function () {
  "use strict";

  const FIELD_SELECTOR = [
    'textarea[name="chord_content"]',
    'textarea[name$="-chord_content"]',
  ].join(", ");

  const MAX_PREVIEW_LINES = 80;

  function parseLine(line) {
    const segments = [];
    const pattern = /\[([^\]\r\n]+)\]/g;

    let cursor = 0;
    let activeChord = null;

    for (const match of line.matchAll(pattern)) {
      const text = line.slice(cursor, match.index);

      if (text || activeChord !== null) {
        segments.push({
          chord: activeChord,
          text,
        });
      }

      activeChord = match[1].trim();
      cursor = match.index + match[0].length;
    }

    const remaining = line.slice(cursor);

    if (remaining || activeChord !== null) {
      segments.push({
        chord: activeChord,
        text: remaining,
      });
    }

    if (!segments.length && line) {
      segments.push({
        chord: null,
        text: line,
      });
    }

    return segments;
  }

  function createSegment(segment) {
    const wrapper = document.createElement("span");
    wrapper.className = "gc-preview-segment";

    const chord = document.createElement("span");
    chord.className = "gc-preview-chord";
    chord.textContent = segment.chord || "\u00A0";

    const lyrics = document.createElement("span");
    lyrics.className = "gc-preview-lyrics";
    lyrics.textContent = segment.text || "\u00A0";

    wrapper.append(chord, lyrics);

    return wrapper;
  }

  function renderPreview(textarea, container) {
    container.replaceChildren();

    const content = textarea.value || "";

    if (!content.trim()) {
      const message = document.createElement("p");
      message.className = "gc-preview-empty";
      message.textContent =
        "Start entering chords to see the preview.";

      container.appendChild(message);
      return;
    }

    const lines = content
      .replace(/\r\n/g, "\n")
      .split("\n");

    lines
      .slice(0, MAX_PREVIEW_LINES)
      .forEach((line) => {
        const lineElement = document.createElement("div");
        lineElement.className = "gc-preview-line";

        if (!line.trim()) {
          lineElement.classList.add("gc-preview-blank");
          container.appendChild(lineElement);
          return;
        }

        const segments = parseLine(line);

        segments.forEach((segment) => {
          lineElement.appendChild(
            createSegment(segment)
          );
        });

        container.appendChild(lineElement);
      });

    if (lines.length > MAX_PREVIEW_LINES) {
      const message = document.createElement("p");
      message.className = "gc-preview-empty";

      message.textContent =
        `Preview limited to ${MAX_PREVIEW_LINES} lines.`;

      container.appendChild(message);
    }
  }

  function attachPreview(textarea) {
    if (textarea.dataset.gcPreviewBound === "true") {
      return;
    }

    textarea.dataset.gcPreviewBound = "true";

    const section = document.createElement("section");
    section.className = "gc-preview-section";

    const heading = document.createElement("h3");
    heading.textContent = "Live Chord Preview";

    const description = document.createElement("p");
    description.className = "gc-preview-description";
    description.textContent =
      "Preview how the chord sheet will appear.";

    const content = document.createElement("div");
    content.className = "gc-preview-content";

    section.append(
      heading,
      description,
      content
    );

    textarea.insertAdjacentElement(
      "afterend",
      section
    );

    textarea.addEventListener("input", () => {
      renderPreview(textarea, content);
    });

    renderPreview(textarea, content);
  }

  function initializePreviews() {
    document
      .querySelectorAll(FIELD_SELECTOR)
      .forEach(attachPreview);
  }

  function initialize() {
    initializePreviews();

    // Supports dynamically added Django admin inlines.
    const observer = new MutationObserver(() => {
      initializePreviews();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
})();
