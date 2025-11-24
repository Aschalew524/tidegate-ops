export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}

export function rangeIds(orderedIds: string[], fromId: string, toId: string): string[] {
  const from = orderedIds.indexOf(fromId)
  const to = orderedIds.indexOf(toId)
  if (from === -1 || to === -1) return [toId]
  const start = Math.min(from, to)
  const end = Math.max(from, to)
  return orderedIds.slice(start, end + 1)
}

export function mergeSelection(
  current: string[],
  next: string[],
  mode: 'replace' | 'add',
): string[] {
  if (mode === 'replace') return unique(next)
  return unique([...current, ...next])
}

export function selectedWithinView(selectedIds: string[], visibleIds: string[]): string[] {
  const visible = new Set(visibleIds)
  return selectedIds.filter((id) => visible.has(id))
}

export function preserveHiddenSelection(
  selectedIds: string[],
  visibleIds: string[],
  nextVisibleSelection: string[],
): string[] {
  const visible = new Set(visibleIds)
  const hidden = selectedIds.filter((id) => !visible.has(id))
  return unique([...hidden, ...nextVisibleSelection])
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)]
}
