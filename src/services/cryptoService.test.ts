import { describe, it, expect } from 'vitest'
import { cryptoService } from './cryptoService'

describe('cryptoService — password mode', () => {
  it('encrypt returns a valid CryptoPayload with mode=password', async () => {
    const payload = await cryptoService.encrypt('Hello, World!', 'strongpassword', 'My Subject')
    expect(payload.version).toBe('1.0')
    expect(payload.mode).toBe('password')
    expect(payload.ciphertext).toBeTruthy()
    expect(payload.iv).toBeTruthy()
    expect(payload.encryptedKey).toBeTruthy()
    expect(payload.salt).toBeTruthy()
    // subject field in payload is empty — real subject is encrypted inside ciphertext
    expect(payload.subject).toBe('')  // empty by design
  })

  it('encrypt then decrypt with correct password returns original plaintext and subject', async () => {
    const original = 'Secret message 🔒'
    const subject = 'Top Secret Subject'
    const password = 'my-strong-password-123'
    const payload = await cryptoService.encrypt(original, password, subject)
    const { body, subject: decryptedSubject } = await cryptoService.decrypt(payload, password)
    expect(body).toBe(original)
    expect(decryptedSubject).toBe(subject)
  })

  it('decrypt with wrong password throws', async () => {
    const payload = await cryptoService.encrypt('Secret', 'correctpassword')
    await expect(cryptoService.decrypt(payload, 'wrongpassword')).rejects.toThrow()
  })

  it('each encryption produces different ciphertext (random IV)', async () => {
    const p1 = await cryptoService.encrypt('Same message', 'password')
    const p2 = await cryptoService.encrypt('Same message', 'password')
    expect(p1.iv).not.toBe(p2.iv)
    expect(p1.ciphertext).not.toBe(p2.ciphertext)
  })

  it('isEncryptedMail detects valid payload', async () => {
    const payload = await cryptoService.encrypt('test', 'pw')
    const json = JSON.stringify(payload)
    expect(cryptoService.isEncryptedMail(json)).toBe(true)
    expect(cryptoService.isEncryptedMail('plain email body')).toBe(false)
    expect(cryptoService.isEncryptedMail('')).toBe(false)
  })
})
