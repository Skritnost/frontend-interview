import { useState, useRef, useEffect } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import type { TodoItem } from '../types/api'

interface Props {
  item: TodoItem
  onToggle: () => void
  onDelete?: () => void
  onUpdateName?: (name: string) => Promise<void>
}

export default function ChecklistItem({ item, onToggle, onDelete, onUpdateName }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [optimisticName, setOptimisticName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const skipBlurRef = useRef(false)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  // Clear optimistic name once the prop catches up
  useEffect(() => {
    if (optimisticName !== null && item.name === optimisticName) {
      setOptimisticName(null)
    }
  }, [item.name, optimisticName])

  const enterEditMode = () => {
    if (!onUpdateName) return
    skipBlurRef.current = false
    setEditValue(optimisticName ?? item.name)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    skipBlurRef.current = true
    setIsEditing(false)
  }

  const saveEdit = async () => {
    if (skipBlurRef.current) return
    skipBlurRef.current = true
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === item.name || !onUpdateName) {
      setIsEditing(false)
      return
    }
    setOptimisticName(trimmed)
    setIsEditing(false)
    try {
      await onUpdateName(trimmed)
      toast.success('Item updated')
    } catch {
      setOptimisticName(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const doneClass = item.done ? 'line-through text-muted-foreground' : ''

  return (
    <>
      <button
        onClick={onToggle}
        className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
      >
        {item.done ? (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-border hover:border-muted transition-colors" />
        )}
      </button>
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveEdit}
          className={`flex-1 text-sm outline-none bg-transparent border-b border-muted-foreground focus:border-border py-0.5 ${doneClass}`}
        />
      ) : (
        <span
          onClick={enterEditMode}
          className={`flex-1 text-sm select-none ${onUpdateName ? 'cursor-text' : ''} ${doneClass}`}
        >
          {optimisticName ?? item.name}
        </span>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
        >
          <img src="/icons/icon_delete.svg" alt="Delete" className="w-4 h-4 dark:invert" />
        </button>
      )}
    </>
  )
}
