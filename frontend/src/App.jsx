
import { useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router";

import ErrorBoundary from "./components/ErrorBoundary";
import SiteHeader from "./components/SiteHeader";

import HomePage from "./pages/HomePage";
import SongPage from "./pages/SongPage";
import BrowseSongsPage from "./pages/BrowseSongsPage";
import ChordLibraryPage from "./pages/ChordLibraryPage";
import ContributePage from "./pages/ContributePage";
import ArtistsPage from "./pages/ArtistsPage";
import ArtistDetailPage from "./pages/ArtistDetailPage";
import LessonsPage, {
  LessonDetailPage,
} from "./pages/LessonsPage";
import PracticePage from "./pages/PracticePage";

import "./styles/accessibility.css";

function ScrollToLocation() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const id = decodeURIComponent(
        hash.slice(1)
      );

      document.getElementById(id)?.scrollIntoView();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

function SkipLink() {
  const handleSkip = (event) => {
    event.preventDefault();

    const mainContent =
      document.getElementById("main-content");

    mainContent?.focus();
  };

  return (
    <a
      href="#main-content"
      className="skip-link"
      onClick={handleSkip}
    >
      Skip to main content
    </a>
  );
}

function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <p className="text-sm font-semibold text-copper">
        ERROR 404
      </p>

      <h1 className="mt-4 font-serif text-4xl text-ink">
        Page not found
      </h1>

      <p className="mt-4 text-muted">
        The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-copper"
      >
        Return home
      </Link>
    </main>
  );
}

function AppContent() {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary key={pathname}>
      <div className="min-h-screen bg-paper text-ink">
        <SkipLink />

        <SiteHeader />

        <div
          id="main-content"
          tabIndex={-1}
          className="focus:outline-none"
        >
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />

            <Route
              path="/songs"
              element={<BrowseSongsPage />}
            />

            <Route
              path="/songs/:id/"
              element={<SongPage />}
            />

            <Route
              path="/artists"
              element={<ArtistsPage />}
            />

            <Route
              path="/artists/:id/"
              element={<ArtistDetailPage />}
            />

            <Route
              path="/chords"
              element={<ChordLibraryPage />}
            />

            <Route
              path="/learn"
              element={<LessonsPage />}
            />

            <Route
              path="/learn/:slug/"
              element={<LessonDetailPage />}
            />

            <Route
              path="/practice"
              element={<PracticePage />}
            />

            <Route
              path="/contribute"
              element={<ContributePage />}
            />

            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Routes>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToLocation />
      <AppContent />
    </BrowserRouter>
  );
}
