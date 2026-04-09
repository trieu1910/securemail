import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordLock } from './PasswordLock'

describe('PasswordLock', () => {
  const user = userEvent.setup()

  function renderWithState(password = '', confirm = '') {
    const onPasswordChange = vi.fn()
    const onConfirmChange = vi.fn()
    const utils = render(
      <PasswordLock
        password={password}
        confirm={confirm}
        onPasswordChange={onPasswordChange}
        onConfirmChange={onConfirmChange}
      />
    )
    return { ...utils, onPasswordChange, onConfirmChange }
  }

  it('renders password and confirm inputs', () => {
    renderWithState()

    expect(screen.getByPlaceholderText('Min 8 characters')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Repeat password')).toBeInTheDocument()
  })

  it('renders password label and confirm label', () => {
    renderWithState()

    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByText('Confirm Password')).toBeInTheDocument()
  })

  it('shows "Too short" for password < 8 chars', () => {
    renderWithState('abc')

    expect(screen.getByText('Too short')).toBeInTheDocument()
  })

  it('shows "Weak" for password 8-11 chars', () => {
    renderWithState('abcdefgh')

    expect(screen.getByText('Weak')).toBeInTheDocument()
  })

  it('shows "Fair" for password >= 12 chars without uppercase or numbers', () => {
    renderWithState('abcdefghijkl')

    expect(screen.getByText('Fair')).toBeInTheDocument()
  })

  it('shows "Strong" for password >= 12 chars with uppercase and numbers', () => {
    renderWithState('Abcdefghijk1')

    expect(screen.getByText('Strong')).toBeInTheDocument()
  })

  it('does not show strength indicator when password is empty', () => {
    renderWithState('')

    expect(screen.queryByText('Too short')).not.toBeInTheDocument()
    expect(screen.queryByText('Weak')).not.toBeInTheDocument()
    expect(screen.queryByText('Fair')).not.toBeInTheDocument()
    expect(screen.queryByText('Strong')).not.toBeInTheDocument()
  })

  it('shows mismatch error when passwords do not match', () => {
    renderWithState('password123', 'different')

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
  })

  it('does not show mismatch error when confirm is empty', () => {
    renderWithState('password123', '')

    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument()
  })

  it('does not show mismatch error when passwords match', () => {
    renderWithState('password123', 'password123')

    expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument()
  })

  it('calls onPasswordChange when typing in password field', async () => {
    const { onPasswordChange } = renderWithState()

    const input = screen.getByPlaceholderText('Min 8 characters')
    await user.type(input, 'a')

    expect(onPasswordChange).toHaveBeenCalledWith('a')
  })

  it('calls onConfirmChange when typing in confirm field', async () => {
    const { onConfirmChange } = renderWithState()

    const input = screen.getByPlaceholderText('Repeat password')
    await user.type(input, 'x')

    expect(onConfirmChange).toHaveBeenCalledWith('x')
  })

  it('toggles password visibility with eye button', async () => {
    renderWithState('secret')

    const passwordInput = screen.getByPlaceholderText('Min 8 characters')
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleBtn = screen.getByLabelText('Show password')
    await user.click(toggleBtn)

    expect(passwordInput).toHaveAttribute('type', 'text')

    const hideBtn = screen.getByLabelText('Hide password')
    await user.click(hideBtn)

    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
