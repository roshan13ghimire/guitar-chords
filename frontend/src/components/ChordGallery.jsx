
import { Guitar } from "lucide-react";
import ChordDiagram from "./ChordDiagram";

export default function ChordGallery({ chords = [] }) {
  if (chords.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Guitar chord diagrams"
      className="mb-9"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Guitar size={20} className="text-copper" />

          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Chords used in this song
          </h2>
        </div>

        <span className="text-xs text-muted">
          {chords.length} chords
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {chords.map((chord) => (
          <ChordDiagram key={chord} chord={chord} />
        ))}
      </div>

      <p className="mt-3 text-xs leading-6 text-muted">
        × = Do not play · ○ = Open string ·
        Numbers = Fingers · Barre = Hold multiple strings.
        Fret positions are relative to the capo.
      </p>
    </section>
  );
}
