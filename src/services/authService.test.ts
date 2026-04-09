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

  it('handleCallback exchanges code for token and stores it', async () => {
    // Set code verifier in sessionStorage (simulates login flow)
    sessionStorage.setItem('sm_code_verifier', 'test-verifier-abc')

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'new-access-token-123' }),
    } as Response)

    const token = await authService.handleCallback('auth-code-xyz')

    expect(token).toBe('new-access-token-123')
    expect(localStorage.getItem('sm_access_token')).toBe('new-access-token-123')
    // Code verifier should be removed after callback
    expect(sessionStorage.getItem('sm_code_verifier')).toBeNull()
  })

  it('handleCallback throws when no code verifier is stored', async () => {
    // sessionStorage is cleared in beforeEach — no verifier
    await expect(authService.handleCallback('auth-code-xyz')).rejects.toThrow('No code verifier found')
  })

  it('handleCallback throws when token exchange fails', async () => {
    sessionStorage.setItem('sm_code_verifier', 'test-verifier-abc')

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'invalid_grant' }),
    } as Response)

    await expect(authService.handleCallback('bad-code')).rejects.toThrow('Token exchange failed')
  })

  it('getUser fetches user profile from Google API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'user-id-123',
        email: 'alice@gmail.com',
        name: 'Alice Nguyen',
        picture: 'https://photo.url/alice.jpg',
      }),
    } as Response)

    const user = await authService.getUser('valid-token')
    expect(user.id).toBe('user-id-123')
    expect(user.email).toBe('alice@gmail.com')
    expect(user.name).toBe('Alice Nguyen')
    expect(user.picture).toBe('https://photo.url/alice.jpg')
  })

  it('getUser throws when profile fetch fails (expired token)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'invalid_token' }),
    } as Response)

    await expect(authService.getUser('expired-token')).rejects.toThrow('Failed to fetch user profile')
  })

  it('login stores code verifier in sessionStorage', async () => {
    await authService.login()
    const verifier = sessionStorage.getItem('sm_code_verifier')
    expect(verifier).toBeTruthy()
    expect(verifier!.length).toBeGreaterThan(10)
  })
})
