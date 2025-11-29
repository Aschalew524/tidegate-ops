import type { Movement, MovementStatus } from '../types/harbor.ts'

export function groupMovementsByStatus(
  movements: Movement[],
): Record<MovementStatus, Movement[]> {
  const groups: Record<MovementStatus, Movement[]> = {
    draft: [],
    submitted: [],
    cleared: [],
    denied: [],
    completed: [],
  }
  for (const movement of movements) groups[movement.status].push(movement)
  return groups
}

export function activeWindowCount(movements: Movement[]): number {
  return movements.filter(
    (item) => item.status === 'submitted' || item.status === 'cleared',
  ).length
}
