import type { MailMeta, MailDetail, User } from '../types'

const BASE = import.meta.env.VITE_GMAIL_API_BASE as string

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

async function apiFetch(url: string, token: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(token), ...options?.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gmail API error ${res.status}: ${JSON.stringify(err)}`)
  }
  return res.json()
}

function parseMailMeta(msg: Record<string, unknown>): MailMeta {
  const headers = (msg.payload as Record<string, unknown>)?.headers as Array<{name: string, value: string}> ?? []
  const h = (name: string) => headers.find((x) => x.name.toLowerCase() === name.toLowerCase())?.value ?? ''

  return {
    id: msg.id as string,
    threadId: msg.threadId as string,
    from: h('From'),
    to: h('To'),
    subject: decodeHtmlEntities(h('Subject')),
    date: msg.internalDate
      ? new Date(Number(msg.internalDate)).toISOString()
      : h('Date'),
    snippet: decodeHtmlEntities((msg.snippet as string) ?? ''),
    isEncrypted: h('X-Encrypted') === 'true'
      || h('Subject').includes('[SecureMail]')
      || h('Subject').includes('"version"')
      || ((msg.snippet as string) ?? '').includes('&quot;version&quot;')
      || ((msg.snippet as string) ?? '').includes('"version":"1.0"'),
    isRead: !((msg.labelIds as string[]) ?? []).includes('UNREAD'),
  }
}

/** Decode HTML entities like &#39; &amp; etc. */
function decodeHtmlEntities(str: string): string {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = str
  return textarea.value
}

/** Decode base64url Gmail body data to UTF-8 string */
function decodeBase64Utf8(base64url: string): string {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder('utf-8').decode(bytes)
}

function extractBody(payload: Record<string, unknown>): string {
  const data = (payload.body as Record<string, string>)?.data

  // Single-part message
  if (data && !payload.parts) return decodeBase64Utf8(data)

  // Multipart: collect all parts recursively (deep traversal)
  const parts = (payload.parts as Array<Record<string, unknown>>) ?? []
  let htmlBody = ''
  let textBody = ''

  function walk(partList: Array<Record<string, unknown>>) {
    for (const part of partList) {
      const partMime = (part.mimeType as string) ?? ''
      const partData = (part.body as Record<string, string>)?.data
      const subParts = part.parts as Array<Record<string, unknown>> | undefined

      if (partMime === 'text/html' && partData) {
        htmlBody = decodeBase64Utf8(partData)
      } else if (partMime === 'text/plain' && partData && !textBody) {
        textBody = decodeBase64Utf8(partData)
      }

      // Always recurse into nested parts
      if (subParts?.length) {
        walk(subParts)
      }
    }
  }

  walk(parts)

  // For encrypted SecureMail messages, the payload is always text/plain JSON.
  // Gmail may wrap it in HTML with <div> tags, breaking JSON parsing.
  // Prefer text/plain if it looks like a CryptoPayload JSON.
  if (textBody && textBody.trimStart().startsWith('{') && textBody.includes('"version"')) {
    // Clean quoted-printable soft line breaks that Gmail may inject
    return textBody.replace(/=\r?\n/g, '').replace(/[\r\n\t]/g, '')
  }

  // Otherwise prefer HTML for rich email rendering
  return htmlBody || textBody
}

export const gmailService = {
  async listMessages(token: string, folder: 'inbox' | 'sent' | 'trash' | 'spam', pageToken?: string): Promise<{ messages: MailMeta[]; nextPageToken: string | null }> {
    const labelMap = { inbox: 'label:inbox', sent: 'label:sent', trash: 'label:trash', spam: 'label:spam' }
    let url = `${BASE}/messages?q=${labelMap[folder]}&maxResults=20`
    if (pageToken) url += `&pageToken=${pageToken}`
    const data = await apiFetch(url, token)
    if (!data.messages) return { messages: [], nextPageToken: null }

    // Fetch each message detail in parallel
    const ids: string[] = data.messages.map((m: {id: string}) => m.id)
    const details = await Promise.all(
      ids.map((id) => apiFetch(`${BASE}/messages/${id}?format=full&fields=id,threadId,labelIds,snippet,internalDate,payload(headers,mimeType)`, token))
    )
    return { messages: details.map(parseMailMeta), nextPageToken: data.nextPageToken || null }
  },

  async getMessage(token: string, id: string): Promise<MailDetail> {
    const msg = await apiFetch(`${BASE}/messages/${id}?format=full`, token)
    const meta = parseMailMeta(msg)
    let body = extractBody(msg.payload as Record<string, unknown>)

    // Gmail API format=full may truncate large bodies (>1MB).
    // If body is empty but the email is encrypted, fetch raw MIME and extract body.
    if (!body && meta.isEncrypted) {
      try {
        const rawMsg = await apiFetch(`${BASE}/messages/${id}?format=raw`, token)
        if (rawMsg.raw) {
          const mimeStr = decodeBase64Utf8(rawMsg.raw)
          // Extract body after double CRLF (end of headers)
          const bodyStart = mimeStr.indexOf('\r\n\r\n')
          if (bodyStart !== -1) {
            body = mimeStr.substring(bodyStart + 4).trim()
          }
        }
      } catch {
        // Fallback: body stays empty
      }
    }

    const headers: Record<string, string> = {}
    const rawHeaders = (msg.payload as Record<string, unknown>)?.headers as Array<{name: string, value: string}> ?? []
    rawHeaders.forEach((h) => { headers[h.name] = h.value })
    return { ...meta, to: headers['To'] ?? '', body, headers }
  },

  /** Fetch raw MIME and extract body — used when format=full truncates large payloads */
  async getMessageRaw(token: string, id: string): Promise<string | null> {
    try {
      const rawMsg = await apiFetch(`${BASE}/messages/${id}?format=raw`, token)
      if (!rawMsg.raw) return null
      // Gmail raw is base64url-encoded MIME. Use Uint8Array for large payloads (atob fails on >1MB).
      const raw = rawMsg.raw as string
      const base64 = raw.replace(/-/g, '+').replace(/_/g, '/')
      const binaryStr = atob(base64)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
      const mimeStr = new TextDecoder('utf-8').decode(bytes)
      // Find body after double CRLF (end of headers). Also try \n\n as fallback.
      let bodyStart = mimeStr.indexOf('\r\n\r\n')
      if (bodyStart === -1) bodyStart = mimeStr.indexOf('\n\n')
      if (bodyStart === -1) return null
      const sep = mimeStr[bodyStart] === '\r' ? 4 : 2
      return mimeStr.substring(bodyStart + sep).trim()
    } catch (err) {
      console.error('getMessageRaw failed:', err)
      return null
    }
  },

  async sendMessage(token: string, raw: string): Promise<void> {
    await apiFetch(`${BASE}/messages/send`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
    })
  },

  async trashMessage(token: string, id: string): Promise<void> {
    await apiFetch(`${BASE}/messages/${id}/trash`, token, {
      method: 'POST',
    })
  },

  async modifyLabels(token: string, id: string, addLabels: string[], removeLabels: string[]): Promise<void> {
    await apiFetch(`${BASE}/messages/${id}/modify`, token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addLabelIds: addLabels, removeLabelIds: removeLabels }),
    })
  },

  async getProfile(token: string): Promise<User> {
    const data = await apiFetch(`${BASE}/profile`, token)
    return {
      id: data.emailAddress,
      email: data.emailAddress,
      name: data.emailAddress.split('@')[0],
      picture: '',
    }
  },
}
