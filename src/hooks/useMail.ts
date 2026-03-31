import { useEffect, useCallback } from 'react'
import { useMailStore } from '../store/mailStore'
import { gmailService } from '../services/gmailService'

export function useMail() {
  const { accessToken, currentFolder, mailList, setMailList, setLoading } = useMailStore()

  const fetchMail = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      // encrypted-inbox and encrypted-sent are virtual folders
      // that filter from real inbox/sent
      const apiFolder = currentFolder === 'encrypted-inbox' ? 'inbox'
        : currentFolder === 'encrypted-sent' ? 'sent'
        : currentFolder

      const list = await gmailService.listMessages(accessToken, apiFolder)

      // Filter for encrypted-only virtual folders
      if (currentFolder === 'encrypted-inbox' || currentFolder === 'encrypted-sent') {
        setMailList(list.filter((m) => m.isEncrypted))
      } else {
        setMailList(list)
      }
    } catch (err) {
      console.error('Failed to fetch mail:', err)
    } finally {
      setLoading(false)
    }
  }, [accessToken, currentFolder])

  useEffect(() => {
    fetchMail()
  }, [fetchMail])

  return { mailList, refresh: fetchMail }
}
