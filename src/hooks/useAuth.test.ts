import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from './useAuth'
import { useMailStore } from '../store/mailStore'

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// Mock gmailService
vi.mock('../services/gmailService', () => ({
  gmailService: {
    getProfile: vi.fn(),
  },
}))

// Mock authService
vi.mock('../services/authService', () => ({
  authService: {
    logout: vi.fn(),
  },
}))

import { gmailService } from '../services/gmailService'
import { authService } from '../services/authService'

const wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(BrowserRouter, null, children)

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the store to default state
    useMailStore.setState({
      user: null,
      accessToken: null,
    })
  })

  it('fetches user profile on mount when token exists but no user', async () => {
    const mockUser = { id: '1', email: 'test@gmail.com', name: 'test', picture: '' }
    vi.mocked(gmailService.getProfile).mockResolvedValue(mockUser)
    useMailStore.setState({ accessToken: 'valid-token', user: null })

    renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(gmailService.getProfile).toHaveBeenCalledWith('valid-token')
    })

    // After the profile call resolves, user should be set in store
    await waitFor(() => {
      expect(useMailStore.getState().user).toEqual(mockUser)
    })
  })

  it('clears token and navigates to /login on invalid token', async () => {
    vi.mocked(gmailService.getProfile).mockRejectedValue(new Error('Invalid token'))
    useMailStore.setState({ accessToken: 'bad-token', user: null })

    renderHook(() => useAuth(), { wrapper })

    await waitFor(() => {
      expect(gmailService.getProfile).toHaveBeenCalledWith('bad-token')
    })

    await waitFor(() => {
      expect(useMailStore.getState().accessToken).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  it('does not fetch profile if user already exists', () => {
    const mockUser = { id: '1', email: 'test@gmail.com', name: 'test', picture: '' }
    useMailStore.setState({ accessToken: 'valid-token', user: mockUser })

    renderHook(() => useAuth(), { wrapper })

    expect(gmailService.getProfile).not.toHaveBeenCalled()
  })

  it('does not fetch profile if no access token', () => {
    useMailStore.setState({ accessToken: null, user: null })

    renderHook(() => useAuth(), { wrapper })

    expect(gmailService.getProfile).not.toHaveBeenCalled()
  })

  it('returns isAuthenticated true when token exists', () => {
    useMailStore.setState({ accessToken: 'some-token', user: null })

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(true)
  })

  it('returns isAuthenticated false when no token', () => {
    useMailStore.setState({ accessToken: null, user: null })

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('logout clears token, user, calls authService.logout, and navigates to /login', () => {
    const mockUser = { id: '1', email: 'test@gmail.com', name: 'test', picture: '' }
    useMailStore.setState({ accessToken: 'valid-token', user: mockUser })

    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(authService.logout).toHaveBeenCalled()
    expect(useMailStore.getState().accessToken).toBeNull()
    expect(useMailStore.getState().user).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })
})
