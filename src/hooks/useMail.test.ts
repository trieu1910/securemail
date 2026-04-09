import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMail } from './useMail'
import { useMailStore } from '../store/mailStore'
import type { MailMeta } from '../types'

// Mock gmailService
vi.mock('../services/gmailService', () => ({
  gmailService: {
    listMessages: vi.fn(),
  },
}))

import { gmailService } from '../services/gmailService'

const mockMails: MailMeta[] = [
  {
    id: '1',
    threadId: 't1',
    from: 'alice@test.com',
    to: 'bob@test.com',
    subject: 'Test 1',
    date: '2024-01-01T00:00:00Z',
    snippet: 'Hello',
    isEncrypted: false,
    isRead: true,
  },
  {
    id: '2',
    threadId: 't2',
    from: 'carol@test.com',
    to: 'bob@test.com',
    subject: 'Test 2',
    date: '2024-01-02T00:00:00Z',
    snippet: 'World',
    isEncrypted: true,
    isRead: false,
  },
]

describe('useMail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useMailStore.setState({
      accessToken: 'test-token',
      currentFolder: 'inbox',
      mailList: [],
      nextPageToken: null,
      isLoading: false,
    })
  })

  it('fetchMail calls gmailService and updates store for inbox', async () => {
    vi.mocked(gmailService.listMessages).mockResolvedValue({
      messages: mockMails,
      nextPageToken: null,
    })

    renderHook(() => useMail())

    // useMail calls fetchMail in useEffect on mount
    await waitFor(() => {
      expect(gmailService.listMessages).toHaveBeenCalledWith('test-token', 'inbox')
    })

    await waitFor(() => {
      expect(useMailStore.getState().mailList).toEqual(mockMails)
    })
  })

  it('fetchMail error sets error state', async () => {
    vi.mocked(gmailService.listMessages).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useMail())

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load emails / Kh\u00f4ng th\u1ec3 t\u1ea3i email')
    })
  })

  it('fetchMail for encrypted-inbox merges inbox and spam, filters encrypted', async () => {
    useMailStore.setState({ currentFolder: 'encrypted-inbox', accessToken: 'test-token' })

    const inboxMails: MailMeta[] = [
      { ...mockMails[0], isEncrypted: false },
      { ...mockMails[1], isEncrypted: true },
    ]
    const spamMails: MailMeta[] = [
      {
        id: '3', threadId: 't3', from: 'spammer@test.com', to: 'bob@test.com',
        subject: 'Spam encrypted', date: '2024-01-03T00:00:00Z', snippet: 'enc',
        isEncrypted: true, isRead: false,
      },
    ]

    vi.mocked(gmailService.listMessages)
      .mockResolvedValueOnce({ messages: inboxMails, nextPageToken: null })
      .mockResolvedValueOnce({ messages: spamMails, nextPageToken: null })

    renderHook(() => useMail())

    await waitFor(() => {
      const stored = useMailStore.getState().mailList
      // Should only have encrypted mails from both inbox and spam
      expect(stored.length).toBe(2)
      expect(stored.every((m) => m.isEncrypted)).toBe(true)
    })
  })

  it('fetchMail for encrypted-sent filters only encrypted sent mails', async () => {
    useMailStore.setState({ currentFolder: 'encrypted-sent', accessToken: 'test-token' })

    vi.mocked(gmailService.listMessages).mockResolvedValue({
      messages: mockMails,
      nextPageToken: null,
    })

    renderHook(() => useMail())

    await waitFor(() => {
      expect(gmailService.listMessages).toHaveBeenCalledWith('test-token', 'sent')
    })

    await waitFor(() => {
      const stored = useMailStore.getState().mailList
      expect(stored.every((m) => m.isEncrypted)).toBe(true)
    })
  })

  it('loadMore with nextPageToken appends to mails', async () => {
    const moreMails: MailMeta[] = [
      {
        id: '3', threadId: 't3', from: 'dave@test.com', to: 'bob@test.com',
        subject: 'Test 3', date: '2024-01-03T00:00:00Z', snippet: 'More',
        isEncrypted: false, isRead: true,
      },
    ]

    // Initial fetch
    vi.mocked(gmailService.listMessages).mockResolvedValueOnce({
      messages: mockMails,
      nextPageToken: 'page2',
    })

    const { result } = renderHook(() => useMail())

    await waitFor(() => {
      expect(useMailStore.getState().mailList).toEqual(mockMails)
      expect(result.current.hasMore).toBe(true)
    })

    // Load more
    vi.mocked(gmailService.listMessages).mockResolvedValueOnce({
      messages: moreMails,
      nextPageToken: null,
    })

    await waitFor(async () => {
      await result.current.loadMore()
    })

    await waitFor(() => {
      expect(gmailService.listMessages).toHaveBeenCalledWith('test-token', 'inbox', 'page2')
      expect(useMailStore.getState().mailList).toHaveLength(3)
    })
  })

  it('does not fetch if no access token', () => {
    useMailStore.setState({ accessToken: null })

    renderHook(() => useMail())

    expect(gmailService.listMessages).not.toHaveBeenCalled()
  })

  it('loadMore does nothing without nextPageToken', async () => {
    vi.mocked(gmailService.listMessages).mockResolvedValue({
      messages: mockMails,
      nextPageToken: null,
    })

    const { result } = renderHook(() => useMail())

    await waitFor(() => {
      expect(useMailStore.getState().mailList).toEqual(mockMails)
    })

    await result.current.loadMore()
    // Only the initial fetch should have been called
    expect(gmailService.listMessages).toHaveBeenCalledTimes(1)
  })
})
