
const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div
        className="
          site-container
          flex flex-wrap items-center
          justify-between gap-2
          py-5 text-xs text-muted
        "
      >
        <span>
          Guitar Chords &copy; {CURRENT_YEAR}
        </span>

        <span>A personal songbook.</span>
      </div>
    </footer>
  )
}
