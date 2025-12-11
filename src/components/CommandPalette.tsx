import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHarbor } from '../state/HarborContext.tsx'
import { useFocusTrap } from '../hooks/useFocusTrap.ts'

const ROUTES = [
  { path: '/', label: 'Watch dashboard' },
  { path: '/vessels', label: 'Vessel register' },
  { path: '/berths', label: 'Berth board' },
  { path: '/movements', label: 'Movement desk' },
  { path: '/inspections', label: 'Inspection queue' },
  { path: '/incidents', label: 'Incident log' },
  { path: '/crew', label: 'Crew and certificates' },
  { path: '/reports', label: 'Watch report' },
]

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { state } = useHarbor()
  const navigate = useNavigate()
  const trapRef = useFocusTrap(open)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const routes = ROUTES.filter((item) => item.label.toLowerCase().includes(q))
    const vessels = state.vessels
      .filter((vessel) =>
        `${vessel.name} ${vessel.callSign} ${vessel.imo}`.toLowerCase().includes(q),
      )
      .slice(0, 8)
      .map((vessel) => ({
        path: `/vessels?focus=${vessel.id}`,
        label: `${vessel.name} · ${vessel.callSign}`,
      }))
    return [...routes, ...vessels]
  }, [query, state.vessels])

  useEffect(() => {
    setActive(0)
  }, [query, open])

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function go(path: string) {
    navigate(path)
    onClose()
    setQuery('')
  }

  return (
    <div className="command-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        ref={trapRef}
        className="command"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Jump to a board, berth, or vessel"
          aria-label="Search Tidegate"
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActive((index) => Math.min(items.length - 1, index + 1))
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActive((index) => Math.max(0, index - 1))
            }
            if (event.key === 'Enter' && items[active]) {
              go(items[active].path)
            }
          }}
        />
        <ul>
          {items.map((item, index) => (
            <li key={item.path + item.label}>
              <button
                type="button"
                className="row"
                data-active={index === active}
                onClick={() => go(item.path)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
