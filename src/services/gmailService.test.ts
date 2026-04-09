import { describe, it, expect, vi, beforeEach } from 'vitest'
import { gmailService } from './gmailService'

const TOKEN = 'fake-token'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('gmailService', () => {
  it('listMessages calls Gmail API with correct label query', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ messages: [{ id: '1', threadId: 'abc' }] }),
    } as Response)

    await gmailService.listMessages(TOKEN, 'inbox')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('label:inbox'),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${TOKEN}` },
      })
    )
  })

  it('sendMessage calls POST /messages/send', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'msg1' }),
    } as Response)

    await gmailService.sendMessage(TOKEN, 'base64rawmime')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/messages/send'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    } as Response)

    await expect(gmailService.listMessages(TOKEN, 'inbox')).rejects.toThrow()
  })

  it('getMessage parses full Gmail API response with headers and body', async () => {
    const bodyText = 'Hello, this is the email body'
    const base64Body = btoa(bodyText).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'msg123',
        threadId: 'thread456',
        labelIds: ['INBOX'],
        snippet: 'Hello, this is',
        internalDate: '1700000000000',
        payload: {
          headers: [
            { name: 'From', value: 'sender@example.com' },
            { name: 'To', value: 'recipient@example.com' },
            { name: 'Subject', value: 'Test Subject' },
            { name: 'Date', value: 'Tue, 14 Nov 2023 10:00:00 +0000' },
          ],
          mimeType: 'text/plain',
          body: { data: base64Body },
        },
      }),
    } as Response)

    const result = await gmailService.getMessage(TOKEN, 'msg123')
    expect(result.id).toBe('msg123')
    expect(result.threadId).toBe('thread456')
    expect(result.from).toBe('sender@example.com')
    expect(result.to).toBe('recipient@example.com')
    expect(result.subject).toBe('Test Subject')
    expect(result.body).toBe(bodyText)
    expect(result.isRead).toBe(true) // no UNREAD label
  })

  it('getMessage detects encrypted payload via X-Encrypted header', async () => {
    const payloadJson = JSON.stringify({ version: '1.0', mode: 'password', ciphertext: 'abc' })
    const base64Body = btoa(payloadJson).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'enc1',
        threadId: 't1',
        labelIds: ['INBOX', 'UNREAD'],
        snippet: '',
        internalDate: '1700000000000',
        payload: {
          headers: [
            { name: 'From', value: 'alice@example.com' },
            { name: 'To', value: 'bob@example.com' },
            { name: 'Subject', value: '[SecureMail] encrypted message' },
            { name: 'X-Encrypted', value: 'true' },
          ],
          mimeType: 'text/plain',
          body: { data: base64Body },
        },
      }),
    } as Response)

    const result = await gmailService.getMessage(TOKEN, 'enc1')
    expect(result.isEncrypted).toBe(true)
    expect(result.isRead).toBe(false)
  })

  it('getMessage handles multipart messages', async () => {
    const htmlBody = '<p>HTML content</p>'
    const textBody = 'Plain text'
    const base64Html = btoa(htmlBody).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const base64Text = btoa(textBody).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'multi1',
        threadId: 't2',
        labelIds: ['INBOX'],
        snippet: 'Plain text',
        internalDate: '1700000000000',
        payload: {
          headers: [
            { name: 'From', value: 'sender@test.com' },
            { name: 'To', value: 'recipient@test.com' },
            { name: 'Subject', value: 'Multipart Email' },
          ],
          mimeType: 'multipart/alternative',
          body: {},
          parts: [
            { mimeType: 'text/plain', body: { data: base64Text } },
            { mimeType: 'text/html', body: { data: base64Html } },
          ],
        },
      }),
    } as Response)

    const result = await gmailService.getMessage(TOKEN, 'multi1')
    // Should prefer HTML for non-encrypted messages
    expect(result.body).toBe(htmlBody)
  })

  it('getMessageRaw returns extracted body from raw MIME', async () => {
    const mimeContent = 'From: test@test.com\r\nTo: dest@test.com\r\nSubject: Test\r\n\r\nThis is the raw body'
    const base64Raw = btoa(mimeContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ raw: base64Raw }),
    } as Response)

    const result = await gmailService.getMessageRaw(TOKEN, 'rawmsg1')
    expect(result).toBe('This is the raw body')
  })

  it('getMessageRaw returns null when raw field is missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const result = await gmailService.getMessageRaw(TOKEN, 'rawmsg2')
    expect(result).toBeNull()
  })

  it('getMessageRaw returns null on fetch failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    } as Response)

    const result = await gmailService.getMessageRaw(TOKEN, 'rawmsg3')
    expect(result).toBeNull()
  })

  it('trashMessage calls POST /messages/{id}/trash', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'msg1' }),
    } as Response)

    await gmailService.trashMessage(TOKEN, 'msg1')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/messages/msg1/trash'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('modifyLabels calls POST /messages/{id}/modify with correct body', async () => {
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'msg1' }),
    } as Response)

    await gmailService.modifyLabels(TOKEN, 'msg1', ['INBOX'], ['UNREAD'])

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/messages/msg1/modify'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ addLabelIds: ['INBOX'], removeLabelIds: ['UNREAD'] }),
      })
    )
  })

  it('getProfile returns user data from Gmail API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ emailAddress: 'user@gmail.com' }),
    } as Response)

    const profile = await gmailService.getProfile(TOKEN)
    expect(profile.email).toBe('user@gmail.com')
    expect(profile.id).toBe('user@gmail.com')
    expect(profile.name).toBe('user')
    expect(profile.picture).toBe('')
  })

  it('listMessages returns empty array when no messages', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const result = await gmailService.listMessages(TOKEN, 'inbox')
    expect(result.messages).toEqual([])
    expect(result.nextPageToken).toBeNull()
  })

  it('trashMessage throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not Found' }),
    } as Response)

    await expect(gmailService.trashMessage(TOKEN, 'nonexistent')).rejects.toThrow()
  })

  it('getProfile throws on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    } as Response)

    await expect(gmailService.getProfile(TOKEN)).rejects.toThrow()
  })
})
