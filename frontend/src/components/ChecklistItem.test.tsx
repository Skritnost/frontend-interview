import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ChecklistItem from './ChecklistItem'
import type { TodoItem } from '../types/api'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

function makeItem(overrides?: Partial<TodoItem>): TodoItem {
  return { id: 1, name: 'Buy milk', done: false, ...overrides }
}

function setup(overrides = {}) {
  const props = {
    item: makeItem(),
    onToggle: vi.fn(),
    ...overrides,
  }
  const user = userEvent.setup()
  // Wrap in a <ul><li> to provide valid DOM nesting for the fragment
  const utils = render(
    <ul>
      <li style={{ display: 'flex' }}>
        <ChecklistItem {...props} />
      </li>
    </ul>,
  )
  return { ...utils, props, user }
}

describe('ChecklistItem', () => {
  // --- Display ---

  it('renders item name', () => {
    setup()
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('shows filled circle when done', () => {
    const { container } = setup({ item: makeItem({ done: true }) })
    // The done state renders a filled circle with a Check icon inside
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies line-through styling when done', () => {
    setup({ item: makeItem({ done: true }) })
    const span = screen.getByText('Buy milk')
    expect(span.className).toContain('line-through')
  })

  // --- Toggle ---

  it('calls onToggle when checkbox button is clicked', async () => {
    const { props, user } = setup()
    // The toggle button is the first button in the component
    const buttons = screen.getAllByRole('button')
    await user.click(buttons[0])
    expect(props.onToggle).toHaveBeenCalledTimes(1)
  })

  // --- Delete ---

  it('renders delete button when onDelete is provided', () => {
    setup({ onDelete: vi.fn() })
    expect(screen.getByAltText('Delete')).toBeInTheDocument()
  })

  it('does not render delete button when onDelete is omitted', () => {
    setup()
    expect(screen.queryByAltText('Delete')).not.toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const { user } = setup({ onDelete })

    await user.click(screen.getByAltText('Delete'))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  // --- Inline editing ---

  it('does not enter edit mode if onUpdateName is not provided', async () => {
    const { user } = setup()

    await user.click(screen.getByText('Buy milk'))

    // Should still show text, not an input
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('enters edit mode on click when onUpdateName is provided', async () => {
    const onUpdateName = vi.fn().mockResolvedValue(undefined)
    const { user } = setup({ onUpdateName })

    await user.click(screen.getByText('Buy milk'))

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Buy milk')
  })

  it('saves on Enter and calls onUpdateName with trimmed value', async () => {
    const onUpdateName = vi.fn().mockResolvedValue(undefined)
    const { user } = setup({ onUpdateName })

    await user.click(screen.getByText('Buy milk'))
    const input = screen.getByRole('textbox')

    await user.clear(input)
    await user.type(input, '  Buy eggs  {Enter}')

    expect(onUpdateName).toHaveBeenCalledWith('Buy eggs')
  })

  it('cancels edit on Escape without calling onUpdateName', async () => {
    const onUpdateName = vi.fn().mockResolvedValue(undefined)
    const { user } = setup({ onUpdateName })

    await user.click(screen.getByText('Buy milk'))
    const input = screen.getByRole('textbox')

    await user.clear(input)
    await user.type(input, 'Changed{Escape}')

    expect(onUpdateName).not.toHaveBeenCalled()
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
  })

  it('does not save if value is unchanged', async () => {
    const onUpdateName = vi.fn().mockResolvedValue(undefined)
    const { user } = setup({ onUpdateName })

    await user.click(screen.getByText('Buy milk'))

    await user.keyboard('{Enter}')

    expect(onUpdateName).not.toHaveBeenCalled()
  })

  it('shows optimistic name immediately after save', async () => {
    // onUpdateName that never resolves (simulates slow API)
    const onUpdateName = vi.fn().mockReturnValue(new Promise(() => {}))
    const { user } = setup({ onUpdateName })

    await user.click(screen.getByText('Buy milk'))
    const input = screen.getByRole('textbox')

    await user.clear(input)
    await user.type(input, 'Buy eggs{Enter}')

    // Should show optimistic name while API is pending
    await waitFor(() => {
      expect(screen.getByText('Buy eggs')).toBeInTheDocument()
    })
  })

  it('reverts optimistic name on API failure', async () => {
    const onUpdateName = vi.fn().mockRejectedValue(new Error('fail'))
    const { user } = setup({ onUpdateName })

    await user.click(screen.getByText('Buy milk'))
    const input = screen.getByRole('textbox')

    await user.clear(input)
    await user.type(input, 'Buy eggs{Enter}')

    // After rejection, optimistic name is cleared and original shows
    await waitFor(() => {
      expect(screen.getByText('Buy milk')).toBeInTheDocument()
    })
  })
})
