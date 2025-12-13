import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DataTable, type Column } from '../components/DataTable.tsx'
import { EmptyState } from '../components/EmptyState.tsx'
import { StatusPill } from '../components/StatusPill.tsx'
import { useDebouncedValue } from '../hooks/useDebouncedValue.ts'
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts'
import { filterVessels } from '../lib/vessels.ts'
import { useHarbor } from '../state/HarborContext.tsx'
import type { Vessel, VesselStatus, VesselType } from '../types/harbor.ts'

const TYPE_OPTIONS: Array<VesselType | 'all'> = [
  'all',
  'cargo',
  'ferry',
  'fishing',
  'tanker',
  'tug',
  'research',
]

const STATUS_OPTIONS: Array<VesselStatus | 'all'> = [
  'all',
  'expected',
  'inbound',
  'alongside',
  'departed',
  'detained',
]

export function VesselsPage() {
  const { state, dispatch } = useHarbor()
  const [params] = useSearchParams()
  const [activeId, setActiveId] = useState<string | null>(params.get('focus'))
  useDocumentTitle('Vessels · Tidegate Ops')

  const debouncedQuery = useDebouncedValue(state.vesselFilters.query, 120)
  const rows = useMemo(
    () =>
      filterVessels(state.vessels, {
        ...state.vesselFilters,
        query: debouncedQuery,
      }),
    [debouncedQuery, state.vesselFilters, state.vessels],
  )
  const visibleIds = rows.map((row) => row.id)
  const active = state.vessels.find((vessel) => vessel.id === activeId) ?? null
  const selectedHidden = state.selectedVesselIds.filter((id) => !visibleIds.includes(id)).length

  const columns: Column<Vessel>[] = [
    {
      id: 'name',
      header: 'Vessel',
      sortValue: (row) => row.name,
      render: (row) => row.name,
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
      id: 'flag',
      header: 'Flag',
      sortValue: (row) => row.flag,
      render: (row) => row.flag,
    },
    {
      id: 'loa',
      header: 'LOA',
      sortValue: (row) => row.loaMeters,
      render: (row) => `${row.loaMeters} m`,
    },
    {
      id: 'draft',
      header: 'Draft',
      sortValue: (row) => row.draftMeters,
      render: (row) => `${row.draftMeters} m`,
    },
  ]

  return (
    <div className="stack">
      <div className="page-head">
        <div>
          <h1>Vessel register</h1>
          <p>
            {state.selectedVesselIds.length} selected
            {selectedHidden > 0 ? ` · ${selectedHidden} still selected outside this filter` : ''}
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => dispatch({ type: 'clear-vessel-selection' })}
        >
          Clear selection
        </button>
      </div>
      <form className="filters" onSubmit={(event) => event.preventDefault()}>
        <div className="field">
          <label htmlFor="vessel-query">Search</label>
          <input
            id="vessel-query"
            value={state.vesselFilters.query}
            onChange={(event) =>
              dispatch({ type: 'set-vessel-filters', filters: { query: event.target.value } })
            }
            placeholder="Name, IMO, call sign, agent"
          />
        </div>
        <div className="field">
          <label htmlFor="vessel-type">Type</label>
          <select
            id="vessel-type"
            value={state.vesselFilters.type}
            onChange={(event) =>
              dispatch({
                type: 'set-vessel-filters',
                filters: { type: event.target.value as VesselType | 'all' },
              })
            }
          >
            {TYPE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="vessel-status">Status</label>
          <select
            id="vessel-status"
            value={state.vesselFilters.status}
            onChange={(event) =>
              dispatch({
                type: 'set-vessel-filters',
                filters: { status: event.target.value as VesselStatus | 'all' },
              })
            }
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </form>
      {rows.length === 0 ? (
        <EmptyState
          title="No vessels match"
          body="Clear the search or widen the type and status filters."
        />
      ) : (
        <DataTable
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          caption="Registered vessels on Ashford Reach"
          selectedIds={state.selectedVesselIds}
          onToggle={(id, shift) =>
            dispatch({ type: 'toggle-vessel', id, visibleIds, shift })
          }
          onToggleAll={(selected) =>
            dispatch({ type: 'select-all-visible-vessels', visibleIds, selected })
          }
          onActivate={setActiveId}
        />
      )}
      {active ? (
        <aside className="drawer" aria-label={`${active.name} details`}>
          <h2>{active.name}</h2>
          <p className="muted">
            {active.callSign} · IMO {active.imo} · {active.agent}
          </p>
          <p>{active.notes}</p>
          <p>Last port {active.lastPort}. {active.loaMeters}m LOA, {active.draftMeters}m draft.</p>
        </aside>
      ) : null}
    </div>
  )
}
