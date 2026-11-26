
import { LoaderCircle } from 'lucide-react'

export default function Loading({
  message = 'Loading...',
}) {
  return (
    <div
      role="status"
      className="
        flex items-center justify-center
        gap-2.5 py-16 text-sm text-muted
      "
    >
      <LoaderCircle
        size={18}
        className="motion-safe:animate-spin"
      />

      <span>{message}</span>
    </div>
  )
}
