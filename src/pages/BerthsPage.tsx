import { StatusPill } from '../components/StatusPill.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { occupantName } from '../lib/berths.ts'
import { useHarbor } from '../state/HarborContext.tsx'

export function BerthsPage() {
  const { state } = useHarbor()
  useDocumentTitle('Berths · Tidegate Ops')

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Berth board</h1>
          <p>Occupancy and constraints across Ashford Reach.</p>
        </div>
      </div>
      <div className="berth-board">
        {state.berths.map((berth) => {
          const occupant = occupantName(berth, state.vessels)
          return (
            <article key={berth.id} className="card berth-card">
              <h2>{berth.name}</h2>
              <StatusPill value={berth.status} />
              <p className="muted">{berth.quay}</p>
              <p>
                Max {berth.maxLoaMeters}m LOA / {berth.maxDraftMeters}m draft
              </p>
              <p>
                {occupant ? (
                  <>
                    Occupied by <strong>{occupant}</strong>
                  </>
                ) : (
                  'Empty'
                )}
              </p>
              <p className="muted">{berth.remarks}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
