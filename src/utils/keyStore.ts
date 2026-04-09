import { base64urlToArrayBuffer } from './base64'

const STORAGE_KEY = 'sm_public_keys'
const OWN_KEYS_KEY = 'sm_own_keys'

export interface SavedKey {
  email: string
  pem: string
  keyType: 'rsa' | 'ecdsa'
  savedAt: string
}

export interface OwnKeys {
  rsaPublicKey?: string
  rsaPrivateKey?: string
  ecdsaPublicKey?: string
  ecdsaPrivateKey?: string
  generatedAt?: string
}

export const keyStore = {
  getAll(): SavedKey[] {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SavedKey[]
      // Migrate old entries that lack keyType — default to 'rsa'
      return raw.map((k) => ({ ...k, keyType: k.keyType ?? 'rsa' }))
    } catch {
      return []
    }
  },

  save(email: string, pem: string, keyType: 'rsa' | 'ecdsa' = 'rsa'): void {
    const keys = this.getAll().filter(
      (k) => !(k.email === email && k.keyType === keyType)
    )
    keys.push({ email, pem, keyType, savedAt: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  },

  getByEmail(email: string, keyType: 'rsa' | 'ecdsa' = 'rsa'): string | null {
    return (
      this.getAll().find((k) => k.email === email && k.keyType === keyType)
        ?.pem ?? null
    )
  },

  delete(email: string, keyType?: 'rsa' | 'ecdsa'): void {
    const keys = this.getAll().filter((k) => {
      if (keyType) return !(k.email === email && k.keyType === keyType)
      return k.email !== email
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  },

  getOwnKeys(): OwnKeys {
    try {
      return JSON.parse(localStorage.getItem(OWN_KEYS_KEY) ?? '{}')
    } catch {
      return {}
    }
  },

  saveOwnKeys(keys: OwnKeys): void {
    localStorage.setItem(OWN_KEYS_KEY, JSON.stringify(keys))
  },

  clearOwnKeys(): void {
    localStorage.removeItem(OWN_KEYS_KEY)
  },

  /** SHA-256 fingerprint of raw public key bytes (first 8 bytes, colon-separated hex) */
  async getFingerprint(publicKeyB64: string): Promise<string> {
    const keyBytes = base64urlToArrayBuffer(publicKeyB64)
    const hash = await crypto.subtle.digest('SHA-256', keyBytes)
    return Array.from(new Uint8Array(hash).slice(0, 8))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(':')
  },
}
