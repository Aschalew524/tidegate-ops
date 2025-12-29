import { describe, expect, it } from 'vitest'
import { createHarborRecords } from '../data/seed.ts'
import { buildOperationsReport, buildSnapshot } from './reports.ts'

const NOW = new Date('2025-11-20T14:00:00.000Z')

describe('reports', () => {
  it('counts detained vessels from the seed picture', () => {
    const snapshot = buildSnapshot(NOW, createHarborRecords(NOW))
    expect(snapshot.detained).toBe(1)
    expect(snapshot.openIncidents).toBeGreaterThan(0)
  })

  it('exposes occupancy as a percentage row', () => {
    const rows = buildOperationsReport(NOW, createHarborRecords(NOW))
    const occupancy = rows.find((row) => row.label === 'Berth occupancy')
    expect(occupancy?.value).toBeGreaterThanOrEqual(0)
    expect(occupancy?.value).toBeLessThanOrEqual(100)
  })
})
