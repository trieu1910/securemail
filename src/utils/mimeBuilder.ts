import type { CryptoPayload } from '../types'
import { arrayBufferToBase64url } from './base64'

/**
 * Build a base64url-encoded raw MIME message for Gmail API /messages/send.
 * Subject is always '[SecureMail] encrypted message' — real subject encrypted in body.
 * Uses TextEncoder + arrayBufferToBase64url for correct UTF-8 encoding (not btoa/atob hack).
 */
export function buildMimeMessage(from: string, to: string, payload: CryptoPayload, cc?: string, bcc?: string): string {
  const body = JSON.stringify(payload)

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
  ]
  if (cc) headers.push(`Cc: ${cc}`)
  if (bcc) headers.push(`Bcc: ${bcc}`)
  headers.push(
    `Subject: [SecureMail] encrypted message`,
    `Content-Type: text/plain; charset=utf-8`,
    `X-SecureMail-Version: 1.0`,
    `X-Encrypted: true`,
  )

  const mime = [...headers, ``, body].join('\r\n')

  // Encode as UTF-8 bytes then base64url — correct for Gmail API raw MIME
  const bytes = new TextEncoder().encode(mime)
  return arrayBufferToBase64url(bytes.buffer)
}

/** Build a reply MIME message with In-Reply-To header */
export function buildReplyMimeMessage(
  from: string,
  to: string,
  payload: CryptoPayload,
  inReplyTo: string,
  cc?: string,
  bcc?: string,
): string {
  const body = JSON.stringify(payload)

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
  ]
  if (cc) headers.push(`Cc: ${cc}`)
  if (bcc) headers.push(`Bcc: ${bcc}`)
  headers.push(
    `Subject: Re: [SecureMail] encrypted message`,
    `Content-Type: text/plain; charset=utf-8`,
    `X-SecureMail-Version: 1.0`,
    `X-Encrypted: true`,
    `In-Reply-To: ${inReplyTo}`,
    `References: ${inReplyTo}`,
  )

  const mime = [...headers, ``, body].join('\r\n')

  const bytes = new TextEncoder().encode(mime)
  return arrayBufferToBase64url(bytes.buffer)
}
