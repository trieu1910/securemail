export interface User {
  id: string
  email: string
  name: string
  picture: string
}

export interface MailMeta {
  id: string
  threadId: string
  from: string
  to: string
  subject: string       // decrypted display subject (after decrypt) or '[SecureMail] encrypted message' before
  date: string
  snippet: string
  isEncrypted: boolean  // parsed from X-Encrypted header
  isRead: boolean
}

export interface MailDetail extends MailMeta {
  to: string
  body: string          // raw body — may be JSON CryptoPayload string
  headers: Record<string, string>
}

export interface EncryptedAttachment {
  name: string          // original filename
  type: string          // MIME type
  size: number          // original file size in bytes
  data: string          // base64url of (12-byte IV + AES-256-GCM ciphertext)
}

export interface CryptoPayload {
  version: string       // '1.0'
  mode: 'password'      // symmetric encryption only
  subject: string       // always empty — real subject inside ciphertext
  ciphertext: string    // base64 — AES-256-GCM encrypted body+subject bundle
  iv: string            // base64, 12 bytes — GCM nonce
  encryptedKey: string  // base64 — AES content key wrapped by AES-KW
  salt: string          // base64, 16 bytes — PBKDF2 salt
  attachments?: EncryptedAttachment[]  // encrypted file attachments
}
