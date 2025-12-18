import { DataTable, type Column } from '../components/DataTable.tsx'
import { StatusPill } from '../components/StatusPill.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { canTransitionInspection } from '../lib/inspections.ts'
import { formatStamp } from '../lib/time.ts'
import { useHarbor } from '../state/HarborContext.tsx'
import type { Inspection, InspectionStatus } from '../types/harbor.ts'
import { useState } from 'react'

export function InspectionsPage() {
  const { state, dispatch, actor } = useHarbor()
  const [selectedId, setSelectedId] = useState<string | null>(state.inspections[0]?.id ?? null)
  const [findings, setFindings] = useState('')
  useDocumentTitle('Inspections · Tidegate Ops')
  const selected = state.inspections.find((item) => item.id === selectedId) ?? null

  const columns: Column<Inspection>[] = [
    {
      id: 'vessel',
      header: 'Vessel',
      sortValue: (row) => state.vessels.find((item) => item.id === row.vesselId)?.name ?? '',
      render: (row) => state.vessels.find((item) => item.id === row.vesselId)?.name ?? row.vesselId,
    },
    {
      id: 'type',
      header: 'Type',
      sortValue: (row) => row.type,
      render: (row) => row.type,
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: (row) => row.status,
      render: (row) => <StatusPill value={row.status} />,
    },
    {
      id: 'when',
      header: 'Scheduled',
      sortValue: (row) => row.scheduledAt,
      render: (row) => formatStamp(row.scheduledAt),
    },
  ]

  function move(status: InspectionStatus) {
    if (!selected) return
    dispatch({
      type: 'transition-inspection',
      id: selected.id,
      status,
      findings,
      actor,
    })
  }

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Inspection queue</h1>
          <p>Safety, customs, hull, and environment checks.</p>
        </div>
      </div>
      <div className="split">
        <DataTable
          rows={state.inspections}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Inspection queue"
          selectedIds={selectedId ? [selectedId] : []}
          onToggle={(id) => setSelectedId(id)}
          onToggleAll={() => undefined}
          onActivate={setSelectedId}
        />
        <section className="card stack">
          <h2>{selected ? selected.type : 'Select an inspection'}</h2>
          {selected ? (
            <>
              <p className="muted">{selected.findings || 'No findings recorded yet.'}</p>
              <label htmlFor="findings">Findings</label>
              <textarea
                id="findings"
                value={findings}
                onChange={(event) => setFindings(event.target.value)}
              />
              <div className="row-actions">
                <button
                  type="button"
                  className="btn"
                  disabled={!canTransitionInspection(selected.status, 'in_progress')}
                  onClick={() => move('in_progress')}
                >
                  Start
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={!canTransitionInspection(selected.status, 'passed')}
                  onClick={() => move('passed')}
                >
                  Pass
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  disabled={!canTransitionInspection(selected.status, 'failed')}
                  onClick={() => move('failed')}
                >
                  Fail
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  )
}
