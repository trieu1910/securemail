/** Encode Uint8Array to base64url string (no +, /, or = padding) */
export function toBase64url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/** Decode base64url string to Uint8Array */
export function fromBase64url(str: string): Uint8Array {
  // Re-add padding
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4)
  const standard = padded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(standard)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/** Encode ArrayBuffer to base64url string */
export function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  return toBase64url(new Uint8Array(buffer))
}

/** Decode base64url string to ArrayBuffer */
export function base64urlToArrayBuffer(str: string): ArrayBuffer {
  return fromBase64url(str).buffer as ArrayBuffer
}
