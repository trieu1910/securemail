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
      // encrypted-inbox and encrypted-sent are virtual folders
      // that filter from real inbox/sent
      const apiFolder = currentFolder === 'encrypted-inbox' ? 'inbox'
        : currentFolder === 'encrypted-sent' ? 'sent'
        : currentFolder

      const { messages, nextPageToken: npt } = await gmailService.listMessages(accessToken, apiFolder)
      setNextPageToken(npt)

      // Filter for encrypted-only virtual folders
      if (currentFolder === 'encrypted-inbox' || currentFolder === 'encrypted-sent') {
        setMailList(messages.filter((m) => m.isEncrypted))
      } else {
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
