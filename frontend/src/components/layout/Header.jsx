
import { Link, NavLink } from 'react-router-dom'
import { Guitar, Moon, Sun } from 'lucide-react'

import useTheme from '../../hooks/useTheme'

const navigation = [
  {
    label: 'Songs',
    to: '/',
  },
  {
    label: 'Learn chords',
    to: '/chords',
  },
]

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-line">
      <div
        className="
          site-container
          flex min-h-16 flex-wrap
          items-center justify-between
          gap-x-5
        "
      >
        <Link
          to="/"
          className="flex items-center gap-2.5 py-4"
          aria-label="Guitar Chords home"
        >
          <Guitar
            size={23}
            strokeWidth={1.7}
            className="text-accent"
          />

          <span className="text-[16px] font-semibold tracking-tight">
            guitar chords
            <span className="text-accent">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-7">
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-4 sm:gap-6"
          >
            {navigation.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `
                  whitespace-nowrap py-3
                  text-[13px] font-medium
                  transition-colors duration-150
                  ${
                    isActive
                      ? 'text-accent'
                      : 'text-muted hover:text-foreground'
                  }
                `}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="h-5 w-px bg-line" />

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === 'light'
                ? 'Switch to dark mode'
                : 'Switch to light mode'
            }
            className="
              grid size-9 place-items-center
              rounded-md text-muted
              transition-colors
              hover:bg-surface-hover
              hover:text-foreground
            "
          >
            {theme === 'light' ? (
              <Moon size={17} strokeWidth={1.7} />
            ) : (
              <Sun size={18} strokeWidth={1.7} />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
