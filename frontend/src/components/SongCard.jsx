
import { Link } from "react-router";
import { Music2, CheckCircle2, ArrowUpRight } from "lucide-react";

const languageNames = {
  ne: "Nepali",
  hi: "Hindi",
  en: "English",
};

export default function SongCard({ song }) {
  return (
    <Link
      to={`/songs/${song.id}/`}
      className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-copper"
    >
      <article className="flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-[#d8c9bc] group-hover:shadow-[0_16px_36px_rgba(36,41,37,0.06)] motion-reduce:transform-none">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-copper-light text-copper">
            <Music2 size={23} strokeWidth={1.7} />
          </div>

          <span className="rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-muted">
            {languageNames[song.language] || song.language}
          </span>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-ink">
            {song.title}
          </h3>

          <p className="mt-2 text-sm text-muted">
            {song.artist?.name || "Unknown artist"}
          </p>
        </div>

        <div className="mt-7 flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#47765b]">
            <CheckCircle2 size={14} />
            Verified
          </span>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-copper">
            View chords
            <ArrowUpRight size={15} />
          </span>
        </div>
      </article>
    </Link>
  );
}
