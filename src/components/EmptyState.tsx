import type { ReactNode } from 'react'

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div className="card stack">
      <h2>{title}</h2>
      <p className="muted">{body}</p>
      {action}
    </div>
  )
}
