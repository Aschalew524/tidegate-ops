import type {
  Berth,
  Movement,
  MovementConflict,
  MovementStatus,
  Vessel,
} from '../types/harbor.ts'
import { overlaps } from './time.ts'

const ACTIVE_STATUSES: MovementStatus[] = ['submitted', 'cleared']

export function isActiveMovement(movement: Movement): boolean {
  return ACTIVE_STATUSES.includes(movement.status)
}

export function evaluateMovement(
  candidate: Pick<
    Movement,
    'id' | 'vesselId' | 'berthId' | 'type' | 'windowStart' | 'windowEnd' | 'status'
  >,
  context: {
    vessels: Vessel[]
    berths: Berth[]
    movements: Movement[]
  },
): MovementConflict[] {
  const conflicts: MovementConflict[] = []
  const vessel = context.vessels.find((item) => item.id === candidate.vesselId)
  const berth = context.berths.find((item) => item.id === candidate.berthId)

  if (!vessel) {
    conflicts.push({
      kind: 'hard',
      code: 'missing-vessel',
      message: 'The nominated vessel is not on the Tidegate register.',
    })
    return conflicts
  }

  if (!berth) {
    conflicts.push({
      kind: 'hard',
      code: 'missing-berth',
      message: 'The nominated berth does not exist on Ashford Reach.',
    })
    return conflicts
  }

  if (candidate.windowEnd <= candidate.windowStart) {
    conflicts.push({
      kind: 'hard',
      code: 'window-order',
      message: 'The movement window must end after it starts.',
    })
  }

  if (berth.status === 'closed') {
    conflicts.push({
      kind: 'hard',
      code: 'berth-closed',
      message: `${berth.name} is closed to traffic.`,
    })
  }

  if (berth.status === 'maintenance') {
    conflicts.push({
      kind: 'hard',
      code: 'berth-maintenance',
      message: `${berth.name} is under maintenance and cannot accept ${candidate.type}s.`,
    })
  }

  if (vessel.loaMeters > berth.maxLoaMeters) {
    conflicts.push({
      kind: 'hard',
      code: 'loa',
      message: `${vessel.name} LOA ${vessel.loaMeters}m exceeds ${berth.name} limit of ${berth.maxLoaMeters}m.`,
    })
  }

  if (vessel.draftMeters > berth.maxDraftMeters) {
    conflicts.push({
      kind: 'hard',
      code: 'draft',
      message: `${vessel.name} draft ${vessel.draftMeters}m exceeds ${berth.name} limit of ${berth.maxDraftMeters}m.`,
    })
  }

  if (vessel.status === 'detained' && candidate.type !== 'departure') {
    conflicts.push({
      kind: 'hard',
      code: 'detained',
      message: `${vessel.name} is detained and may only be planned for departure after release.`,
    })
  }

  if (
    candidate.type === 'arrival' &&
    berth.currentVesselId &&
    berth.currentVesselId !== vessel.id
  ) {
    const occupant = context.vessels.find((item) => item.id === berth.currentVesselId)
    conflicts.push({
      kind: 'soft',
      code: 'occupied',
      message: `${berth.name} is occupied by ${occupant?.name ?? 'another vessel'} until that departure completes.`,
    })
  }

  if (candidate.type === 'departure' && vessel.status !== 'alongside') {
    conflicts.push({
      kind: 'soft',
      code: 'not-alongside',
      message: `${vessel.name} is not marked alongside, so a departure may be premature.`,
    })
  }

  const overlapping = context.movements.filter((movement) => {
    if (movement.id === candidate.id) return false
    if (!isActiveMovement(movement)) return false
    if (movement.berthId !== candidate.berthId) return false
    return overlaps(
      candidate.windowStart,
      candidate.windowEnd,
      movement.windowStart,
      movement.windowEnd,
    )
  })

  for (const movement of overlapping) {
    const other = context.vessels.find((item) => item.id === movement.vesselId)
    conflicts.push({
      kind: 'hard',
      code: 'window-overlap',
      message: `Window overlaps ${movement.type} for ${other?.name ?? movement.vesselId} on ${berth.name}.`,
    })
  }

  const vesselDoubleBooked = context.movements.some((movement) => {
    if (movement.id === candidate.id) return false
    if (!isActiveMovement(movement)) return false
    if (movement.vesselId !== candidate.vesselId) return false
    return overlaps(
      candidate.windowStart,
      candidate.windowEnd,
      movement.windowStart,
      movement.windowEnd,
    )
  })

  if (vesselDoubleBooked) {
    conflicts.push({
      kind: 'hard',
      code: 'vessel-double-booked',
      message: `${vessel.name} already has an active movement in this window.`,
    })
  }

  return conflicts
}

export function hardConflicts(conflicts: MovementConflict[]): MovementConflict[] {
  return conflicts.filter((item) => item.kind === 'hard')
}

export function summarizeConflicts(conflicts: MovementConflict[]): string | null {
  if (conflicts.length === 0) return null
  return conflicts.map((item) => item.message).join(' ')
}
