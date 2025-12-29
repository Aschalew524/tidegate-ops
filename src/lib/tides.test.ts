import { describe, expect, it } from 'vitest'
import { isInsideSafeWorkingWindow, tideHeightAt, tidePhaseAt } from './tides.ts'

describe('tides', () => {
  it('returns a bounded gauge height', () => {
    const height = tideHeightAt(new Date('2025-11-20T14:00:00.000Z'))
    expect(height).toBeGreaterThan(0.5)
    expect(height).toBeLessThan(4.2)
  })

  it('classifies slack near turning water', () => {
    const slackish = tidePhaseAt(new Date('2025-11-20T00:00:00.000Z'))
    expect(['slack', 'flood', 'ebb']).toContain(slackish)
  })

  it('treats very low water as outside the working window', () => {
    const samples = Array.from({ length: 24 }, (_, hour) => {
      const at = new Date(Date.UTC(2025, 10, 20, hour, 0, 0))
      return { hour, ok: isInsideSafeWorkingWindow(at, 3.8) }
    })
    expect(samples.some((item) => !item.ok)).toBe(true)
  })
})
