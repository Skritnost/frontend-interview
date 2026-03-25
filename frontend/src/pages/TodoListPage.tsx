import { useState, useEffect } from 'react'
import type { TodoList } from '../types/api'
import { getTodoLists } from '../api/todoLists'
import CreateTodoList from '../components/CreateTodoList'
import TodoListCard from '../components/TodoListCard'

export default function TodoListPage() {
  const [lists, setLists] = useState<TodoList[]>([])

  useEffect(() => {
    getTodoLists().then(setLists)
  }, [])

  const handleCreated = (list: TodoList) => {
    setLists(prev => [...prev, list])
  }

  const handleDeleted = (listId: number) => {
    setLists(prev => prev.filter(l => l.id !== listId))
  }

  const handleUpdated = (updated: TodoList) => {
    setLists(prev => prev.map(l => l.id === updated.id ? updated : l))
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Todo Lists</h1>
      <CreateTodoList lists={lists} onCreated={handleCreated} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lists.map(list => (
          <TodoListCard
            key={list.id}
            list={list}
            onDeleted={handleDeleted}
            onUpdated={handleUpdated}
          />
        ))}
      </div>
    </>
  )
}
