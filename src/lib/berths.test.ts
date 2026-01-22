import { describe, expect, it } from 'vitest'
import { createHarborRecords } from '../data/seed.ts'
import { occupantName, occupancyRate, openBerths } from './berths.ts'

const NOW = new Date('2025-11-20T14:00:00.000Z')

describe('berth occupancy', () => {
  it('names the occupant on North Finger 1', () => {
    const harbor = createHarborRecords(NOW)
    const berth = harbor.berths.find((item) => item.id === 'b-north-1')!
    expect(occupantName(berth, harbor.vessels)).toBe('MV Cinderwell')
  })

  it('ignores closed walls when computing occupancy', () => {
    const harbor = createHarborRecords(NOW)
    expect(openBerths(harbor.berths).every((berth) => berth.status === 'open')).toBe(true)
    expect(occupancyRate(harbor.berths)).toBeGreaterThan(0)
    expect(occupancyRate(harbor.berths)).toBeLessThanOrEqual(100)
  })
})
