import { StatusPill } from '../components/StatusPill.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
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
          const occupant = state.vessels.find((vessel) => vessel.id === berth.currentVesselId)
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
                    Occupied by <strong>{occupant.name}</strong>
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
