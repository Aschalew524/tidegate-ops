import type {
  Berth,
  Incident,
  Inspection,
  Movement,
  Vessel,
} from '../types/harbor.ts'
import { occupancyRate } from './berths.ts'
import { countByStatus } from './vessels.ts'
import { overdueInspections } from './inspections.ts'

export type HarborSnapshot = {
  alongside: number
  inbound: number
  detained: number
  openIncidents: number
  overdueInspections: number
  closedBerths: number
  completedMovements: number
  occupancyPct: number
}

export function buildSnapshot(
  now: Date,
  input: {
    vessels: Vessel[]
    berths: Berth[]
    movements: Movement[]
    inspections: Inspection[]
    incidents: Incident[]
  },
): HarborSnapshot {
  const vesselCounts = countByStatus(input.vessels)
  return {
    alongside: vesselCounts.alongside,
    inbound: vesselCounts.inbound + vesselCounts.expected,
    detained: vesselCounts.detained,
    openIncidents: input.incidents.filter((item) => item.status !== 'closed').length,
    overdueInspections: overdueInspections(input.inspections, now).length,
    closedBerths: input.berths.filter((berth) => berth.status !== 'open').length,
    completedMovements: input.movements.filter((item) => item.status === 'completed').length,
    occupancyPct: occupancyRate(input.berths),
  }
}

export type ReportRow = {
  label: string
  value: number
  hint: string
}

export function buildOperationsReport(
  now: Date,
  input: {
    vessels: Vessel[]
    berths: Berth[]
    movements: Movement[]
    inspections: Inspection[]
    incidents: Incident[]
  },
): ReportRow[] {
  const snapshot = buildSnapshot(now, input)
  const denied = input.movements.filter((item) => item.status === 'denied').length
  const critical = input.incidents.filter(
    (item) => item.severity === 'critical' && item.status !== 'closed',
  ).length
  return [
    { label: 'Alongside', value: snapshot.alongside, hint: 'Vessels currently on a berth' },
    { label: 'Inbound / expected', value: snapshot.inbound, hint: 'Still to arrive on the reach' },
    { label: 'Detained', value: snapshot.detained, hint: 'Held after a failed inspection' },
    { label: 'Berth occupancy', value: snapshot.occupancyPct, hint: 'Percent of open berths occupied' },
    { label: 'Overdue inspections', value: snapshot.overdueInspections, hint: 'Queued past scheduled time' },
    { label: 'Open incidents', value: snapshot.openIncidents, hint: 'Not yet closed on the log' },
    { label: 'Critical open', value: critical, hint: 'Critical incidents still active' },
    { label: 'Denied movements', value: denied, hint: 'Requests rejected by conflict rules' },
  ]
}
