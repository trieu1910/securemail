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
})
