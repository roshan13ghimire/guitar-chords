
import { Music2 } from 'lucide-react'

export default function EmptyState({
  title = 'No songs found',
  description = 'Try a different search.',
  action,
}) {
  return (
    <div className="px-4 py-16 text-center">
      <Music2
        size={26}
        strokeWidth={1.5}
        className="mx-auto mb-4 text-muted"
      />

      <h2 className="text-sm font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm text-muted">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  )
}
