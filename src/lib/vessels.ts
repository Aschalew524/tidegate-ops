import type { Vessel, VesselFilters, VesselStatus, VesselType } from '../types/harbor.ts'

const SEARCHABLE: Array<keyof Pick<Vessel, 'name' | 'callSign' | 'imo' | 'agent' | 'flag'>> = [
  'name',
  'callSign',
  'imo',
  'agent',
  'flag',
]

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function vesselMatchesQuery(vessel: Vessel, query: string): boolean {
  const needle = normalizeQuery(query)
  if (needle.length === 0) return true
  return SEARCHABLE.some((key) => vessel[key].toLowerCase().includes(needle))
}

export function filterVessels(vessels: Vessel[], filters: VesselFilters): Vessel[] {
  return vessels.filter((vessel) => {
    if (!vesselMatchesQuery(vessel, filters.query)) return false
    if (filters.type !== 'all' && vessel.type !== filters.type) return false
    if (filters.status !== 'all' && vessel.status !== filters.status) return false
    return true
  })
}

export function countByType(vessels: Vessel[]): Record<VesselType, number> {
  const counts: Record<VesselType, number> = {
    cargo: 0,
    ferry: 0,
    fishing: 0,
    tanker: 0,
    tug: 0,
    research: 0,
  }
  for (const vessel of vessels) counts[vessel.type] += 1
  return counts
}

export function countByStatus(vessels: Vessel[]): Record<VesselStatus, number> {
  const counts: Record<VesselStatus, number> = {
    expected: 0,
    inbound: 0,
    alongside: 0,
    departed: 0,
    detained: 0,
  }
  for (const vessel of vessels) counts[vessel.status] += 1
  return counts
}
