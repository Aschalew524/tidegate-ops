import { describe, expect, it } from 'vitest'
import { createHarborRecords } from '../data/seed.ts'
import { evaluateMovement, hardConflicts } from './conflicts.ts'

const NOW = new Date('2025-11-20T14:00:00.000Z')

describe('evaluateMovement', () => {
  const harbor = createHarborRecords(NOW)

  it('rejects a draft that exceeds berth draft', () => {
    const conflicts = evaluateMovement(
      {
        id: 'x',
        vesselId: 'v-hollowmere',
        berthId: 'b-south-a',
        type: 'arrival',
        status: 'submitted',
        windowStart: '2025-11-21T10:00:00.000Z',
        windowEnd: '2025-11-21T12:00:00.000Z',
      },
      harbor,
    )
    expect(hardConflicts(conflicts).some((item) => item.code === 'draft' || item.code === 'loa')).toBe(
      true,
    )
  })

  it('rejects overlapping cleared windows on Grain Jetty', () => {
    const conflicts = evaluateMovement(
      {
        id: 'x',
        vesselId: 'v-redkettle',
        berthId: 'b-grain',
        type: 'arrival',
        status: 'submitted',
        windowStart: harbor.movements.find((item) => item.id === 'm-harrow-arr')!.windowStart,
        windowEnd: harbor.movements.find((item) => item.id === 'm-harrow-arr')!.windowEnd,
      },
      harbor,
    )
    expect(hardConflicts(conflicts).some((item) => item.code === 'window-overlap')).toBe(true)
  })

  it('blocks arrivals to a closed wall', () => {
    const conflicts = evaluateMovement(
      {
        id: 'x',
        vesselId: 'v-saltbriar',
        berthId: 'b-layby',
        type: 'arrival',
        status: 'submitted',
        windowStart: '2025-11-22T10:00:00.000Z',
        windowEnd: '2025-11-22T11:00:00.000Z',
      },
      harbor,
    )
    expect(hardConflicts(conflicts).some((item) => item.code === 'berth-closed')).toBe(true)
  })
})
