import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { SkipLink } from './SkipLink.tsx'
import { LiveRegion } from './LiveRegion.tsx'
import { TideStrip } from './TideStrip.tsx'
import { CommandPalette } from './CommandPalette.tsx'
import { useHarbor } from '../state/HarborContext.tsx'
import { readDensity, readTheme, writeDensity, writeTheme } from '../state/preferences.ts'
import type { Density, ThemeName } from '../types/harbor.ts'
import { Dialog } from './Dialog.tsx'

const LINKS = [
  { to: '/', label: 'Watch' },
  { to: '/vessels', label: 'Vessels' },
  { to: '/berths', label: 'Berths' },
  { to: '/movements', label: 'Movements' },
  { to: '/inspections', label: 'Inspections' },
  { to: '/incidents', label: 'Incidents' },
  { to: '/crew', label: 'Crew' },
  { to: '/reports', label: 'Reports' },
]

export function AppShell() {
  const { state, now } = useHarbor()
  const location = useLocation()
  const [theme, setTheme] = useState<ThemeName>('dark')
  const [density, setDensity] = useState<Density>('comfortable')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    setTheme(readTheme())
    setDensity(readDensity())
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeTheme(theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.density = density
    writeDensity(density)
  }, [density])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen(true)
      }
      if (!typing && event.key === '?') {
        event.preventDefault()
        setHelpOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    setPaletteOpen(false)
  }, [location.pathname])

  return (
    <>
      <SkipLink />
      <LiveRegion message={state.announcement} />
      <div className="shell">
        <aside className="sidebar">
          <div className="brand">
            <strong>Tidegate Ops</strong>
            <span>Ashford Reach · Harbor Authority</span>
          </div>
          <nav className="nav" aria-label="Operations">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <p className="footer-hint">Ctrl+K jumps. ? shows the watch keys.</p>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <TideStrip now={now} />
            <div className="topbar-meta">
              <label>
                <span className="visually-hidden">Color theme</span>
                <select
                  value={theme}
                  onChange={(event) => setTheme(event.target.value as ThemeName)}
                  aria-label="Color theme"
                >
                  <option value="dark">Night watch</option>
                  <option value="light">Day watch</option>
                </select>
              </label>
              <label>
                <span className="visually-hidden">Table density</span>
                <select
                  value={density}
                  onChange={(event) => setDensity(event.target.value as Density)}
                  aria-label="Table density"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </label>
              <button type="button" className="btn-ghost" onClick={() => setPaletteOpen(true)}>
                Jump
              </button>
            </div>
          </header>
          <main id="main" className="main">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Dialog title="Watch keyboard" open={helpOpen} onClose={() => setHelpOpen(false)}>
        <ul>
          <li>Ctrl or Cmd + K — command palette</li>
          <li>? — this help</li>
          <li>Space on a table row — select</li>
          <li>Enter on a table row — open details</li>
        </ul>
      </Dialog>
    </>
  )
}
