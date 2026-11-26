
import { Outlet, useMatch } from 'react-router-dom'

import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const isSongReader = useMatch('/songs/:slug')

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a
        href="#main-content"
        className="
          sr-only focus:not-sr-only
          focus:absolute focus:z-50
          focus:bg-surface focus:p-3
        "
      >
        Skip to content
      </a>

      <Header />

      <main
        id="main-content"
        className="flex-1"
      >
        <Outlet />
      </main>

      {!isSongReader && <Footer />}
    </div>
  )
}
