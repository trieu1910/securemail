import { arrayBufferToBase64url, base64urlToArrayBuffer } from '../utils/base64'
import type { CryptoPayload, EncryptedAttachment, RSAKeyPair, SigningKeyPair } from '../types'

const ENC = new TextEncoder()
const DEC = new TextDecoder()

/** Import raw password bytes as PBKDF2 key material */
async function importPasswordMaterial(password: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', ENC.encode(password), 'PBKDF2', false, ['deriveKey'])
}

/** Derive a 256-bit AES-KW key from password + salt using PBKDF2 */
async function deriveWrappingKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await importPasswordMaterial(password)
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 100_000, hash: 'SHA-256' },
    material,
    { name: 'AES-KW', length: 256 },
    false,
    ['wrapKey', 'unwrapKey']
  )
}

export const cryptoService = {
  /**
   * Encrypt plaintext + subject together with password.
   * Both body and subject are bundled as JSON before encryption —
   * the subject is NEVER stored in plaintext in the payload.
   */
  async encrypt(plaintext: string, password: string, subject = '', files: File[] = []): Promise<CryptoPayload> {
    // Bundle body + subject together so both are encrypted as one unit
    const bundle = JSON.stringify({ body: plaintext, subject })

    // 1. Generate random AES-256 content key
    const contentKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])

    // 2. Random IV (12 bytes) for body encryption
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // 3. Encrypt the bundle (body + subject)
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, contentKey, ENC.encode(bundle))

    // 4. Random salt for PBKDF2
    const salt = crypto.getRandomValues(new Uint8Array(16))

    // 5. Derive AES-KW wrapping key from password (PBKDF2-SHA256, 100k iterations, 256-bit output)
    const wrappingKey = await deriveWrappingKey(password, salt)

    // 6. Wrap the content key using AES-KW (RFC 3394 — no IV needed, purpose-built key wrap)
    const encryptedKey = await crypto.subtle.wrapKey('raw', contentKey, wrappingKey, 'AES-KW')

    // 7. Encrypt file attachments — each gets its own IV, same content key
    const attachments: EncryptedAttachment[] = []
    for (const file of files) {
      const fileData = await file.arrayBuffer()
      const fileIv = crypto.getRandomValues(new Uint8Array(12))
      const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: fileIv }, contentKey, fileData)
      // Prepend IV (12 bytes) to ciphertext so decrypt can extract it
      const combined = new Uint8Array(12 + encryptedData.byteLength)
      combined.set(fileIv, 0)
      combined.set(new Uint8Array(encryptedData), 12)
      attachments.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: arrayBufferToBase64url(combined.buffer),
      })
    }

    return {
      version: '1.0',
      mode: 'password',
      subject: '',  // empty — real subject is inside ciphertext, not here
      ciphertext: arrayBufferToBase64url(ciphertext),
      iv: arrayBufferToBase64url(iv.buffer),
      encryptedKey: arrayBufferToBase64url(encryptedKey),
      salt: arrayBufferToBase64url(salt.buffer),
      ...(attachments.length > 0 ? { attachments } : {}),
    }
  },

  /** Decrypt a CryptoPayload. Returns { body, subject, attachments? }. */
  async decrypt(payload: CryptoPayload, password: string): Promise<{
    body: string
    subject: string
    attachments?: { name: string; type: string; size: number; data: ArrayBuffer }[]
  }> {
    if (!payload.salt) throw new Error('Missing salt in payload')

    const salt = new Uint8Array(base64urlToArrayBuffer(payload.salt))
    const wrappingKey = await deriveWrappingKey(password, salt)

    // Unwrap content key
    const contentKey = await crypto.subtle.unwrapKey(
      'raw',
      base64urlToArrayBuffer(payload.encryptedKey),
      wrappingKey,
      'AES-KW',
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )

    // Decrypt bundle
    const plainBytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64urlToArrayBuffer(payload.iv) },
      contentKey,
      base64urlToArrayBuffer(payload.ciphertext)
    )

    const bundle = JSON.parse(DEC.decode(plainBytes)) as { body: string; subject: string }

    // Decrypt file attachments if present
    let attachments: { name: string; type: string; size: number; data: ArrayBuffer }[] | undefined
    if (payload.attachments && payload.attachments.length > 0) {
      attachments = []
      for (const att of payload.attachments) {
        const combined = new Uint8Array(base64urlToArrayBuffer(att.data))
        const fileIv = combined.slice(0, 12)
        const encryptedData = combined.slice(12)
        const decryptedData = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: fileIv },
          contentKey,
          encryptedData
        )
        attachments.push({
          name: att.name,
          type: att.type,
          size: att.size,
          data: decryptedData,
        })
      }
    }

    return { ...bundle, attachments }
  },

  /** Check if an email body string is a SecureMail encrypted payload */
  isEncryptedMail(body: unknown): boolean {
    if (typeof body !== 'string' || !body) return false
    const trimmed = body.trim()
    if (!trimmed.startsWith('{')) return false
    // Quick check without full JSON.parse — handles large payloads with attachments
    // that may be truncated by Gmail API format=full
    return trimmed.includes('"version":"1.0"') && (
      trimmed.includes('"mode":"password"') || trimmed.includes('"mode": "password"') ||
      trimmed.includes('"mode":"rsa"') || trimmed.includes('"mode": "rsa"')
    )
  },

  // ─── RSA-OAEP Asymmetric Encryption ──────────────────────────────

  /**
   * Generate an RSA-OAEP 4096-bit key pair for asymmetric encryption.
   * Returns public and private keys as base64url-encoded SPKI/PKCS8.
   */
  async generateRSAKeyPair(): Promise<RSAKeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 4096,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['wrapKey', 'unwrapKey']
    )

    const publicKeyBuf = await crypto.subtle.exportKey('spki', keyPair.publicKey)
    const privateKeyBuf = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

    return {
      publicKey: arrayBufferToBase64url(publicKeyBuf),
      privateKey: arrayBufferToBase64url(privateKeyBuf),
    }
  },

  /**
   * Encrypt plaintext + subject using RSA-OAEP for key wrapping.
   * The content is encrypted with AES-256-GCM; the content key is wrapped
   * with the recipient's RSA-OAEP public key.
   */
  async encryptRSA(
    plaintext: string,
    recipientPublicKeyB64: string,
    subject = '',
    files: File[] = [],
    recipientEmail = 'recipient'
  ): Promise<CryptoPayload> {
    // Bundle body + subject together
    const bundle = JSON.stringify({ body: plaintext, subject })

    // 1. Generate random AES-256 content key
    const contentKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )

    // 2. Random IV (12 bytes) for body encryption
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // 3. Encrypt the bundle
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      contentKey,
      ENC.encode(bundle)
    )

    // 4. Import recipient's RSA-OAEP public key
    const recipientPublicKey = await crypto.subtle.importKey(
      'spki',
      base64urlToArrayBuffer(recipientPublicKeyB64),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['wrapKey']
    )

    // 5. Wrap content key with RSA-OAEP
    const encryptedKey = await crypto.subtle.wrapKey(
      'raw',
      contentKey,
      recipientPublicKey,
      { name: 'RSA-OAEP' }
    )

    // 6. Encrypt file attachments — each gets its own IV, same content key
    const attachments: EncryptedAttachment[] = []
    for (const file of files) {
      const fileData = await file.arrayBuffer()
      const fileIv = crypto.getRandomValues(new Uint8Array(12))
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: fileIv },
        contentKey,
        fileData
      )
      const combined = new Uint8Array(12 + encryptedData.byteLength)
      combined.set(fileIv, 0)
      combined.set(new Uint8Array(encryptedData), 12)
      attachments.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: arrayBufferToBase64url(combined.buffer),
      })
    }

    const encryptedKeyB64 = arrayBufferToBase64url(encryptedKey)

    return {
      version: '1.0',
      mode: 'rsa',
      subject: '',
      ciphertext: arrayBufferToBase64url(ciphertext),
      iv: arrayBufferToBase64url(iv.buffer),
      encryptedKey: encryptedKeyB64,
      encryptedKeys: { [recipientEmail]: encryptedKeyB64 },
      ...(attachments.length > 0 ? { attachments } : {}),
    }
  },

  /**
   * Decrypt a CryptoPayload encrypted in RSA mode.
   * Uses the recipient's RSA-OAEP private key to unwrap the content key.
   */
  async decryptRSA(
    payload: CryptoPayload,
    privateKeyB64: string
  ): Promise<{
    body: string
    subject: string
    attachments?: { name: string; type: string; size: number; data: ArrayBuffer }[]
  }> {
    // 1. Import RSA-OAEP private key
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      base64urlToArrayBuffer(privateKeyB64),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['unwrapKey']
    )

    // 2. Unwrap content key using RSA-OAEP
    const contentKey = await crypto.subtle.unwrapKey(
      'raw',
      base64urlToArrayBuffer(payload.encryptedKey),
      privateKey,
      { name: 'RSA-OAEP' },
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )

    // 3. Decrypt body+subject bundle
    const plainBytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64urlToArrayBuffer(payload.iv) },
      contentKey,
      base64urlToArrayBuffer(payload.ciphertext)
    )

    const bundle = JSON.parse(DEC.decode(plainBytes)) as { body: string; subject: string }

    // 4. Decrypt file attachments if present
    let attachments:
      | { name: string; type: string; size: number; data: ArrayBuffer }[]
      | undefined
    if (payload.attachments && payload.attachments.length > 0) {
      attachments = []
      for (const att of payload.attachments) {
        const combined = new Uint8Array(base64urlToArrayBuffer(att.data))
        const fileIv = combined.slice(0, 12)
        const encryptedData = combined.slice(12)
        const decryptedData = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: fileIv },
          contentKey,
          encryptedData
        )
        attachments.push({
          name: att.name,
          type: att.type,
          size: att.size,
          data: decryptedData,
        })
      }
    }

    return { ...bundle, attachments }
  },

  // ─── ECDSA Digital Signatures ────────────────────────────────────

  /**
   * Generate an ECDSA P-384 key pair for digital signatures.
   * Returns public and private keys as base64url-encoded SPKI/PKCS8.
   */
  async generateSigningKeyPair(): Promise<SigningKeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-384' },
      true,
      ['sign', 'verify']
    )

    const publicKeyBuf = await crypto.subtle.exportKey('spki', keyPair.publicKey)
    const privateKeyBuf = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

    return {
      publicKey: arrayBufferToBase64url(publicKeyBuf),
      privateKey: arrayBufferToBase64url(privateKeyBuf),
    }
  },

  /**
   * Sign data with an ECDSA P-384 private key.
   * dataToSign should be: payload.ciphertext + payload.iv + payload.encryptedKey
   * (sign the ciphertext, not plaintext — proves ciphertext integrity)
   */
  async sign(dataToSign: string, privateKeyB64: string): Promise<string> {
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      base64urlToArrayBuffer(privateKeyB64),
      { name: 'ECDSA', namedCurve: 'P-384' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-384' },
      privateKey,
      ENC.encode(dataToSign)
    )

    return arrayBufferToBase64url(signature)
  },

  /**
   * Verify an ECDSA P-384 signature.
   * Returns true if the signature is valid, false otherwise.
   */
  async verify(
    dataToSign: string,
    signatureB64: string,
    publicKeyB64: string
  ): Promise<boolean> {
    const publicKey = await crypto.subtle.importKey(
      'spki',
      base64urlToArrayBuffer(publicKeyB64),
      { name: 'ECDSA', namedCurve: 'P-384' },
      false,
      ['verify']
    )

    return crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-384' },
      publicKey,
      base64urlToArrayBuffer(signatureB64),
      ENC.encode(dataToSign)
    )
  },
}
