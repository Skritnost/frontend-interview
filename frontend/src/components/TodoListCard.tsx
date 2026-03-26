import { Plus } from 'lucide-react'
import type { TodoList } from '../types/api'
import { computeDisplayOrder } from '../utils/itemOrder'
import { useTodoListActions } from '../hooks/useTodoListActions'
import ActionInput from './ActionInput'
import ChecklistItem from './ChecklistItem'

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
    itemLoading,
    handleAddItem,
    handleToggleItem,
    handleDeleteItem,
    handleDeleteList,
  } = useTodoListActions({ list, onUpdated, onDeleted })

  const orderedItems = computeDisplayOrder(list.todoItems, list.id)

  return (
    <div className="rounded-2xl border-2 border-black overflow-hidden">
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <button
          onClick={onEdit}
          className="text-lg font-bold flex-1 text-center hover:opacity-80 transition-opacity"
        >
          {list.name}
        </button>
        <button
          onClick={handleDeleteList}
          className="text-white hover:text-red-400 transition-colors ml-2"
          title="Delete list"
        >
          &#x2715;
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
            loading={itemLoading}
          />
        </div>

        {orderedItems.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No tasks have been entered yet</p>
        ) : (
          <ul className="space-y-1">
            {orderedItems.map(item => (
              <li key={item.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                <ChecklistItem
                  item={item}
                  onToggle={() => handleToggleItem(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
