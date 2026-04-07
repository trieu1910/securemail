import { arrayBufferToBase64url, base64urlToArrayBuffer } from '../utils/base64'
import type { CryptoPayload, EncryptedAttachment } from '../types'

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
      trimmed.includes('"mode":"password"') || trimmed.includes('"mode": "password"')
    )
  },
}
