
import { useState } from "react";

import { Link } from "react-router";

import {
  ArrowUpRight,
  Guitar,
  Menu,
  X,
} from "lucide-react";


const LINKS = [
  { to: "/songs", label: "Browse songs" },
  { to: "/artists", label: "Artists" },
  { to: "/chords", label: "Chords" },
  { to: "/learn", label: "Lessons" },
  { to: "/practice", label: "Practice" },
  { to: "/#about", label: "About" },
  { to: "/contribute", label: "Contribute" },
];


export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex shrink-0 items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
            <Guitar size={21} strokeWidth={1.8} />
          </span>

          <span className="text-lg font-bold tracking-[-0.04em] text-ink">
            guitar
            <span className="text-copper">
              chords.
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-5 text-sm font-medium text-muted xl:flex"
          aria-label="Main navigation"
        >
          {LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/songs"
          className="hidden shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-copper 2xl:inline-flex"
        >
          Explore songs
          <ArrowUpRight size={16} />
        </Link>

        <button
          type="button"
          aria-label={
            menuOpen ? "Close menu" : "Open menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-site-nav"
          onClick={() =>
            setMenuOpen((current) => !current)
          }
          className="rounded-lg p-2 text-ink xl:hidden"
        >
          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-site-nav"
          className="flex flex-col gap-1 border-t border-line bg-paper px-5 py-4 xl:hidden"
          aria-label="Mobile navigation"
        >
          {LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 font-medium text-ink hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
