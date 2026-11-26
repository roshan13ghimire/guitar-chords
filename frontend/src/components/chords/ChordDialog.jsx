
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

import ChordDiagram from './ChordDiagram'

export default function ChordDialog({
  name,
  chord,
  loading,
  error,
  onClose,
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current

    if (dialog && !dialog.open) {
      dialog.showModal()
    }

    return () => {
      if (dialog?.open) {
        dialog.close()
      }
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="chord-dialog-title"
      onCancel={event => {
        event.preventDefault()
        onClose()
      }}
      className="
        m-auto w-[calc(100%-2rem)]
        max-w-85 rounded-xl
        border border-line bg-surface
        p-6 text-foreground
        backdrop:bg-black/40
      "
    >
      <div className="flex items-center justify-between">
        <h2
          id="chord-dialog-title"
          className="font-mono text-2xl font-semibold"
        >
          {name}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close chord diagram"
          className="
            grid size-9 place-items-center
            rounded-md text-muted
            hover:bg-surface-hover
          "
        >
          <X size={19} />
        </button>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-muted">
          Loading chord...
        </p>
      ) : error ? (
        <p
          role="alert"
          className="py-10 text-center text-sm text-danger"
        >
          Unable to load chord definitions.
        </p>
      ) : chord ? (
        <>
          <p className="mt-2 text-xs text-muted">
            {chord.category_display}
            {' · '}
            Standard tuning
          </p>

          <div className="my-5">
            <ChordDiagram
              chord={chord}
              showName={false}
            />
          </div>

          <div
            className="
              space-y-2 border-t border-line
              pt-4 text-xs text-muted
            "
          >
            <p>× Muted string · ○ Open string</p>

            <p>
              1 Index · 2 Middle · 3 Ring · 4 Pinky
            </p>

            {chord.description && (
              <p className="leading-relaxed">
                {chord.description}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="py-10 text-center">
          <p className="text-sm font-medium">
            Fingering not available
          </p>

          <p className="mt-2 text-xs leading-relaxed text-muted">
            This chord has not been added
            to the chord library yet.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="
          mt-5 w-full rounded-md
          border border-line py-2.5
          text-sm font-medium
          hover:bg-surface-hover
        "
      >
        Close
      </button>
    </dialog>
  )
}
