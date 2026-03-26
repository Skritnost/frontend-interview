import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ArrowRight, Plus, Trash2, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import type { TodoList, TodoItem } from '../types/api'
import { createTodoList, updateTodoList } from '../api/todoLists'
import { saveStoredOrder, computeDisplayOrder, groupByStatus } from '../utils/itemOrder'
import { useTodoListActions } from '../hooks/useTodoListActions'
import ActionInput from './ActionInput'
import ChecklistItem from './ChecklistItem'
import Modal from './Modal'

// --- Sortable wrapper ---

function SortableChecklistItem({
  item,
  onToggle,
  onDelete,
  onUpdateName,
  dragActive,
}: {
  item: TodoItem
  onToggle: () => void
  onDelete: () => void
  onUpdateName: (name: string) => Promise<void>
  dragActive: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style: React.CSSProperties = dragActive
    ? {
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
      }
    : {}

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-hover transition-colors ${isDragging ? 'opacity-40' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none outline-none"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      <ChecklistItem item={item} onToggle={onToggle} onDelete={onDelete} onUpdateName={onUpdateName} />
    </li>
  )
}

// --- Modal ---

const EMPTY_LIST: TodoList = { id: 0, name: '', todoItems: [] }

interface Props {
  open: boolean
  onClose: () => void
  lists: TodoList[]
  list?: TodoList | null
  onCreated: (list: TodoList) => void
  onUpdated: (list: TodoList) => void
  onDeleted: (listId: number) => void
}

export default function TodoListModal({
  open,
  onClose,
  lists,
  list,
  onCreated,
  onUpdated,
  onDeleted,
}: Props) {
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [currentList, setCurrentList] = useState<TodoList | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [orderedItems, setOrderedItems] = useState<TodoItem[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const updateCurrentList = (updated: TodoList) => {
    setCurrentList(updated)
    setOrderedItems(computeDisplayOrder(updated.todoItems, updated.id))
    onUpdated(updated)
  }

  const actions = useTodoListActions({
    list: currentList ?? EMPTY_LIST,
    onUpdated: updateCurrentList,
    onDeleted: (listId) => {
      onDeleted(listId)
      setShowDeleteConfirm(false)
      onClose()
    },
  })

  useEffect(() => {
    if (open) {
      if (list) {
        setName(list.name)
        setCurrentList(list)
        setOrderedItems(computeDisplayOrder(list.todoItems, list.id))
      } else {
        setName('')
        setCurrentList(null)
        setOrderedItems([])
      }
      setNameError('')
      setNameLoading(false)
      setShowDeleteConfirm(false)
      actions.resetItemInput()
    }
  }, [open, list])

  const validateName = (value: string): string => {
    const trimmed = value.trim()
    if (!trimmed) return 'Name cannot be empty'
    const isDuplicate = lists.some(
      l =>
        l.name.toLowerCase() === trimmed.toLowerCase() &&
        l.id !== currentList?.id,
    )
    if (isDuplicate) return 'A list with this name already exists'
    return ''
  }

  const handleNameSubmit = async () => {
    const error = validateName(name)
    if (error) {
      setNameError(error)
      return
    }
    setNameError('')
    if (currentList && name.trim() === currentList.name) return
    setNameLoading(true)
    try {
      if (currentList) {
        const updated = await updateTodoList(currentList.id, {
          name: name.trim(),
        })
        const withItems = { ...updated, todoItems: currentList.todoItems }
        setCurrentList(withItems)
        onUpdated(withItems)
        toast.success('List name updated')
      } else {
        const created = await createTodoList({ name: name.trim() })
        setCurrentList(created)
        setOrderedItems([])
        onCreated(created)
      }
    } catch {
      setNameError('Something went wrong')
    } finally {
      setNameLoading(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
    const { active, over } = event
    if (!over || active.id === over.id || !currentList) return

    const oldIndex = orderedItems.findIndex(i => i.id === active.id)
    const newIndex = orderedItems.findIndex(i => i.id === over.id)
    const moved = arrayMove(orderedItems, oldIndex, newIndex)
    const newOrdered = groupByStatus(moved)

    setOrderedItems(newOrdered)
    saveStoredOrder(currentList.id, newOrdered.map(i => i.id))
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={currentList ? 'Edit List' : 'New List'}
        titleAction={
          currentList ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              title="Delete list"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : undefined
        }
      >
        <ActionInput
          value={name}
          onChange={v => {
            setName(v)
            setNameError('')
          }}
          onSubmit={handleNameSubmit}
          onBlur={() => {
            if (currentList && name.trim() !== currentList.name) {
              handleNameSubmit()
            }
          }}
          placeholder="Enter list name..."
          label="List Name"
          icon={<ArrowRight className="w-4 h-4" />}
          loading={nameLoading}
          error={nameError}
        />

        {currentList && (
          <div className="mt-6">
            <ActionInput
              value={actions.itemName}
              onChange={actions.setItemName}
              onSubmit={actions.handleAddItem}
              placeholder="Add your task..."
              label="Checklist Items"
              icon={<Plus className="w-4 h-4" />}
            />

            {orderedItems.length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setIsDragging(false)}
              >
                <SortableContext
                  items={orderedItems.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="mt-4 space-y-1 max-h-60 overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground [&::-webkit-scrollbar-track]:bg-transparent">
                    {orderedItems.map(item => (
                      <SortableChecklistItem
                        key={item.id}
                        item={item}
                        onToggle={() => actions.handleToggleItem(item)}
                        onDelete={() => actions.handleDeleteItem(item.id)}
                        onUpdateName={(name) => actions.handleUpdateItemName(item.id, name)}
                        dragActive={isDragging}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            disabled={!currentList}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-semibold cursor-pointer hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Done
          </button>
        </div>
      </Modal>

      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete List"
      >
        <p className="text-muted mb-6">
          Are you sure you want to delete{' '}
          <strong>{currentList?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-5 py-2 rounded-full border-2 border-border font-semibold cursor-pointer hover:bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={actions.handleDeleteList}
            className="px-5 py-2 bg-destructive text-white rounded-full font-semibold cursor-pointer hover:bg-destructive-hover transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  )
}
