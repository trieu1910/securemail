import { describe, it, expect, beforeEach } from 'vitest'
import { keyStore } from './keyStore'

// Use real localStorage from jsdom — cleared each test
beforeEach(() => {
  localStorage.clear()
})

describe('keyStore — public key management', () => {
  it('getAll returns empty array when nothing is stored', () => {
    expect(keyStore.getAll()).toEqual([])
  })

  it('save + getAll round trip', () => {
    keyStore.save('alice@example.com', 'rsa-pub-key-base64', 'rsa')
    const keys = keyStore.getAll()
    expect(keys.length).toBe(1)
    expect(keys[0].email).toBe('alice@example.com')
    expect(keys[0].pem).toBe('rsa-pub-key-base64')
    expect(keys[0].keyType).toBe('rsa')
    expect(keys[0].savedAt).toBeTruthy()
  })

  it('save with same email+keyType overwrites existing entry', () => {
    keyStore.save('bob@example.com', 'old-key', 'rsa')
    keyStore.save('bob@example.com', 'new-key', 'rsa')
    const keys = keyStore.getAll()
    expect(keys.length).toBe(1)
    expect(keys[0].pem).toBe('new-key')
  })

  it('save with same email but different keyType creates separate entries', () => {
    keyStore.save('carol@example.com', 'rsa-key', 'rsa')
    keyStore.save('carol@example.com', 'ecdsa-key', 'ecdsa')
    const keys = keyStore.getAll()
    expect(keys.length).toBe(2)
    expect(keys.find(k => k.keyType === 'rsa')?.pem).toBe('rsa-key')
    expect(keys.find(k => k.keyType === 'ecdsa')?.pem).toBe('ecdsa-key')
  })

  it('getByEmail returns correct key', () => {
    keyStore.save('dave@example.com', 'dave-rsa-key', 'rsa')
    expect(keyStore.getByEmail('dave@example.com', 'rsa')).toBe('dave-rsa-key')
  })

  it('getByEmail returns null for unknown email', () => {
    expect(keyStore.getByEmail('unknown@example.com', 'rsa')).toBeNull()
  })

  it('getByEmail defaults keyType to rsa', () => {
    keyStore.save('eve@example.com', 'eve-key', 'rsa')
    expect(keyStore.getByEmail('eve@example.com')).toBe('eve-key')
  })

  it('delete removes specific key (no keyType removes all for email)', () => {
    keyStore.save('frank@example.com', 'rsa-key', 'rsa')
    keyStore.save('frank@example.com', 'ecdsa-key', 'ecdsa')
    keyStore.delete('frank@example.com')
    expect(keyStore.getAll().length).toBe(0)
  })

  it('delete with keyType removes only that type', () => {
    keyStore.save('grace@example.com', 'rsa-key', 'rsa')
    keyStore.save('grace@example.com', 'ecdsa-key', 'ecdsa')
    keyStore.delete('grace@example.com', 'rsa')
    const keys = keyStore.getAll()
    expect(keys.length).toBe(1)
    expect(keys[0].keyType).toBe('ecdsa')
  })

  it('migration: old entries without keyType get rsa default', () => {
    // Simulate old format (no keyType field)
    const oldData = [
      { email: 'old@example.com', pem: 'old-key', savedAt: '2024-01-01T00:00:00Z' }
    ]
    localStorage.setItem('sm_public_keys', JSON.stringify(oldData))
    const keys = keyStore.getAll()
    expect(keys.length).toBe(1)
    expect(keys[0].keyType).toBe('rsa') // migrated default
  })

  it('getAll handles corrupt localStorage gracefully', () => {
    localStorage.setItem('sm_public_keys', 'not-valid-json{{{')
    expect(keyStore.getAll()).toEqual([])
  })
})

describe('keyStore — own keys', () => {
  it('getOwnKeys returns empty object initially', () => {
    expect(keyStore.getOwnKeys()).toEqual({})
  })

  it('saveOwnKeys + getOwnKeys round trip', () => {
    const ownKeys = {
      rsaPublicKey: 'rsa-pub',
      rsaPrivateKey: 'rsa-priv',
      ecdsaPublicKey: 'ecdsa-pub',
      ecdsaPrivateKey: 'ecdsa-priv',
      generatedAt: '2024-06-01T00:00:00Z',
    }
    keyStore.saveOwnKeys(ownKeys)
    const retrieved = keyStore.getOwnKeys()
    expect(retrieved).toEqual(ownKeys)
  })

  it('clearOwnKeys removes own key data', () => {
    keyStore.saveOwnKeys({ rsaPublicKey: 'test-key' })
    keyStore.clearOwnKeys()
    expect(keyStore.getOwnKeys()).toEqual({})
  })

  it('getOwnKeys handles corrupt localStorage gracefully', () => {
    localStorage.setItem('sm_own_keys', '!!!bad-json')
    expect(keyStore.getOwnKeys()).toEqual({})
  })
})

describe('keyStore — fingerprint', () => {
  it('getFingerprint returns colon-separated hex string', async () => {
    // Use a known base64url value (the actual bytes don't matter, just format)
    const testKeyB64 = 'AQIDBA' // base64url of [1, 2, 3, 4]
    const fingerprint = await keyStore.getFingerprint(testKeyB64)
    // Should be 8 hex pairs separated by colons
    const parts = fingerprint.split(':')
    expect(parts.length).toBe(8)
    parts.forEach(part => {
      expect(part).toMatch(/^[0-9a-f]{2}$/)
    })
  })

  it('getFingerprint returns consistent result for same input', async () => {
    const key = 'AQIDBAUG'
    const fp1 = await keyStore.getFingerprint(key)
    const fp2 = await keyStore.getFingerprint(key)
    expect(fp1).toBe(fp2)
  })

  it('getFingerprint returns different results for different inputs', async () => {
    const fp1 = await keyStore.getFingerprint('AQIDBA')
    const fp2 = await keyStore.getFingerprint('BQYHCAkK')
    expect(fp1).not.toBe(fp2)
  })
})
