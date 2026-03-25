import { useState } from 'react'
import type { TodoList } from '../types/api'
import { createTodoList } from '../api/todoLists'

interface Props {
  lists: TodoList[]
  onCreated: (list: TodoList) => void
}

export default function CreateTodoList({ lists, onCreated }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name cannot be empty')
      return
    }
    if (lists.some(l => l.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A list with this name already exists')
      return
    }
    setError('')
    const list = await createTodoList({ name: trimmed })
    onCreated(list)
    setName('')
  }

  return (
    <div className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="New list name..."
          className="max-w-100 flex-1 px-4 py-2 border-2 border-black rounded-full outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
        >
          Create List
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-1 ml-4">{error}</p>}
    </div>
  )
}
