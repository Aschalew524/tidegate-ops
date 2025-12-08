import type { ActivityEvent } from '../types/harbor.ts'
import { formatRelative } from '../lib/time.ts'

export function ActivityFeed({
  events,
  now,
}: {
  events: ActivityEvent[]
  now: Date
}) {
  if (events.length === 0) {
    return <p className="muted">No watch notes yet.</p>
  }

  return (
    <ol className="activity">
      {events.map((event) => (
        <li key={event.id}>
          <strong>{event.actor}</strong>
          <div>{event.message}</div>
          <div className="muted">{formatRelative(event.at, now)}</div>
        </li>
      ))}
    </ol>
  )
}
