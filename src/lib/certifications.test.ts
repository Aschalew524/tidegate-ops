import { describe, expect, it } from 'vitest'
import { certificationHealth, crewIsClearedForDuty, worstCertificationHealth } from './certifications.ts'

const NOW = new Date('2025-11-20T14:00:00.000Z')

describe('certifications', () => {
  it('marks past dates expired', () => {
    expect(
      certificationHealth({ name: 'VHF Watch', expiresOn: '2025-11-01T00:00:00.000Z' }, NOW),
    ).toBe('expired')
  })

  it('warns inside the 14-day window', () => {
    expect(
      certificationHealth({ name: 'VHF Watch', expiresOn: '2025-11-28T00:00:00.000Z' }, NOW),
    ).toBe('expiring')
  })

  it('blocks duty when a required ticket is expired', () => {
    expect(
      crewIsClearedForDuty(
        [{ name: 'Pilot Exemption — Ashford Reach', expiresOn: '2025-01-01T00:00:00.000Z' }],
        NOW,
        ['Pilot Exemption — Ashford Reach'],
      ),
    ).toBe(false)
  })

  it('rolls up the worst ticket on a crew card', () => {
    expect(
      worstCertificationHealth(
        [
          { name: 'A', expiresOn: '2026-01-01T00:00:00.000Z' },
          { name: 'B', expiresOn: '2025-11-01T00:00:00.000Z' },
        ],
        NOW,
      ),
    ).toBe('expired')
  })
})
