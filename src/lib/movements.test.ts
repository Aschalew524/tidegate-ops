import { describe, expect, it } from 'vitest'
import { createHarborRecords } from '../data/seed.ts'
import { activeWindowCount, groupMovementsByStatus } from './movements.ts'

const NOW = new Date('2025-11-20T14:00:00.000Z')

describe('movement grouping', () => {
  it('buckets seed movements by status', () => {
    const groups = groupMovementsByStatus(createHarborRecords(NOW).movements)
    expect(groups.cleared.length).toBeGreaterThan(0)
    expect(groups.denied.length).toBeGreaterThan(0)
    expect(activeWindowCount(createHarborRecords(NOW).movements)).toBe(
      groups.submitted.length + groups.cleared.length,
    )
  })
})
