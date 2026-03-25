import { useState } from 'react'
import type { TodoList, TodoItem } from '../types/api'
import { addTodoItem, updateTodoItem, deleteTodoItem, deleteTodoList } from '../api/todoLists'

interface Props {
  list: TodoList
  onDeleted: (listId: number) => void
  onUpdated: (list: TodoList) => void
}

export default function TodoListCard({ list, onDeleted, onUpdated }: Props) {
  const [itemName, setItemName] = useState('')

  const handleAddItem = async () => {
    const trimmed = itemName.trim()
    if (!trimmed) return
    const item = await addTodoItem(list.id, { name: trimmed })
    onUpdated({ ...list, todoItems: [...list.todoItems, item] })
    setItemName('')
  }

  const handleToggleItem = async (item: TodoItem) => {
    const updated = await updateTodoItem(list.id, item.id, { done: !item.done })
    onUpdated({
      ...list,
      todoItems: list.todoItems.map(i => i.id === item.id ? updated : i),
    })
  }

  const handleDeleteItem = async (itemId: number) => {
    await deleteTodoItem(list.id, itemId)
    onUpdated({
      ...list,
      todoItems: list.todoItems.filter(i => i.id !== itemId),
    })
  }

  const handleDeleteList = async () => {
    await deleteTodoList(list.id)
    onDeleted(list.id)
  }

  return (
    <div className="rounded-2xl border-2 border-black overflow-hidden">
      {/* Header */}
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold flex-1 text-center">{list.name}</h2>
        <button
          onClick={handleDeleteList}
          className="text-white hover:text-red-400 transition-colors ml-2"
          title="Delete list"
        >
          &#x2715;
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Add item input */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 flex items-center border-2 border-black rounded-full px-4 py-2">
            <input
              type="text"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddItem()}
              placeholder="Add your task..."
              className="flex-1 outline-none bg-transparent"
            />
            <button onClick={handleAddItem} className="ml-2 flex-shrink-0">
              <img src="/icons/icon_add.svg" alt="Add" className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Items */}
        {list.todoItems.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No tasks have been entered yet</p>
        ) : (
          <ul className="space-y-2">
            {list.todoItems.map(item => (
              <li key={item.id} className="flex items-center gap-3 py-1">
                <button
                  onClick={() => handleToggleItem(item)}
                  className="flex-shrink-0"
                >
                  {item.done ? (
                    <img src="/icons/icon_checked.svg" alt="Checked" className="w-6 h-6" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-black" />
                  )}
                </button>
                <span className={`flex-1 ${item.done ? 'line-through text-gray-400' : ''}`}>
                  {item.name}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="flex-shrink-0"
                >
                  <img src="/icons/icon_delete.svg" alt="Delete" className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
