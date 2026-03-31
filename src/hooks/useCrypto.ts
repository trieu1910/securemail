import { useState } from 'react'
import { cryptoService } from '../services/cryptoService'
import { useMailStore } from '../store/mailStore'
import type { CryptoPayload } from '../types'

export function useCrypto() {
  const [isDecrypting, setIsDecrypting] = useState(false)
  const { setDecrypted, setDecryptError } = useMailStore()

  async function decryptMail(payload: CryptoPayload, password: string) {
    setIsDecrypting(true)
    setDecryptError(null)
    try {
      const { body } = await cryptoService.decrypt(payload, password)
      setDecrypted(body)
    } catch {
      setDecryptError('Wrong password or corrupted message.')
    } finally {
      setIsDecrypting(false)
    }
  }

  return { decryptMail, isDecrypting }
}
