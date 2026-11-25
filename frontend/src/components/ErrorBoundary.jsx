
import { Component } from "react";
import { Link } from "react-router";

import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    // Full diagnostic details are shown only
    // while developing locally.
    if (import.meta.env.DEV) {
      console.error(
        "Guitar Chords rendering error:",
        error,
        info.componentStack
      );
    }

    // Production monitoring can be added later.
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-16">
        <div
          role="alert"
          className="w-full max-w-lg rounded-3xl border border-line bg-white p-8 text-center sm:p-12"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-copper-light text-copper">
            <AlertTriangle size={30} />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.15em] text-copper">
            Something went wrong
          </p>

          <h1 className="mt-4 font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            We couldn't display this page.
          </h1>

          <p className="mt-5 text-sm leading-7 text-muted">
            An unexpected application error occurred.
            You can reload the page or return to the
            homepage. Your saved data has not been
            intentionally changed.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-copper"
            >
              <RefreshCw size={17} />
              Reload page
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition hover:bg-paper"
            >
              <ArrowLeft size={17} />
              Return home
            </Link>
          </div>

          <p className="mt-7 text-xs leading-6 text-muted">
            If this continues, try refreshing the page
            or visiting another section of the songbook.
          </p>
        </div>
      </main>
    );
  }
}
