import type { Berth, Vessel } from '../types/harbor.ts'

export function occupantName(berth: Berth, vessels: Vessel[]): string | null {
  if (!berth.currentVesselId) return null
  return vessels.find((vessel) => vessel.id === berth.currentVesselId)?.name ?? berth.currentVesselId
}

export function openBerths(berths: Berth[]): Berth[] {
  return berths.filter((berth) => berth.status === 'open')
}

export function occupancyRate(berths: Berth[]): number {
  const usable = openBerths(berths)
  if (usable.length === 0) return 0
  const occupied = usable.filter((berth) => berth.currentVesselId).length
  return Math.round((occupied / usable.length) * 100)
}
