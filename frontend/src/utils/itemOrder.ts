import type { TodoItem } from '../types/api'

const KEY_PREFIX = 'todo-item-order-'

export function getStoredOrder(listId: number): number[] {
  try {
    const stored = localStorage.getItem(`${KEY_PREFIX}${listId}`)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveStoredOrder(listId: number, order: number[]) {
  const seen = new Set<number>()
  const deduped = order.filter(id => {
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
  localStorage.setItem(`${KEY_PREFIX}${listId}`, JSON.stringify(deduped))
}

export function removeListOrder(listId: number) {
  localStorage.removeItem(`${KEY_PREFIX}${listId}`)
}

/**
 * Build display order from items + stored order.
 * - Items in stored order keep their stored position.
 * - Items not in stored order go to the top (newest first).
 * - If no stored order: unchecked first, then checked.
 */
export function computeDisplayOrder(items: TodoItem[], listId: number): TodoItem[] {
  const storedOrder = getStoredOrder(listId)
  const itemMap = new Map(items.map(i => [i.id, i]))

  if (storedOrder.length === 0) {
    const unique = [...itemMap.values()]
    return [...unique.filter(i => !i.done), ...unique.filter(i => i.done)]
  }

  const ordered: TodoItem[] = []
  const seen = new Set<number>()

  for (const id of storedOrder) {
    if (seen.has(id)) continue
    const item = itemMap.get(id)
    if (item) {
      ordered.push(item)
      seen.add(id)
    }
  }

  const newItems = [...itemMap.values()].filter(i => !seen.has(i.id))
  return [...newItems, ...ordered]
}

/**
 * Insert item at the boundary between unchecked and checked sections.
 * - Checked item → top of checked section (right at the boundary).
 * - Unchecked item → bottom of unchecked section (right at the boundary).
 */
export function insertAtBoundary(
  items: TodoItem[],
  item: TodoItem,
): TodoItem[] {
  const without = items.filter(i => i.id !== item.id)
  const firstCheckedIdx = without.findIndex(i => i.done)
  const insertIdx = firstCheckedIdx === -1 ? without.length : firstCheckedIdx
  const result = [...without]
  result.splice(insertIdx, 0, item)
  return result
}
