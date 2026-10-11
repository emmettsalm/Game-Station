import { Link } from 'react-router'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
}

export default function EmptyState({ icon = '📭', title, description, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-6xl" aria-hidden>{icon}</span>
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="opacity-70 max-w-md">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary mt-2">{actionLabel}</Link>
      )}
    </div>
  )
}
