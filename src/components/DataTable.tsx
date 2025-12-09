import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'

export type Column<T> = {
  id: string
  header: string
  sortValue?: (row: T) => string | number
  render: (row: T) => ReactNode
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  selectedIds,
  onToggle,
  onToggleAll,
  onActivate,
}: {
  rows: T[]
  columns: Column<T>[]
  getRowId: (row: T) => string
  caption: string
  selectedIds: string[]
  onToggle: (id: string, shift: boolean) => void
  onToggleAll: (selected: boolean) => void
  onActivate?: (id: string) => void
}) {
  const [sortId, setSortId] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const sorted = useMemo(() => {
    const column = columns.find((item) => item.id === sortId)
    if (!column?.sortValue) return rows
    const copy = [...rows]
    copy.sort((a, b) => {
      const left = column.sortValue!(a)
      const right = column.sortValue!(b)
      if (left < right) return sortDir === 'asc' ? -1 : 1
      if (left > right) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [columns, rows, sortDir, sortId])

  const visibleIds = sorted.map(getRowId)
  const selectedVisible = selectedIds.filter((id) => visibleIds.includes(id))
  const allSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length

  function cycleSort(columnId: string) {
    if (sortId !== columnId) {
      setSortId(columnId)
      setSortDir('asc')
      return
    }
    setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
  }

  function onRowKey(event: KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (event.key === 'Enter' && onActivate) onActivate(id)
      else onToggle(id, event.shiftKey)
    }
  }

  return (
    <div className="table-wrap">
      <table className="data">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">
              <label>
                <span className="visually-hidden">Select all rows</span>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleAll(event.target.checked)}
                />
              </label>
            </th>
            {columns.map((column) => {
              const ariaSort =
                sortId === column.id ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
              return (
                <th key={column.id} scope="col" aria-sort={ariaSort}>
                  {column.sortValue ? (
                    <button type="button" onClick={() => cycleSort(column.id)}>
                      {column.header}
                      {sortId === column.id ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const id = getRowId(row)
            const selected = selectedIds.includes(id)
            return (
              <tr
                key={id}
                aria-selected={selected}
                tabIndex={0}
                onClick={(event) => onToggle(id, event.shiftKey)}
                onDoubleClick={() => onActivate?.(id)}
                onKeyDown={(event) => onRowKey(event, id)}
              >
                <td>
                  <label>
                    <span className="visually-hidden">Select {id}</span>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        event.stopPropagation()
                        onToggle(id, false)
                      }}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </label>
                </td>
                {columns.map((column) => (
                  <td key={column.id}>{column.render(row)}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
