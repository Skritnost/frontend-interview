import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Search, Plus } from 'lucide-react'
import type { TodoList } from '../types/api'
import { getTodoLists } from '../api/todoLists'
import { useDebounce } from '../hooks/useDebounce'
import TodoListCard from '../components/TodoListCard'
import TodoListModal from '../components/TodoListModal'

export default function TodoListsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lists, setLists] = useState<TodoList[]>([])
  const [listsLoaded, setListsLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 200)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingList, setEditingList] = useState<TodoList | null>(null)

  useEffect(() => {
    getTodoLists()
      .then(data => {
        setLists(data)
        setListsLoaded(true)
      })
      .catch(() => setListsLoaded(true))
  }, [])

  // Sync URL :id param with modal state
  useEffect(() => {
    if (!listsLoaded) return
    if (id) {
      const list = lists.find(l => l.id === Number(id))
      if (list) {
        setEditingList(list)
        setModalOpen(true)
      } else {
        navigate('/todo-lists', { replace: true })
      }
    }
  }, [id, listsLoaded])

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
    navigate(`/todo-lists/${list.id}`)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingList(null)
    if (id) navigate('/todo-lists', { replace: true })
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-foreground mb-6">Todo Lists</h1>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center border-2 border-border rounded-full px-4 py-2 w-80 min-w-0 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow mr-auto">
          <Search className="w-4 h-4 text-muted-foreground" />
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
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={openCreateModal}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold cursor-pointer hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New List
        </button>
      </div>

      {listsLoaded && filteredLists.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            {lists.length === 0
              ? 'No todo lists yet. Create one to get started!'
              : 'No lists match your search.'}
          </p>
        </div>
      ) : (
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
      )}

      <TodoListModal
        open={modalOpen}
        onClose={closeModal}
        lists={lists}
        list={editingList}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    </>
  )
}
