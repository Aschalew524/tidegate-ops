import { Link } from 'react-router-dom'
import { ActivityFeed } from '../components/ActivityFeed.tsx'
import { KpiCard } from '../components/KpiCard.tsx'
import { StatusPill } from '../components/StatusPill.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { isInsideSafeWorkingWindow } from '../lib/tides.ts'
import { buildSnapshot } from '../lib/reports.ts'
import { formatStamp } from '../lib/time.ts'
import { overdueInspections } from '../lib/inspections.ts'
import { useHarbor } from '../state/HarborContext.tsx'

export function DashboardPage() {
  const { state, now } = useHarbor()
  useDocumentTitle('Watch · Tidegate Ops')
  const snapshot = buildSnapshot(now, state)
  const overdue = overdueInspections(state.inspections, now)
  const openCritical = state.incidents.filter(
    (item) => item.severity === 'critical' && item.status !== 'closed',
  )
  const working = isInsideSafeWorkingWindow(now)

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Watch board</h1>
          <p>Ashford Reach live picture for the duty dispatcher.</p>
        </div>
        <StatusPill value={working ? 'flood' : 'ebb'} />
      </div>
      <div className="grid kpis">
        <KpiCard label="Alongside" value={snapshot.alongside} hint="On a berth now" />
        <KpiCard label="Inbound" value={snapshot.inbound} hint="Expected or inbound" />
        <KpiCard label="Occupancy" value={`${snapshot.occupancyPct}%`} hint="Open berths filled" />
        <KpiCard label="Detained" value={snapshot.detained} hint="Failed inspection holds" />
        <KpiCard label="Overdue inspect" value={snapshot.overdueInspections} hint="Queued past time" />
        <KpiCard label="Open incidents" value={snapshot.openIncidents} hint="Not closed" />
      </div>
      <div className="split">
        <section className="card stack">
          <h2>Needs the watch</h2>
          {overdue.length === 0 && openCritical.length === 0 ? (
            <p className="muted">No overdue inspections or critical incidents.</p>
          ) : (
            <ul>
              {overdue.map((item) => (
                <li key={item.id}>
                  Overdue {item.type} on {item.vesselId} · {formatStamp(item.scheduledAt)}
                </li>
              ))}
              {openCritical.map((item) => (
                <li key={item.id}>
                  Critical: {item.title}
                </li>
              ))}
            </ul>
          )}
          <div className="row-actions">
            <Link to="/inspections">Inspection queue</Link>
            <Link to="/incidents">Incident log</Link>
            <Link to="/movements">Movement desk</Link>
          </div>
        </section>
        <section className="card stack">
          <h2>Recent activity</h2>
          <ActivityFeed events={state.activities.slice(0, 6)} now={now} />
        </section>
      </div>
    </div>
  )
}
