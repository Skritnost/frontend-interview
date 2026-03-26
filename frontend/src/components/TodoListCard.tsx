import { Plus, Pencil } from 'lucide-react'
import type { TodoList } from '../types/api'
import { computeDisplayOrder } from '../utils/itemOrder'
import { useTodoListActions } from '../hooks/useTodoListActions'
import ActionInput from './ActionInput'
import ChecklistItem from './ChecklistItem'

const MAX_VISIBLE_ITEMS = 5

interface Props {
  list: TodoList
  onDeleted: (listId: number) => void
  onUpdated: (list: TodoList) => void
  onEdit: () => void
}

export default function TodoListCard({ list, onDeleted, onUpdated, onEdit }: Props) {
  const {
    itemName,
    setItemName,
    handleAddItem,
    handleToggleItem,
    handleUpdateItemName,
  } = useTodoListActions({ list, onUpdated, onDeleted })

  const orderedItems = computeDisplayOrder(list.todoItems, list.id)
  const visibleItems = orderedItems.slice(0, MAX_VISIBLE_ITEMS)
  const hasMore = orderedItems.length > MAX_VISIBLE_ITEMS

  return (
    <div className="rounded-2xl border-2 border-border overflow-hidden bg-card">
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-bold flex-1 text-center">
          {list.name}
        </span>
        <button
          onClick={onEdit}
          className="text-primary-foreground hover:opacity-70 transition-opacity ml-2 cursor-pointer"
          title="Edit list"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <ActionInput
            value={itemName}
            onChange={setItemName}
            onSubmit={handleAddItem}
            placeholder="Add your task..."
            icon={<Plus className="w-4 h-4" />}
          />
        </div>

        {orderedItems.length === 0 ? (
          <p className="text-center text-muted py-4">No tasks have been entered yet</p>
        ) : (
          <>
            <ul className="space-y-1">
              {visibleItems.map(item => (
                <li key={item.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-hover transition-colors">
                  <ChecklistItem
                    item={item}
                    onToggle={() => handleToggleItem(item)}
                    onUpdateName={(name) => handleUpdateItemName(item.id, name)}
                  />
                </li>
              ))}
            </ul>
            {hasMore && (
              <button
                onClick={onEdit}
                className="mt-2 w-full text-center text-sm text-muted hover:text-foreground transition-colors cursor-pointer py-1"
              >
                See full checklist
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
