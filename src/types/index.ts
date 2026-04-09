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
  version: string                       // '1.0'
  mode: 'password' | 'rsa'             // symmetric or asymmetric encryption
  subject: string                       // always empty — real subject inside ciphertext
  ciphertext: string                    // base64url — AES-256-GCM encrypted body+subject bundle
  iv: string                            // base64url, 12 bytes — GCM nonce
  encryptedKey: string                  // base64url — wrapped content key (AES-KW for password, RSA-OAEP for rsa)
  salt?: string                         // base64url, 16 bytes — PBKDF2 salt (password mode only)
  encryptedKeys?: Record<string, string> // RSA mode — {recipientEmail: base64url(RSA-OAEP wrapped key)}
  signature?: string                    // ECDSA-P384 signature over ciphertext+iv+encryptedKey (base64url)
  signerPublicKey?: string              // signer's ECDSA public key (base64url SPKI)
  attachments?: EncryptedAttachment[]   // encrypted file attachments
}

export interface RSAKeyPair {
  publicKey: string    // base64url SPKI
  privateKey: string   // base64url PKCS8
}

export interface SigningKeyPair {
  publicKey: string    // base64url SPKI
  privateKey: string   // base64url PKCS8
}
