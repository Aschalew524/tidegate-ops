import { KpiCard } from '../components/KpiCard.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { buildOperationsReport } from '../lib/reports.ts'
import { formatDay } from '../lib/time.ts'
import { useHarbor } from '../state/HarborContext.tsx'

export function ReportsPage() {
  const { state, now } = useHarbor()
  useDocumentTitle('Reports · Tidegate Ops')
  const rows = buildOperationsReport(now, state)

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Watch report</h1>
          <p>Snapshot for {formatDay(now)}. Print from the browser if the harbor master wants a copy.</p>
        </div>
      </div>
      <div className="grid kpis">
        {rows.map((row) => (
          <KpiCard key={row.label} label={row.label} value={row.value} hint={row.hint} />
        ))}
      </div>
    </div>
  )
}
