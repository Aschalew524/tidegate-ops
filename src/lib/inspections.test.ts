import { describe, expect, it } from 'vitest'
import { canTransitionInspection, overdueInspections } from './inspections.ts'
import { createHarborRecords } from '../data/seed.ts'

const NOW = new Date('2025-11-20T14:00:00.000Z')

describe('inspections', () => {
  it('only allows queued work to start', () => {
    expect(canTransitionInspection('queued', 'in_progress')).toBe(true)
    expect(canTransitionInspection('queued', 'passed')).toBe(false)
    expect(canTransitionInspection('in_progress', 'failed')).toBe(true)
  })

  it('lists queued inspections that have already lapsed', () => {
    const overdue = overdueInspections(createHarborRecords(NOW).inspections, NOW)
    expect(overdue.some((item) => item.id === 'i-salt-safety')).toBe(true)
  })
})
