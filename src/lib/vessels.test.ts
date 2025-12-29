import { describe, expect, it } from 'vitest'
import { createHarborRecords } from '../data/seed.ts'
import { filterVessels } from './vessels.ts'

const NOW = new Date('2025-11-20T14:00:00.000Z')

describe('filterVessels', () => {
  const vessels = createHarborRecords(NOW).vessels

  it('matches call signs and IMO numbers', () => {
    const found = filterVessels(vessels, { query: 'HRFN', type: 'all', status: 'all' })
    expect(found.map((item) => item.name)).toEqual(['MV Harrowfen'])
  })

  it('intersects type and status filters', () => {
    const found = filterVessels(vessels, {
      query: '',
      type: 'fishing',
      status: 'detained',
    })
    expect(found).toHaveLength(1)
    expect(found[0]?.name).toBe('FV Mothlight')
  })
})
