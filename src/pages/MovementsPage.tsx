import { useMemo, useState } from 'react'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { FormField } from '../components/FormField.tsx'
import { StatusPill } from '../components/StatusPill.tsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { evaluateMovement, hardConflicts } from '../lib/conflicts.ts'
import { addHours, iso } from '../lib/time.ts'
import { useHarbor } from '../state/HarborContext.tsx'
import type { Movement, MovementType } from '../types/harbor.ts'

export function MovementsPage() {
  const { state, dispatch, now, actor } = useHarbor()
  useDocumentTitle('Movements · Tidegate Ops')
  const [vesselId, setVesselId] = useState(state.vessels[0]?.id ?? '')
  const [berthId, setBerthId] = useState(state.berths[0]?.id ?? '')
  const [type, setType] = useState<MovementType>('arrival')
  const [start, setStart] = useState(iso(addHours(now, 3)).slice(0, 16))
  const [end, setEnd] = useState(iso(addHours(now, 5)).slice(0, 16))
  const [notes, setNotes] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | Movement['status']>('all')

  const preview = useMemo(
    () =>
      evaluateMovement(
        {
          id: 'preview',
          vesselId,
          berthId,
          type,
          status: 'submitted',
          windowStart: new Date(start).toISOString(),
          windowEnd: new Date(end).toISOString(),
        },
        state,
      ),
    [berthId, end, start, state, type, vesselId],
  )
  const blocking = hardConflicts(preview)

  const rows = state.movements.filter(
    (item) => statusFilter === 'all' || item.status === statusFilter,
  )

  const columns: Column<Movement>[] = [
    {
      id: 'vessel',
      header: 'Vessel',
      sortValue: (row) => state.vessels.find((item) => item.id === row.vesselId)?.name ?? row.vesselId,
      render: (row) => state.vessels.find((item) => item.id === row.vesselId)?.name ?? row.vesselId,
    },
    {
      id: 'type',
      header: 'Type',
      sortValue: (row) => row.type,
      render: (row) => row.type,
    },
    {
      id: 'berth',
      header: 'Berth',
      sortValue: (row) => row.berthId,
      render: (row) => state.berths.find((item) => item.id === row.berthId)?.name ?? row.berthId,
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: (row) => row.status,
      render: (row) => <StatusPill value={row.status} />,
    },
    {
      id: 'window',
      header: 'Window start',
      sortValue: (row) => row.windowStart,
      render: (row) => new Date(row.windowStart).toISOString().slice(11, 16),
    },
  ]

  function submit() {
    dispatch({
      type: 'submit-movement',
      input: {
        vesselId,
        berthId,
        type,
        windowStart: new Date(start).toISOString(),
        windowEnd: new Date(end).toISOString(),
        notes,
        actor,
      },
    })
  }

  const selected = state.movements.find((item) => state.selectedMovementIds.includes(item.id))

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Movement desk</h1>
          <p>File, clear, and close arrivals, shifts, and sailings.</p>
        </div>
      </div>
      <div className="split">
        <form
          className="card stack"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <h2>Request movement</h2>
          <FormField id="mv-vessel" label="Vessel">
            <select id="mv-vessel" value={vesselId} onChange={(event) => setVesselId(event.target.value)}>
              {state.vessels.map((vessel) => (
                <option key={vessel.id} value={vessel.id}>
                  {vessel.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="mv-berth" label="Berth">
            <select id="mv-berth" value={berthId} onChange={(event) => setBerthId(event.target.value)}>
              {state.berths.map((berth) => (
                <option key={berth.id} value={berth.id}>
                  {berth.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="mv-type" label="Type">
            <select
              id="mv-type"
              value={type}
              onChange={(event) => setType(event.target.value as MovementType)}
            >
              <option value="arrival">Arrival</option>
              <option value="departure">Departure</option>
              <option value="shift">Shift</option>
            </select>
          </FormField>
          <FormField id="mv-start" label="Window start (UTC)">
            <input
              id="mv-start"
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </FormField>
          <FormField id="mv-end" label="Window end (UTC)">
            <input
              id="mv-end"
              type="datetime-local"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </FormField>
          <FormField id="mv-notes" label="Notes">
            <textarea
              id="mv-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </FormField>
          <div role="status">
            {preview.length === 0 ? (
              <p className="muted">No conflicts on the current window.</p>
            ) : (
              <ul>
                {preview.map((item) => (
                  <li key={item.code + item.message}>
                    {item.kind}: {item.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className="btn">
            {blocking.length > 0 ? 'File anyway (will deny)' : 'Submit request'}
          </button>
        </form>
        <section className="card stack">
          <h2>Selected movement</h2>
          {selected ? (
            <>
              <p>{selected.notes || 'No notes.'}</p>
              {selected.conflictSummary ? <p className="error">{selected.conflictSummary}</p> : null}
              <div className="row-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    dispatch({ type: 'set-movement-status', id: selected.id, status: 'cleared', actor })
                  }
                  disabled={selected.status !== 'submitted'}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => dispatch({ type: 'complete-movement', id: selected.id, actor })}
                  disabled={selected.status !== 'cleared'}
                >
                  Complete
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() =>
                    dispatch({ type: 'set-movement-status', id: selected.id, status: 'denied', actor })
                  }
                  disabled={selected.status === 'completed'}
                >
                  Deny
                </button>
              </div>
            </>
          ) : (
            <p className="muted">Select a movement row to act on it.</p>
          )}
        </section>
      </div>
      <div className="field">
        <label htmlFor="mv-filter">Status filter</label>
        <select
          id="mv-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
        >
          <option value="all">all</option>
          <option value="draft">draft</option>
          <option value="submitted">submitted</option>
          <option value="cleared">cleared</option>
          <option value="denied">denied</option>
          <option value="completed">completed</option>
        </select>
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        caption="Harbor movements"
        selectedIds={state.selectedMovementIds}
        onToggle={(id) => dispatch({ type: 'toggle-movement', id })}
        onToggleAll={() => undefined}
      />
    </div>
  )
}
