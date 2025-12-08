import { tideHeightAt, tidePhaseAt, tideProgress } from '../lib/tides.ts'
import { formatClock } from '../lib/time.ts'
import { StatusPill } from './StatusPill.tsx'

export function TideStrip({ now }: { now: Date }) {
  const height = tideHeightAt(now)
  const phase = tidePhaseAt(now)
  const progress = Math.round(tideProgress(now) * 100)

  return (
    <section className="card tide-strip" aria-label="Ashford Reach tide">
      <div>
        <strong>{formatClock(now)} UTC</strong>
        <div className="muted">Port tide gauge</div>
      </div>
      <div>
        <div className="tide-meter" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="visually-hidden">
          Tide height {height.toFixed(2)} meters, {phase}, {progress} percent of range
        </span>
      </div>
      <div>
        <StatusPill value={phase} />
        <div className="muted">{height.toFixed(2)} m CD</div>
      </div>
    </section>
  )
}
