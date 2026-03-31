import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './authService'

// Mock window.location
const mockAssign = vi.fn()
Object.defineProperty(window, 'location', {
  value: { assign: mockAssign, href: '' },
  writable: true,
})

beforeEach(() => {
  mockAssign.mockClear()
  localStorage.clear()
  sessionStorage.clear()
})

describe('authService', () => {
  it('getToken returns null when localStorage is empty', () => {
    expect(authService.getToken()).toBeNull()
  })

  it('getToken returns stored token', () => {
    localStorage.setItem('sm_access_token', 'test-token')
    expect(authService.getToken()).toBe('test-token')
  })

  it('logout clears token from localStorage', () => {
    localStorage.setItem('sm_access_token', 'test-token')
    authService.logout()
    expect(localStorage.getItem('sm_access_token')).toBeNull()
  })

  it('login redirects to Google OAuth URL', async () => {
    await authService.login()
    expect(mockAssign).toHaveBeenCalledOnce()
    const url = mockAssign.mock.calls[0][0] as string
    expect(url).toContain('accounts.google.com')
    expect(url).toContain('code_challenge')
    expect(url).toContain('code_challenge_method=S256')
  })
})
