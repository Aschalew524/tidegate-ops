type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'tide'

const TONES: Record<string, Tone> = {
  open: 'ok',
  alongside: 'ok',
  passed: 'ok',
  completed: 'ok',
  cleared: 'ok',
  valid: 'ok',
  inbound: 'info',
  expected: 'info',
  submitted: 'info',
  queued: 'info',
  flood: 'tide',
  slack: 'tide',
  maintenance: 'warn',
  expiring: 'warn',
  draft: 'warn',
  mitigating: 'warn',
  moderate: 'warn',
  high: 'warn',
  detained: 'danger',
  failed: 'danger',
  denied: 'danger',
  closed: 'danger',
  expired: 'danger',
  critical: 'danger',
  ebb: 'info',
}

export function StatusPill({ value }: { value: string }) {
  const tone = TONES[value] ?? 'info'
  return (
    <span className="status-pill" data-tone={tone}>
      {value.replaceAll('_', ' ')}
    </span>
  )
}
