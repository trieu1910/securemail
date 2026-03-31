import { describe, it, expect } from 'vitest'
import { toBase64url, fromBase64url, arrayBufferToBase64url, base64urlToArrayBuffer } from './base64'

describe('base64url', () => {
  it('encodes and decodes a simple string round-trip', () => {
    const original = 'Hello, World!'
    const encoded = toBase64url(new TextEncoder().encode(original))
    const decoded = new TextDecoder().decode(fromBase64url(encoded))
    expect(decoded).toBe(original)
  })

  it('does not contain +, /, or = characters (URL-safe)', () => {
    const bytes = new Uint8Array([0xff, 0xfe, 0xfd, 0xfc])
    const encoded = toBase64url(bytes)
    expect(encoded).not.toMatch(/[+/=]/)
  })

  it('arrayBuffer round-trip works', () => {
    const original = new Uint8Array([1, 2, 3, 4, 5])
    const encoded = arrayBufferToBase64url(original.buffer)
    const decoded = new Uint8Array(base64urlToArrayBuffer(encoded))
    expect(decoded).toEqual(original)
  })
})
