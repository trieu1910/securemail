const STORAGE_KEY = 'sm_public_keys'

export interface SavedKey {
  email: string
  pem: string
  savedAt: string
}

export const keyStore = {
  getAll(): SavedKey[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  },

  save(email: string, pem: string): void {
    const keys = this.getAll().filter((k) => k.email !== email)
    keys.push({ email, pem, savedAt: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  },

  getByEmail(email: string): string | null {
    return this.getAll().find((k) => k.email === email)?.pem ?? null
  },

  delete(email: string): void {
    const keys = this.getAll().filter((k) => k.email !== email)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  },
}
