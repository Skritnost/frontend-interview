import type { TodoItem } from '../types/api'

interface Props {
  item: TodoItem
  onToggle: () => void
  onDelete: () => void
}

export default function ChecklistItem({ item, onToggle, onDelete }: Props) {
  return (
    <>
      <button
        onClick={onToggle}
        className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
      >
        {item.done ? (
          <img src="/icons/icon_checked.svg" alt="Checked" className="w-5 h-5" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-black hover:border-gray-500 transition-colors" />
        )}
      </button>
      <span
        className={`flex-1 text-sm select-none ${
          item.done ? 'line-through text-gray-400' : ''
        }`}
      >
        {item.name}
      </span>
      <button
        onClick={onDelete}
        className="flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
      >
        <img src="/icons/icon_delete.svg" alt="Delete" className="w-4 h-4" />
      </button>
    </>
  )
}
