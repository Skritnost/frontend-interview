import { renderHook, act } from '@testing-library/react'
import { vi, type Mock } from 'vitest'
import { useTodoListActions } from './useTodoListActions'
import type { TodoList, TodoItem } from '../types/api'

vi.mock('../api/todoLists', () => ({
  addTodoItem: vi.fn(),
  updateTodoItem: vi.fn(),
  deleteTodoItem: vi.fn(),
  deleteTodoList: vi.fn(),
}))

vi.mock('../utils/itemOrder', () => ({
  computeDisplayOrder: vi.fn((items: TodoItem[]) => items),
  insertAtBoundary: vi.fn((items: TodoItem[], item: TodoItem) => {
    const without = items.filter(i => i.id !== item.id)
    return [...without, item]
  }),
  getStoredOrder: vi.fn(() => []),
  saveStoredOrder: vi.fn(),
  removeListOrder: vi.fn(),
}))

import { addTodoItem, updateTodoItem, deleteTodoItem, deleteTodoList } from '../api/todoLists'
import { removeListOrder } from '../utils/itemOrder'

function makeList(overrides?: Partial<TodoList>): TodoList {
  return { id: 1, name: 'Test List', todoItems: [], ...overrides }
}

function makeItem(overrides?: Partial<TodoItem>): TodoItem {
  return { id: 100, name: 'Buy milk', done: false, ...overrides }
}

describe('useTodoListActions', () => {
  let onUpdated: Mock
  let onDeleted: Mock

  beforeEach(() => {
    vi.clearAllMocks()
    onUpdated = vi.fn()
    onDeleted = vi.fn()
  })

  // --- handleAddItem ---

  describe('handleAddItem', () => {
    it('optimistically adds item and reconciles with API response', async () => {
      const realItem = makeItem({ id: 42, name: 'New task' })
      ;(addTodoItem as Mock).mockResolvedValue(realItem)

      const list = makeList()
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      act(() => result.current.setItemName('New task'))

      await act(() => result.current.handleAddItem())

      // Input was cleared
      expect(result.current.itemName).toBe('')

      // API called with correct args
      expect(addTodoItem).toHaveBeenCalledWith(1, { name: 'New task' })

      // onUpdated called twice: optimistic + reconciliation
      expect(onUpdated).toHaveBeenCalledTimes(2)

      // Final call replaces temp item with real item
      const finalList = onUpdated.mock.calls[1][0] as TodoList
      expect(finalList.todoItems).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 42, name: 'New task' })]),
      )
      // No temp items remain
      expect(finalList.todoItems.every(i => i.id > 0)).toBe(true)
    })

    it('reverts optimistic item on API failure', async () => {
      ;(addTodoItem as Mock).mockRejectedValue(new Error('Network error'))

      const list = makeList()
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      act(() => result.current.setItemName('Will fail'))

      await act(() => result.current.handleAddItem())

      // onUpdated called twice: optimistic + revert
      expect(onUpdated).toHaveBeenCalledTimes(2)

      // Revert removes the temp item
      const revertedList = onUpdated.mock.calls[1][0] as TodoList
      expect(revertedList.todoItems).toHaveLength(0)
    })

    it('does nothing for empty or whitespace-only input', async () => {
      const list = makeList()
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      act(() => result.current.setItemName('   '))

      await act(() => result.current.handleAddItem())

      expect(addTodoItem).not.toHaveBeenCalled()
      expect(onUpdated).not.toHaveBeenCalled()
    })

    it('does nothing when list id is 0 (unsaved list)', async () => {
      const list = makeList({ id: 0 })
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      act(() => result.current.setItemName('Something'))

      await act(() => result.current.handleAddItem())

      expect(addTodoItem).not.toHaveBeenCalled()
    })
  })

  // --- handleToggleItem ---

  describe('handleToggleItem', () => {
    it('toggles item done state via API and emits update', async () => {
      const item = makeItem({ done: false })
      const toggled = { ...item, done: true }
      ;(updateTodoItem as Mock).mockResolvedValue(toggled)

      const list = makeList({ todoItems: [item] })
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      await act(() => result.current.handleToggleItem(item))

      expect(updateTodoItem).toHaveBeenCalledWith(1, 100, { done: true })
      expect(onUpdated).toHaveBeenCalledTimes(1)

      const updatedList = onUpdated.mock.calls[0][0] as TodoList
      expect(updatedList.todoItems[0].done).toBe(true)
    })

    it('does nothing on API failure', async () => {
      ;(updateTodoItem as Mock).mockRejectedValue(new Error('fail'))

      const item = makeItem()
      const list = makeList({ todoItems: [item] })
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      await act(() => result.current.handleToggleItem(item))

      expect(onUpdated).not.toHaveBeenCalled()
    })
  })

  // --- handleDeleteItem ---

  describe('handleDeleteItem', () => {
    it('removes item after successful API call', async () => {
      ;(deleteTodoItem as Mock).mockResolvedValue(undefined)

      const item = makeItem()
      const list = makeList({ todoItems: [item] })
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      await act(() => result.current.handleDeleteItem(100))

      expect(deleteTodoItem).toHaveBeenCalledWith(1, 100)
      expect(onUpdated).toHaveBeenCalledTimes(1)

      const updatedList = onUpdated.mock.calls[0][0] as TodoList
      expect(updatedList.todoItems).toHaveLength(0)
    })

    it('does nothing on API failure', async () => {
      ;(deleteTodoItem as Mock).mockRejectedValue(new Error('fail'))

      const item = makeItem()
      const list = makeList({ todoItems: [item] })
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      await act(() => result.current.handleDeleteItem(100))

      expect(onUpdated).not.toHaveBeenCalled()
    })
  })

  // --- handleDeleteList ---

  describe('handleDeleteList', () => {
    it('deletes list, clears stored order, and calls onDeleted', async () => {
      ;(deleteTodoList as Mock).mockResolvedValue(undefined)

      const list = makeList()
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      await act(() => result.current.handleDeleteList())

      expect(deleteTodoList).toHaveBeenCalledWith(1)
      expect(removeListOrder).toHaveBeenCalledWith(1)
      expect(onDeleted).toHaveBeenCalledWith(1)
    })

    it('does not call onDeleted on API failure', async () => {
      ;(deleteTodoList as Mock).mockRejectedValue(new Error('fail'))

      const list = makeList()
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      await act(() => result.current.handleDeleteList())

      expect(onDeleted).not.toHaveBeenCalled()
    })
  })

  // --- handleUpdateItemName ---

  describe('handleUpdateItemName', () => {
    it('updates item name via API and emits update', async () => {
      const item = makeItem()
      const updated = { ...item, name: 'Buy eggs' }
      ;(updateTodoItem as Mock).mockResolvedValue(updated)

      const list = makeList({ todoItems: [item] })
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      await act(() => result.current.handleUpdateItemName(100, 'Buy eggs'))

      expect(updateTodoItem).toHaveBeenCalledWith(1, 100, { name: 'Buy eggs' })
      expect(onUpdated).toHaveBeenCalledTimes(1)

      const updatedList = onUpdated.mock.calls[0][0] as TodoList
      expect(updatedList.todoItems[0].name).toBe('Buy eggs')
    })

    it('propagates API errors to the caller', async () => {
      ;(updateTodoItem as Mock).mockRejectedValue(new Error('fail'))

      const item = makeItem()
      const list = makeList({ todoItems: [item] })
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      await expect(
        act(() => result.current.handleUpdateItemName(100, 'Buy eggs')),
      ).rejects.toThrow('fail')

      expect(onUpdated).not.toHaveBeenCalled()
    })
  })

  // --- resetItemInput ---

  describe('resetItemInput', () => {
    it('clears item name', () => {
      const list = makeList()
      const { result } = renderHook(() =>
        useTodoListActions({ list, onUpdated, onDeleted }),
      )

      act(() => result.current.setItemName('something'))
      expect(result.current.itemName).toBe('something')

      act(() => result.current.resetItemInput())
      expect(result.current.itemName).toBe('')
    })
  })
})
