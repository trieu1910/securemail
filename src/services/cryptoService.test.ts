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

// ─── RSA-OAEP Asymmetric Encryption ───────────────────────────────

describe('cryptoService — RSA-OAEP mode', { timeout: 30000 }, () => {
  it('generateRSAKeyPair returns valid public and private keys', async () => {
    const keyPair = await cryptoService.generateRSAKeyPair()
    expect(keyPair.publicKey).toBeTruthy()
    expect(keyPair.privateKey).toBeTruthy()
    // Keys should be different strings
    expect(keyPair.publicKey).not.toBe(keyPair.privateKey)
    // Both should be non-empty base64url strings
    expect(keyPair.publicKey.length).toBeGreaterThan(100)
    expect(keyPair.privateKey.length).toBeGreaterThan(100)
  })

  it('encryptRSA + decryptRSA round trip recovers original plaintext and subject', { timeout: 30000 }, async () => {
    const keyPair = await cryptoService.generateRSAKeyPair()
    const original = 'Top secret RSA message 🔐'
    const subject = 'RSA Encrypted Subject'

    const payload = await cryptoService.encryptRSA(
      original,
      keyPair.publicKey,
      subject,
      [],
      'alice@example.com'
    )

    expect(payload.version).toBe('1.0')
    expect(payload.mode).toBe('rsa')
    expect(payload.subject).toBe('')
    expect(payload.ciphertext).toBeTruthy()
    expect(payload.iv).toBeTruthy()
    expect(payload.encryptedKey).toBeTruthy()
    expect(payload.encryptedKeys).toBeDefined()
    expect(payload.encryptedKeys!['alice@example.com']).toBe(payload.encryptedKey)
    // No salt in RSA mode
    expect(payload.salt).toBeUndefined()

    const { body, subject: decryptedSubject } = await cryptoService.decryptRSA(
      payload,
      keyPair.privateKey
    )
    expect(body).toBe(original)
    expect(decryptedSubject).toBe(subject)
  })

  it('decryptRSA with wrong private key throws', async () => {
    const senderKeys = await cryptoService.generateRSAKeyPair()
    const wrongKeys = await cryptoService.generateRSAKeyPair()

    const payload = await cryptoService.encryptRSA(
      'Secret message',
      senderKeys.publicKey,
      'Subject',
      [],
      'bob@example.com'
    )

    await expect(
      cryptoService.decryptRSA(payload, wrongKeys.privateKey)
    ).rejects.toThrow()
  }, 15_000)

  it('encryptRSA produces different ciphertext each time (random IV)', async () => {
    const keyPair = await cryptoService.generateRSAKeyPair()
    const p1 = await cryptoService.encryptRSA('Same message', keyPair.publicKey)
    const p2 = await cryptoService.encryptRSA('Same message', keyPair.publicKey)
    expect(p1.iv).not.toBe(p2.iv)
    expect(p1.ciphertext).not.toBe(p2.ciphertext)
  })

  it('isEncryptedMail detects RSA mode payload', async () => {
    const keyPair = await cryptoService.generateRSAKeyPair()
    const payload = await cryptoService.encryptRSA('test', keyPair.publicKey)
    const json = JSON.stringify(payload)
    expect(cryptoService.isEncryptedMail(json)).toBe(true)
  })

  it('RSA encryption with file attachments round trip', async () => {
    const keyPair = await cryptoService.generateRSAKeyPair()
    const fileContent = new TextEncoder().encode('File content here 📄')
    const file = new File([fileContent], 'document.txt', { type: 'text/plain' })

    const payload = await cryptoService.encryptRSA(
      'Message with attachment',
      keyPair.publicKey,
      'Attachment Test',
      [file],
      'carol@example.com'
    )

    expect(payload.attachments).toBeDefined()
    expect(payload.attachments!.length).toBe(1)
    expect(payload.attachments![0].name).toBe('document.txt')
    expect(payload.attachments![0].type).toBe('text/plain')

    const result = await cryptoService.decryptRSA(payload, keyPair.privateKey)
    expect(result.body).toBe('Message with attachment')
    expect(result.subject).toBe('Attachment Test')
    expect(result.attachments).toBeDefined()
    expect(result.attachments!.length).toBe(1)
    expect(result.attachments![0].name).toBe('document.txt')

    const decryptedContent = new TextDecoder().decode(result.attachments![0].data)
    expect(decryptedContent).toBe('File content here 📄')
  })
})

// ─── ECDSA Digital Signatures ─────────────────────────────────────

describe('cryptoService — ECDSA signatures', { timeout: 30000 }, () => {
  it('generateSigningKeyPair returns valid public and private keys', async () => {
    const keyPair = await cryptoService.generateSigningKeyPair()
    expect(keyPair.publicKey).toBeTruthy()
    expect(keyPair.privateKey).toBeTruthy()
    expect(keyPair.publicKey).not.toBe(keyPair.privateKey)
    expect(keyPair.publicKey.length).toBeGreaterThan(50)
    expect(keyPair.privateKey.length).toBeGreaterThan(50)
  })

  it('sign + verify round trip returns true', async () => {
    const keyPair = await cryptoService.generateSigningKeyPair()
    const data = 'ciphertext-iv-encryptedkey-concatenated'

    const signature = await cryptoService.sign(data, keyPair.privateKey)
    expect(signature).toBeTruthy()
    expect(signature.length).toBeGreaterThan(50)

    const isValid = await cryptoService.verify(data, signature, keyPair.publicKey)
    expect(isValid).toBe(true)
  })

  it('verify with wrong public key returns false', async () => {
    const signerKeys = await cryptoService.generateSigningKeyPair()
    const wrongKeys = await cryptoService.generateSigningKeyPair()
    const data = 'some-data-to-sign'

    const signature = await cryptoService.sign(data, signerKeys.privateKey)

    const isValid = await cryptoService.verify(data, signature, wrongKeys.publicKey)
    expect(isValid).toBe(false)
  })

  it('verify with tampered data returns false', async () => {
    const keyPair = await cryptoService.generateSigningKeyPair()
    const originalData = 'original-ciphertext-data'

    const signature = await cryptoService.sign(originalData, keyPair.privateKey)

    const isValid = await cryptoService.verify(
      'tampered-ciphertext-data',
      signature,
      keyPair.publicKey
    )
    expect(isValid).toBe(false)
  })

  it('sign + verify integrated with RSA encrypted payload', async () => {
    const rsaKeys = await cryptoService.generateRSAKeyPair()
    const signingKeys = await cryptoService.generateSigningKeyPair()

    const payload = await cryptoService.encryptRSA(
      'Signed and encrypted message',
      rsaKeys.publicKey,
      'Signed Subject',
      [],
      'dave@example.com'
    )

    // Sign: ciphertext + iv + encryptedKey (as specified in the design)
    const dataToSign = payload.ciphertext + payload.iv + payload.encryptedKey
    const signature = await cryptoService.sign(dataToSign, signingKeys.privateKey)

    // Attach signature to payload
    payload.signature = signature
    payload.signerPublicKey = signingKeys.publicKey

    // Verify signature
    const isValid = await cryptoService.verify(
      dataToSign,
      payload.signature,
      payload.signerPublicKey
    )
    expect(isValid).toBe(true)

    // Decrypt should still work
    const result = await cryptoService.decryptRSA(payload, rsaKeys.privateKey)
    expect(result.body).toBe('Signed and encrypted message')
    expect(result.subject).toBe('Signed Subject')
  })
})

// ─── Edge cases ──────────────────────────────────────────────────

describe('cryptoService — edge cases', () => {
  it('encrypt + decrypt empty body string', async () => {
    const password = 'edge-case-pw'
    const payload = await cryptoService.encrypt('', password, 'Subject')
    const { body, subject } = await cryptoService.decrypt(payload, password)
    expect(body).toBe('')
    expect(subject).toBe('Subject')
  })

  it('encrypt + decrypt unicode subject and body', async () => {
    const password = 'unicode-pw'
    const unicodeBody = '日本語テスト 🇻🇳 Tiếng Việt ñ ü ö'
    const unicodeSubject = '主題 🔐 Chủ đề'
    const payload = await cryptoService.encrypt(unicodeBody, password, unicodeSubject)
    const { body, subject } = await cryptoService.decrypt(payload, password)
    expect(body).toBe(unicodeBody)
    expect(subject).toBe(unicodeSubject)
  })

  it('RSA encrypt + decrypt empty body string', async () => {
    const keyPair = await cryptoService.generateRSAKeyPair()
    const payload = await cryptoService.encryptRSA('', keyPair.publicKey, 'Subject')
    const { body, subject } = await cryptoService.decryptRSA(payload, keyPair.privateKey)
    expect(body).toBe('')
    expect(subject).toBe('Subject')
  })

  it('RSA encrypt + decrypt unicode subject and body', async () => {
    const keyPair = await cryptoService.generateRSAKeyPair()
    const unicodeBody = '日本語テスト 🇻🇳 Tiếng Việt ñ ü ö'
    const unicodeSubject = '主題 🔐 Chủ đề'
    const payload = await cryptoService.encryptRSA(unicodeBody, keyPair.publicKey, unicodeSubject)
    const { body, subject } = await cryptoService.decryptRSA(payload, keyPair.privateKey)
    expect(body).toBe(unicodeBody)
    expect(subject).toBe(unicodeSubject)
  })

  it('isEncryptedMail returns false for non-string inputs', () => {
    expect(cryptoService.isEncryptedMail(null)).toBe(false)
    expect(cryptoService.isEncryptedMail(undefined)).toBe(false)
    expect(cryptoService.isEncryptedMail(42)).toBe(false)
    expect(cryptoService.isEncryptedMail({})).toBe(false)
    expect(cryptoService.isEncryptedMail(true)).toBe(false)
  })

  it('password mode encrypt with file attachments round trip', async () => {
    const password = 'attach-pw'
    const fileContent = new TextEncoder().encode('Attachment content 📎')
    const file = new File([fileContent], 'readme.txt', { type: 'text/plain' })

    const payload = await cryptoService.encrypt('Body with attachment', password, 'Attach Subject', [file])

    expect(payload.attachments).toBeDefined()
    expect(payload.attachments!.length).toBe(1)
    expect(payload.attachments![0].name).toBe('readme.txt')

    const result = await cryptoService.decrypt(payload, password)
    expect(result.body).toBe('Body with attachment')
    expect(result.subject).toBe('Attach Subject')
    expect(result.attachments).toBeDefined()
    expect(result.attachments!.length).toBe(1)

    const decryptedContent = new TextDecoder().decode(result.attachments![0].data)
    expect(decryptedContent).toBe('Attachment content 📎')
  })
})
