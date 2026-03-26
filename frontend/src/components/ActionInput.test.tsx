import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import ActionInput from './ActionInput'

function setup(overrides = {}) {
  const props = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    icon: <span data-testid="icon">+</span>,
    ...overrides,
  }
  const user = userEvent.setup()
  const utils = render(<ActionInput {...props} />)
  return { ...utils, props, user }
}

describe('ActionInput', () => {
  it('renders the input with placeholder', () => {
    setup({ placeholder: 'Add task...' })
    expect(screen.getByPlaceholderText('Add task...')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    setup({ label: 'List Name' })
    expect(screen.getByText('List Name')).toBeInTheDocument()
  })

  it('does not render label when omitted', () => {
    const { container } = setup()
    expect(container.querySelector('label')).not.toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const { props, user } = setup()
    const input = screen.getByRole('textbox')

    await user.type(input, 'a')

    expect(props.onChange).toHaveBeenCalledWith('a')
  })

  it('calls onSubmit when Enter is pressed', async () => {
    const { props, user } = setup({ value: 'task' })
    const input = screen.getByRole('textbox')

    await user.type(input, '{Enter}')

    expect(props.onSubmit).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit when the action button is clicked', async () => {
    const { props, user } = setup({ value: 'task' })
    const button = screen.getByRole('button')

    await user.click(button)

    expect(props.onSubmit).toHaveBeenCalledTimes(1)
  })

  it('does not call onSubmit on Enter when disabled', async () => {
    const { props, user } = setup({ value: 'task', disabled: true })
    const input = screen.getByRole('textbox')

    await user.type(input, '{Enter}')

    expect(props.onSubmit).not.toHaveBeenCalled()
  })

  it('does not call onSubmit on Enter when loading', async () => {
    const { props, user } = setup({ value: 'task', loading: true })
    const input = screen.getByRole('textbox')

    await user.type(input, '{Enter}')

    expect(props.onSubmit).not.toHaveBeenCalled()
  })

  it('disables button when loading', () => {
    setup({ loading: true })
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows error message when provided', () => {
    setup({ error: 'Name is required' })
    expect(screen.getByText('Name is required')).toBeInTheDocument()
  })

  it('does not render error when not provided', () => {
    const { container } = setup()
    expect(container.querySelector('p')).not.toBeInTheDocument()
  })

  it('renders the icon inside the button', () => {
    setup()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
