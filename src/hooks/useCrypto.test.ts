import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCrypto } from './useCrypto'
import { useMailStore } from '../store/mailStore'
import type { CryptoPayload } from '../types'

// Mock cryptoService
vi.mock('../services/cryptoService', () => ({
  cryptoService: {
    decrypt: vi.fn(),
  },
}))

import { cryptoService } from '../services/cryptoService'

const mockPayload: CryptoPayload = {
  version: '1.0',
  mode: 'password',
  subject: '',
  ciphertext: 'abc',
  iv: 'def',
  encryptedKey: 'ghi',
  salt: 'jkl',
}

describe('useCrypto', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useMailStore.setState({
      decryptedContent: null,
      decryptError: null,
    })
  })

  it('decryptMail with correct password sets decrypted content', async () => {
    vi.mocked(cryptoService.decrypt).mockResolvedValue({
      body: 'Hello world',
      subject: 'Test Subject',
    })

    const { result } = renderHook(() => useCrypto())

    await act(async () => {
      await result.current.decryptMail(mockPayload, 'correct-password')
    })

    expect(cryptoService.decrypt).toHaveBeenCalledWith(mockPayload, 'correct-password')
    expect(useMailStore.getState().decryptedContent).toBe('Hello world')
    expect(useMailStore.getState().decryptError).toBeNull()
    expect(result.current.failedAttempts).toBe(0)
  })

  it('decryptMail with wrong password sets error and increments failedAttempts', async () => {
    vi.mocked(cryptoService.decrypt).mockRejectedValue(new Error('Decrypt failed'))

    const { result } = renderHook(() => useCrypto())

    await act(async () => {
      await result.current.decryptMail(mockPayload, 'wrong-password')
    })

    expect(result.current.failedAttempts).toBe(1)
    expect(useMailStore.getState().decryptError).toContain('Wrong password')
    expect(useMailStore.getState().decryptError).toContain('4 attempts remaining')
  })

  it('rate limiting: calling again too quickly shows "Too many attempts"', async () => {
    vi.mocked(cryptoService.decrypt).mockRejectedValue(new Error('Decrypt failed'))

    const { result } = renderHook(() => useCrypto())

    // First failed attempt - sets a lockout delay
    await act(async () => {
      await result.current.decryptMail(mockPayload, 'wrong-password')
    })

    expect(result.current.failedAttempts).toBe(1)
    expect(result.current.lockedUntil).toBeGreaterThan(0)

    // Immediate second attempt - should be rate limited
    await act(async () => {
      await result.current.decryptMail(mockPayload, 'another-wrong')
    })

    // cryptoService.decrypt should only have been called once (the first attempt)
    expect(cryptoService.decrypt).toHaveBeenCalledTimes(1)
    expect(useMailStore.getState().decryptError).toContain('Too many attempts')
  })

  it('after 5 failures, locks out with reload message', async () => {
    vi.mocked(cryptoService.decrypt).mockRejectedValue(new Error('Decrypt failed'))

    const { result } = renderHook(() => useCrypto())

    // We need to allow time to pass between attempts for rate limiting.
    // We'll mock Date.now to bypass rate limits between each attempt.
    const originalDateNow = Date.now
    let currentTime = originalDateNow()

    vi.spyOn(Date, 'now').mockImplementation(() => currentTime)

    for (let i = 0; i < 5; i++) {
      // Move time forward enough to bypass any rate limit
      currentTime += 60_000
      await act(async () => {
        await result.current.decryptMail(mockPayload, 'wrong-password')
      })
    }

    expect(result.current.failedAttempts).toBe(5)
    expect(useMailStore.getState().decryptError).toBe(
      'Too many failed attempts. Please reload the page.'
    )

    // 6th attempt should also be blocked
    currentTime += 60_000
    await act(async () => {
      await result.current.decryptMail(mockPayload, 'any-password')
    })

    expect(useMailStore.getState().decryptError).toBe(
      'Too many failed attempts. Please reload the page.'
    )

    vi.spyOn(Date, 'now').mockRestore()
  })

  it('successful decrypt resets failedAttempts', async () => {
    vi.mocked(cryptoService.decrypt)
      .mockRejectedValueOnce(new Error('Decrypt failed'))
      .mockResolvedValueOnce({ body: 'Success', subject: 'Sub' })

    const { result } = renderHook(() => useCrypto())

    const originalDateNow = Date.now
    let currentTime = originalDateNow()
    vi.spyOn(Date, 'now').mockImplementation(() => currentTime)

    // First attempt fails
    await act(async () => {
      await result.current.decryptMail(mockPayload, 'wrong')
    })
    expect(result.current.failedAttempts).toBe(1)

    // Move time forward to bypass rate limit
    currentTime += 60_000

    // Second attempt succeeds
    await act(async () => {
      await result.current.decryptMail(mockPayload, 'correct')
    })
    expect(result.current.failedAttempts).toBe(0)
    expect(useMailStore.getState().decryptedContent).toBe('Success')

    vi.spyOn(Date, 'now').mockRestore()
  })

  it('isDecrypting is true while decrypt is in progress', async () => {
    let resolveDecrypt: (value: { body: string; subject: string }) => void
    vi.mocked(cryptoService.decrypt).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDecrypt = resolve
        })
    )

    const { result } = renderHook(() => useCrypto())

    let decryptPromise: Promise<void>
    act(() => {
      decryptPromise = result.current.decryptMail(mockPayload, 'password')
    })

    // isDecrypting should be true while waiting
    expect(result.current.isDecrypting).toBe(true)

    // Resolve the decrypt
    await act(async () => {
      resolveDecrypt!({ body: 'Done', subject: 'Sub' })
      await decryptPromise!
    })

    expect(result.current.isDecrypting).toBe(false)
  })
})
