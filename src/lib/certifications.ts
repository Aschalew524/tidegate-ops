import type { Certification } from '../types/harbor.ts'
import { addDays } from './time.ts'

export type CertificationHealth = 'valid' | 'expiring' | 'expired'

export function certificationHealth(
  cert: Certification,
  now: Date,
  warningDays = 14,
): CertificationHealth {
  const expires = new Date(cert.expiresOn)
  if (expires.getTime() < now.getTime()) return 'expired'
  if (expires.getTime() <= addDays(now, warningDays).getTime()) return 'expiring'
  return 'valid'
}

export function worstCertificationHealth(
  certs: Certification[],
  now: Date,
): CertificationHealth {
  const ranks: Record<CertificationHealth, number> = {
    valid: 0,
    expiring: 1,
    expired: 2,
  }
  return certs.reduce<CertificationHealth>((worst, cert) => {
    const health = certificationHealth(cert, now)
    return ranks[health] > ranks[worst] ? health : worst
  }, 'valid')
}

export function crewIsClearedForDuty(
  certs: Certification[],
  now: Date,
  required: string[],
): boolean {
  return required.every((name) => {
    const cert = certs.find((item) => item.name === name)
    return cert !== undefined && certificationHealth(cert, now) !== 'expired'
  })
}
