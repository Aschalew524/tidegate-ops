export function addHours(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * 60 * 60 * 1000)
}

export function addDays(base: Date, days: number): Date {
  return addHours(base, days * 24)
}

export function startOfHour(date: Date): Date {
  const next = new Date(date)
  next.setMinutes(0, 0, 0)
  return next
}

export function iso(date: Date): string {
  return date.toISOString()
}

export function formatClock(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(date)
}

export function formatDay(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  }).format(date)
}

export function formatStamp(isoString: string): string {
  const date = new Date(isoString)
  return `${formatDay(date)} ${formatClock(date)} UTC`
}

export function formatRelative(isoString: string, now: Date): string {
  const deltaMs = new Date(isoString).getTime() - now.getTime()
  const minutes = Math.round(deltaMs / 60000)
  const abs = Math.abs(minutes)
  if (abs < 1) return 'now'
  const suffix = minutes < 0 ? 'ago' : 'from now'
  if (abs < 60) return `${abs}m ${suffix}`
  const hours = Math.round(abs / 60)
  if (hours < 48) return `${hours}h ${suffix}`
  const days = Math.round(hours / 24)
  return `${days}d ${suffix}`
}

export function overlaps(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && bStart < aEnd
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function titleCaseRole(role: string): string {
  return role.replaceAll('_', ' ')
}
