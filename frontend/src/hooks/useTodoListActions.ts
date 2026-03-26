import { useState, useRef } from 'react'
import type { TodoList, TodoItem } from '../types/api'
import { addTodoItem, updateTodoItem, deleteTodoItem, deleteTodoList } from '../api/todoLists'
import {
  computeDisplayOrder,
  insertAtBoundary,
  getStoredOrder,
  saveStoredOrder,
  removeListOrder,
} from '../utils/itemOrder'

interface Options {
  list: TodoList
  onUpdated: (list: TodoList) => void
  onDeleted: (listId: number) => void
}

export function useTodoListActions({ list, onUpdated, onDeleted }: Options) {
  const [itemName, setItemName] = useState('')
  const [itemLoading, setItemLoading] = useState(false)

  const listRef = useRef(list)
  listRef.current = list
  const onUpdatedRef = useRef(onUpdated)
  onUpdatedRef.current = onUpdated
  const onDeletedRef = useRef(onDeleted)
  onDeletedRef.current = onDeleted

  const emitUpdate = (updated: TodoList) => {
    listRef.current = updated
    onUpdatedRef.current(updated)
  }

  const resetItemInput = () => {
    setItemName('')
    setItemLoading(false)
  }

  const handleAddItem = async () => {
    const trimmed = itemName.trim()
    const listId = listRef.current.id
    if (!trimmed || !listId) return

    // Optimistic: show item immediately with a temp id
    const tempId = -Date.now()
    const tempItem: TodoItem = { id: tempId, name: trimmed, done: false }

    const latest = listRef.current
    const storedOrder = getStoredOrder(latest.id)
    saveStoredOrder(latest.id, [tempId, ...storedOrder])
    emitUpdate({ ...latest, todoItems: [...latest.todoItems, tempItem] })
    setItemName('')

    try {
      const item = await addTodoItem(listId, { name: trimmed })

      // Replace temp item with real item
      const current = listRef.current
      const currentOrder = getStoredOrder(current.id)
      saveStoredOrder(current.id, currentOrder.map(id => id === tempId ? item.id : id))
      emitUpdate({ ...current, todoItems: current.todoItems.map(i => i.id === tempId ? item : i) })
    } catch {
      // Revert on failure
      const current = listRef.current
      const currentOrder = getStoredOrder(current.id)
      saveStoredOrder(current.id, currentOrder.filter(id => id !== tempId))
      emitUpdate({ ...current, todoItems: current.todoItems.filter(i => i.id !== tempId) })
    }
  }

  const handleToggleItem = async (item: TodoItem) => {
    try {
      const updated = await updateTodoItem(listRef.current.id, item.id, { done: !item.done })

      const latest = listRef.current
      const updatedItems = latest.todoItems.map(i => (i.id === item.id ? updated : i))
      const currentOrdered = computeDisplayOrder(updatedItems, latest.id)
      const newOrdered = insertAtBoundary(currentOrdered, updated)
      saveStoredOrder(latest.id, newOrdered.map(i => i.id))

      emitUpdate({ ...latest, todoItems: updatedItems })
    } catch {
      // API layer throws on failure
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteTodoItem(listRef.current.id, itemId)

      const latest = listRef.current
      const storedOrder = getStoredOrder(latest.id)
      saveStoredOrder(latest.id, storedOrder.filter(id => id !== itemId))

      emitUpdate({ ...latest, todoItems: latest.todoItems.filter(i => i.id !== itemId) })
    } catch {
      // API layer throws on failure
    }
  }

  const handleUpdateItemName = async (itemId: number, name: string) => {
    const updated = await updateTodoItem(listRef.current.id, itemId, { name })
    const latest = listRef.current
    emitUpdate({ ...latest, todoItems: latest.todoItems.map(i => (i.id === itemId ? updated : i)) })
  }

  const handleDeleteList = async () => {
    try {
      const listId = listRef.current.id
      await deleteTodoList(listId)
      removeListOrder(listId)
      onDeletedRef.current(listId)
    } catch {
      // API layer throws on failure
    }
  }

  return {
    itemName,
    setItemName,
    itemLoading,
    resetItemInput,
    handleAddItem,
    handleToggleItem,
    handleDeleteItem,
    handleUpdateItemName,
    handleDeleteList,
  }
}
