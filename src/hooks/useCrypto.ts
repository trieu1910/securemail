import { useState } from 'react'
import { cryptoService } from '../services/cryptoService'
import { useMailStore } from '../store/mailStore'
import type { CryptoPayload } from '../types'

const MAX_ATTEMPTS = 5
const MAX_DELAY_MS = 30_000

export function useCrypto() {
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(0)
  const { setDecrypted, setDecryptError } = useMailStore()

  async function decryptMail(payload: CryptoPayload, password: string) {
    // Check if currently rate-limited
    const now = Date.now()
    if (lockedUntil > now) {
      const remainingSec = Math.ceil((lockedUntil - now) / 1000)
      setDecryptError(`Too many attempts. Try again in ${remainingSec}s.`)
      return
    }

    // Hard lock after max failures
    if (failedAttempts >= MAX_ATTEMPTS) {
      setDecryptError('Too many failed attempts. Please reload the page.')
      return
    }

    setIsDecrypting(true)
    setDecryptError(null)
    try {
      const result = await cryptoService.decrypt(payload, password)
      setDecrypted(result.body)
      // Reset rate-limit state on success
      setFailedAttempts(0)
      setLockedUntil(0)
    } catch {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)
      if (newAttempts < MAX_ATTEMPTS) {
        // Exponential backoff: 2s, 4s, 8s, 16s (capped at 30s)
        const delay = Math.min(Math.pow(2, newAttempts) * 1000, MAX_DELAY_MS)
        setLockedUntil(Date.now() + delay)
        setDecryptError(
          `Wrong password. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'} remaining.`,
        )
      } else {
        setDecryptError('Too many failed attempts. Please reload the page.')
      }
    } finally {
      setIsDecrypting(false)
    }
  }

  return { decryptMail, isDecrypting, failedAttempts, lockedUntil }
}
