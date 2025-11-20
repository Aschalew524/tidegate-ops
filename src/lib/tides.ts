import type { TideSample } from '../types/harbor.ts'
import { clamp } from './time.ts'

const HARBOR_MEAN = 2.4
const AMPLITUDE = 1.55

export function tideHeightAt(now: Date): number {
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  const radians = (minutes / (24 * 60)) * Math.PI * 4
  return Number((HARBOR_MEAN + AMPLITUDE * Math.sin(radians)).toFixed(2))
}

export function tidePhaseAt(now: Date): TideSample['phase'] {
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes()
  const radians = (minutes / (24 * 60)) * Math.PI * 4
  const derivative = Math.cos(radians)
  if (Math.abs(derivative) < 0.12) return 'slack'
  return derivative > 0 ? 'flood' : 'ebb'
}

export function tideSamplesForDay(now: Date): TideSample[] {
  const samples: TideSample[] = []
  for (let hour = 0; hour < 24; hour += 1) {
    const at = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hour,
      0,
      0,
    ))
    samples.push({
      atHour: hour,
      heightMeters: tideHeightAt(at),
      phase: tidePhaseAt(at),
    })
  }
  return samples
}

export function isInsideSafeWorkingWindow(now: Date, minHeight = 1.4): boolean {
  return tideHeightAt(now) >= minHeight
}

export function tideProgress(now: Date): number {
  const min = HARBOR_MEAN - AMPLITUDE
  const max = HARBOR_MEAN + AMPLITUDE
  return clamp((tideHeightAt(now) - min) / (max - min), 0, 1)
}
