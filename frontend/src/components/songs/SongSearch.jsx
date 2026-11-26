
import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

export default function SongSearch({ value, onChange }) {
  const inputRef = useRef(null)

  useEffect(() => {
    function handleKeyDown(event) {
      const target = event.target

      const isTyping =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          target?.tagName
        ) || target?.isContentEditable

      if (
        event.key === '/' &&
        !isTyping &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault()
        inputRef.current?.focus()
      }

      if (
        event.key === 'Escape' &&
        document.activeElement === inputRef.current
      ) {
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () =>
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
  }, [])

  return (
    <div
      className="
        flex items-center gap-3
        rounded-lg border border-line
        bg-surface px-4
        focus-within:border-accent
      "
    >
      <Search
        size={19}
        strokeWidth={1.7}
        className="shrink-0 text-muted"
      />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Search songs or artists..."
        aria-label="Search songs or artists"
        className="
          min-w-0 flex-1 bg-transparent
          py-3.5 text-sm text-foreground
          outline-none placeholder:text-muted
          focus-visible:outline-none
          [&::-webkit-search-cancel-button]:hidden
        "
      />

      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          aria-label="Clear search"
          className="p-1 text-muted hover:text-foreground"
        >
          <X size={17} />
        </button>
      ) : (
        <kbd
          className="
            hidden rounded border border-line
            px-2 py-0.5 font-mono
            text-xs text-muted sm:block
          "
        >
          /
        </kbd>
      )}
    </div>
  )
}
