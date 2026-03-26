import { useState, useRef } from 'react'
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

  const listRef = useRef(list)
  listRef.current = list
  const onUpdatedRef = useRef(onUpdated)
  onUpdatedRef.current = onUpdated
  const onDeletedRef = useRef(onDeleted)
  onDeletedRef.current = onDeleted

  const resetItemInput = () => {
    setItemName('')
    setItemLoading(false)
  }

  const handleAddItem = async () => {
    const trimmed = itemName.trim()
    if (!trimmed || !listRef.current.id) return
    setItemLoading(true)
    try {
      const currentList = listRef.current
      const item = await addTodoItem(currentList.id, { name: trimmed })
      const storedOrder = getStoredOrder(currentList.id)
      saveStoredOrder(currentList.id, [item.id, ...storedOrder])
      onUpdatedRef.current({ ...currentList, todoItems: [...currentList.todoItems, item] })
      setItemName('')
    } catch {
      // API layer throws on failure
    } finally {
      setItemLoading(false)
    }
  }

  const handleToggleItem = async (item: TodoItem) => {
    try {
      const currentList = listRef.current
      const updated = await updateTodoItem(currentList.id, item.id, { done: !item.done })
      const updatedItems = currentList.todoItems.map(i => (i.id === item.id ? updated : i))
      const currentOrdered = computeDisplayOrder(updatedItems, currentList.id)
      const newOrdered = reorderOnToggle(currentOrdered, updated)
      saveStoredOrder(currentList.id, newOrdered.map(i => i.id))
      onUpdatedRef.current({ ...currentList, todoItems: updatedItems })
    } catch {
      // API layer throws on failure
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    try {
      const currentList = listRef.current
      await deleteTodoItem(currentList.id, itemId)
      removeItemFromOrder(currentList.id, itemId)
      onUpdatedRef.current({
        ...currentList,
        todoItems: currentList.todoItems.filter(i => i.id !== itemId),
      })
    } catch {
      // API layer throws on failure
    }
  }

  const handleDeleteList = async () => {
    try {
      const currentList = listRef.current
      await deleteTodoList(currentList.id)
      removeListOrder(currentList.id)
      onDeletedRef.current(currentList.id)
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
