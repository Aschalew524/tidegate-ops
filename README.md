# Tidegate Ops

Operations console for **Tidegate Harbor Authority** on Ashford Reach. Dispatchers keep the berth board, movement desk, inspection queue, incident log, and crew tickets in one watch picture.

This is a private, self-contained React application. Harbor traffic is seeded locally. There are no cloud accounts, private APIs, or machine-specific files.

## Stack

- React 19 and React Router on Vite 6
- TypeScript, strict
- Node.js 20 (`engines.node` is `20.x`)
- npm with a single `package-lock.json`
- Vitest and Testing Library

## Scripts

```bash
npm install
npm run dev
npm test
npm run typecheck
npm run build
```

`npm test` runs offline. It does not need network access, tokens, or a browser install beyond jsdom.

## Watch boards

- **Watch** — occupancy, overdue inspections, open incidents
- **Vessels** — register with search, type/status filters, and multi-select that keeps hidden rows selected
- **Berths** — constraints and current occupants
- **Movements** — request arrivals/departures with live conflict preview, then clear or complete
- **Inspections** — queued → in progress → pass/fail (a fail detains the vessel)
- **Incidents** — file, mitigate, close
- **Crew** — duty flags and certificate expiry
- **Reports** — printable snapshot of the watch

Keyboard: `Ctrl/Cmd+K` opens the jump palette. `?` lists watch keys. Table rows support Space to select and Enter to open details. Status is never color-only; every pill also has a text label.

## Domain rules worth knowing

Movement windows cannot overlap on the same berth. LOA and draft cannot exceed the berth. Closed and maintenance berths reject traffic. Detained vessels cannot be planned for a new arrival.
