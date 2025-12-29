import { describe, expect, it } from 'vitest'
import { overlaps } from './time.ts'

describe('overlaps', () => {
  it('detects overlapping closed-open windows', () => {
    expect(
      overlaps(
        '2025-11-20T10:00:00.000Z',
        '2025-11-20T12:00:00.000Z',
        '2025-11-20T11:00:00.000Z',
        '2025-11-20T13:00:00.000Z',
      ),
    ).toBe(true)
  })

  it('allows back-to-back windows', () => {
    expect(
      overlaps(
        '2025-11-20T10:00:00.000Z',
        '2025-11-20T12:00:00.000Z',
        '2025-11-20T12:00:00.000Z',
        '2025-11-20T14:00:00.000Z',
      ),
    ).toBe(false)
  })
})
