import type { Inspection, InspectionStatus, Vessel } from '../types/harbor.ts'

const TRANSITIONS: Record<InspectionStatus, InspectionStatus[]> = {
  queued: ['in_progress'],
  in_progress: ['passed', 'failed'],
  passed: [],
  failed: ['queued'],
}

export function canTransitionInspection(
  from: InspectionStatus,
  to: InspectionStatus,
): boolean {
  return TRANSITIONS[from].includes(to)
}

export function inspectionOutcomeForVessel(
  inspections: Inspection[],
  vesselId: string,
): 'clear' | 'open' | 'failed' {
  const relevant = inspections.filter((item) => item.vesselId === vesselId)
  if (relevant.some((item) => item.status === 'failed')) return 'failed'
  if (relevant.some((item) => item.status === 'queued' || item.status === 'in_progress')) {
    return 'open'
  }
  return 'clear'
}

export function overdueInspections(inspections: Inspection[], now: Date): Inspection[] {
  return inspections.filter((item) => {
    if (item.status !== 'queued') return false
    return new Date(item.scheduledAt).getTime() < now.getTime()
  })
}

export function applyInspectionToVessel(
  vessel: Vessel,
  inspection: Inspection,
): Vessel {
  if (inspection.status === 'failed') {
    return { ...vessel, status: 'detained' }
  }
  if (inspection.status === 'passed' && vessel.status === 'detained') {
    return { ...vessel, status: vessel.type === 'ferry' ? 'alongside' : 'alongside' }
  }
  return vessel
}
