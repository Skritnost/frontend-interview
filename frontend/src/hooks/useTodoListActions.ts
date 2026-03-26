import { useState } from 'react'
import type { TodoList, TodoItem } from '../types/api'
import { addTodoItem, updateTodoItem, deleteTodoItem, deleteTodoList } from '../api/todoLists'
import {
  computeDisplayOrder,
  reorderOnToggle,
  getStoredOrder,
  saveStoredOrder,
  removeItemFromOrder,
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

  const resetItemInput = () => {
    setItemName('')
    setItemLoading(false)
  }

  const handleAddItem = async () => {
    const trimmed = itemName.trim()
    if (!trimmed || !list.id) return
    setItemLoading(true)
    try {
      const item = await addTodoItem(list.id, { name: trimmed })
      const storedOrder = getStoredOrder(list.id)
      saveStoredOrder(list.id, [item.id, ...storedOrder])
      onUpdated({ ...list, todoItems: [...list.todoItems, item] })
      setItemName('')
    } catch {
      // API layer throws on failure
    } finally {
      setItemLoading(false)
    }
  }

  const handleToggleItem = async (item: TodoItem) => {
    try {
      const updated = await updateTodoItem(list.id, item.id, { done: !item.done })
      const updatedItems = list.todoItems.map(i => (i.id === item.id ? updated : i))
      const currentOrdered = computeDisplayOrder(updatedItems, list.id)
      const newOrdered = reorderOnToggle(currentOrdered, updated)
      saveStoredOrder(list.id, newOrdered.map(i => i.id))
      onUpdated({ ...list, todoItems: updatedItems })
    } catch {
      // API layer throws on failure
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteTodoItem(list.id, itemId)
      removeItemFromOrder(list.id, itemId)
      onUpdated({
        ...list,
        todoItems: list.todoItems.filter(i => i.id !== itemId),
      })
    } catch {
      // API layer throws on failure
    }
  }

  const handleDeleteList = async () => {
    try {
      await deleteTodoList(list.id)
      removeListOrder(list.id)
      onDeleted(list.id)
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
    handleDeleteList,
  }
}
