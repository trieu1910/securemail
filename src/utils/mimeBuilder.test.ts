import { describe, it, expect } from 'vitest'
import { buildMimeMessage } from './mimeBuilder'
import { fromBase64url } from './base64'
import type { CryptoPayload } from '../types'

const mockPayload: CryptoPayload = {
  version: '1.0',
  mode: 'password',
  subject: 'enc-subject',
  ciphertext: 'abc123',
  iv: 'iv123',
  encryptedKey: 'key123',
  salt: 'salt123',
}

describe('mimeBuilder', () => {
  it('returns a base64url-encoded string', () => {
    const raw = buildMimeMessage('sender@gmail.com', 'to@gmail.com', mockPayload)
    expect(typeof raw).toBe('string')
    expect(raw).not.toMatch(/[+/=]/)
  })

  it('decoded MIME contains required headers', () => {
    const raw = buildMimeMessage('sender@gmail.com', 'to@gmail.com', mockPayload)
    // Use fromBase64url (consistent with our base64.ts, not atob)
    const decoded = new TextDecoder().decode(fromBase64url(raw))
    expect(decoded).toContain('From: sender@gmail.com')
    expect(decoded).toContain('To: to@gmail.com')
    expect(decoded).toContain('Subject: [SecureMail] encrypted message')
    expect(decoded).toContain('X-Encrypted: true')
    expect(decoded).toContain('X-SecureMail-Version: 1.0')
  })

  it('decoded MIME body contains JSON payload', () => {
    const raw = buildMimeMessage('sender@gmail.com', 'to@gmail.com', mockPayload)
    const decoded = new TextDecoder().decode(fromBase64url(raw))
    expect(decoded).toContain('"version":"1.0"')
    expect(decoded).toContain('"mode":"password"')
  })
})
