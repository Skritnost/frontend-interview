import { useState, useEffect, useMemo } from 'react'
import { X, Search } from 'lucide-react'
import type { TodoList } from '../types/api'
import { getTodoLists } from '../api/todoLists'
import { useDebounce } from '../hooks/useDebounce'
import TodoListCard from '../components/TodoListCard'
import TodoListModal from '../components/TodoListModal'

export default function TodoListsPage() {
  const [lists, setLists] = useState<TodoList[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingList, setEditingList] = useState<TodoList | null>(null)

  useEffect(() => {
    getTodoLists().then(setLists).catch(() => {})
  }, [])

  const filteredLists = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase()
    if (!query) return lists
    return lists.filter(l => l.name.toLowerCase().includes(query))
  }, [lists, debouncedSearch])

  const handleCreated = (list: TodoList) => {
    setLists(prev => [...prev, list])
  }

  const handleDeleted = (listId: number) => {
    setLists(prev => prev.filter(l => l.id !== listId))
  }

  const handleUpdated = (updated: TodoList) => {
    setLists(prev => prev.map(l => (l.id === updated.id ? updated : l)))
  }

  const openCreateModal = () => {
    setEditingList(null)
    setModalOpen(true)
  }

  const openEditModal = (list: TodoList) => {
    setEditingList(list)
    setModalOpen(true)
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Todo Lists</h1>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 flex items-center border-2 border-black rounded-full px-4 py-2">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lists..."
            className="flex-1 outline-none bg-transparent text-sm ml-2"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="flex-shrink-0 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={openCreateModal}
          className="flex-shrink-0"
          title="Add list"
        >
          <img src="/icons/icon_add.svg" alt="Add list" className="w-10 h-10" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLists.map(list => (
          <TodoListCard
            key={list.id}
            list={list}
            onDeleted={handleDeleted}
            onUpdated={handleUpdated}
            onEdit={() => openEditModal(list)}
          />
        ))}
      </div>

      <TodoListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        lists={lists}
        list={editingList}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </>
  )
}
