import { useEffect, useCallback, useState } from 'react'
import { useMailStore } from '../store/mailStore'
import { gmailService } from '../services/gmailService'

export function useMail() {
  const {
    accessToken, currentFolder, mailList,
    setMailList, setLoading, nextPageToken,
    setNextPageToken, appendMailList,
  } = useMailStore()

  const [loadingMore, setLoadingMore] = useState(false)

  const fetchMail = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      // encrypted-inbox: fetch from inbox + spam (encrypted mails may land in spam)
      // encrypted-sent: fetch from sent
      if (currentFolder === 'encrypted-inbox') {
        const [inboxRes, spamRes] = await Promise.all([
          gmailService.listMessages(accessToken, 'inbox'),
          gmailService.listMessages(accessToken, 'spam'),
        ])
        const merged = [...inboxRes.messages, ...spamRes.messages]
          .filter((m) => m.isEncrypted)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setMailList(merged)
        setNextPageToken(null) // no pagination for virtual folders
      } else if (currentFolder === 'encrypted-sent') {
        const { messages } = await gmailService.listMessages(accessToken, 'sent')
        setMailList(messages.filter((m) => m.isEncrypted))
        setNextPageToken(null)
      } else {
        const { messages, nextPageToken: npt } = await gmailService.listMessages(accessToken, currentFolder)
        setNextPageToken(npt)
        setMailList(messages)
      }
    } catch (err) {
      console.error('Failed to fetch mail:', err)
    } finally {
      setLoading(false)
    }
  }, [accessToken, currentFolder])

  const loadMore = useCallback(async () => {
    if (!accessToken || !nextPageToken) return
    setLoadingMore(true)
    try {
      const apiFolder = currentFolder === 'encrypted-inbox' ? 'inbox'
        : currentFolder === 'encrypted-sent' ? 'sent'
        : currentFolder

      const { messages, nextPageToken: npt } = await gmailService.listMessages(accessToken, apiFolder, nextPageToken)
      setNextPageToken(npt)

      if (currentFolder === 'encrypted-inbox' || currentFolder === 'encrypted-sent') {
        appendMailList(messages.filter((m) => m.isEncrypted))
      } else {
        appendMailList(messages)
      }
    } catch (err) {
      console.error('Failed to load more mail:', err)
    } finally {
      setLoadingMore(false)
    }
  }, [accessToken, currentFolder, nextPageToken])

  useEffect(() => {
    fetchMail()
  }, [fetchMail])

  return { mailList, refresh: fetchMail, loadMore, hasMore: !!nextPageToken, loadingMore }
}
