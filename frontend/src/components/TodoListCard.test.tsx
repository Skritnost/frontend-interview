import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TodoListCard from './TodoListCard'
import type { TodoList, TodoItem } from '../types/api'

vi.mock('../api/todoLists', () => ({
  addTodoItem: vi.fn(),
  updateTodoItem: vi.fn(),
  deleteTodoItem: vi.fn(),
  deleteTodoList: vi.fn(),
}))

vi.mock('../utils/itemOrder', () => ({
  computeDisplayOrder: vi.fn((items: TodoItem[]) => items),
  insertAtBoundary: vi.fn((items: TodoItem[]) => items),
  getStoredOrder: vi.fn(() => []),
  saveStoredOrder: vi.fn(),
  removeListOrder: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

function makeItems(count: number): TodoItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Task ${i + 1}`,
    done: false,
  }))
}

function makeList(overrides?: Partial<TodoList>): TodoList {
  return { id: 1, name: 'Shopping', todoItems: [], ...overrides }
}

function setup(listOverrides?: Partial<TodoList>) {
  const props = {
    list: makeList(listOverrides),
    onDeleted: vi.fn(),
    onUpdated: vi.fn(),
    onEdit: vi.fn(),
  }
  const user = userEvent.setup()
  const utils = render(<TodoListCard {...props} />)
  return { ...utils, props, user }
}

describe('TodoListCard', () => {
  // --- Header ---

  it('renders the list name in the card header', () => {
    setup()
    expect(screen.getByText('Shopping')).toBeInTheDocument()
  })

  it('calls onEdit when the edit (pencil) button is clicked', async () => {
    const { props, user } = setup()
    const editBtn = screen.getByTitle('Edit list')

    await user.click(editBtn)

    expect(props.onEdit).toHaveBeenCalledTimes(1)
  })

  // --- Empty state ---

  it('shows empty message when there are no items', () => {
    setup()
    expect(screen.getByText('No tasks have been entered yet')).toBeInTheDocument()
  })

  // --- Items ---

  it('renders items when present', () => {
    setup({ todoItems: makeItems(3) })

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 2')).toBeInTheDocument()
    expect(screen.getByText('Task 3')).toBeInTheDocument()
  })

  it('truncates to 5 visible items', () => {
    setup({ todoItems: makeItems(7) })

    // First 5 visible
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`Task ${i}`)).toBeInTheDocument()
    }
    // 6th and 7th are hidden
    expect(screen.queryByText('Task 6')).not.toBeInTheDocument()
    expect(screen.queryByText('Task 7')).not.toBeInTheDocument()
  })

  it('shows "See full checklist" when items exceed 5', () => {
    setup({ todoItems: makeItems(6) })
    expect(screen.getByText('See full checklist')).toBeInTheDocument()
  })

  it('does not show "See full checklist" for 5 or fewer items', () => {
    setup({ todoItems: makeItems(5) })
    expect(screen.queryByText('See full checklist')).not.toBeInTheDocument()
  })

  it('calls onEdit when "See full checklist" is clicked', async () => {
    const { props, user } = setup({ todoItems: makeItems(6) })

    await user.click(screen.getByText('See full checklist'))

    expect(props.onEdit).toHaveBeenCalledTimes(1)
  })

  // --- Add task input ---

  it('renders the add task input', () => {
    setup()
    expect(screen.getByPlaceholderText('Add your task...')).toBeInTheDocument()
  })
})
