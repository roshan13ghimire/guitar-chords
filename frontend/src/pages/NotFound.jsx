
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="site-container py-24 text-center">
      <p className="font-mono text-sm text-muted">
        404
      </p>

      <h1 className="mt-4 text-2xl font-semibold">
        Page not found
      </h1>

      <p className="mt-3 text-sm text-muted">
        The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="
          mt-6 inline-block rounded-md
          border border-line px-4 py-2.5
          text-sm hover:bg-surface-hover
        "
      >
        Back to songs
      </Link>
    </section>
  )
}
