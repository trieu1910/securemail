import { useState, useCallback, useMemo } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { ComposeModal } from '../components/compose/ComposeModal'
import { MailView } from './MailView'
import { ShortcutHelp } from '../components/common/ShortcutHelp'
import { useMailStore } from '../store/mailStore'
import { useMail } from '../hooks/useMail'
import { useAuth } from '../hooks/useAuth'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useLang } from '../hooks/useLang'
import { gmailService } from '../services/gmailService'

export function Inbox() {
  const {
    isComposing,
    selectedMail,
    mailList,
    setSelected,
    setMailList,
    toggleCompose,
    openReply,
    openForward,
    accessToken,
  } = useMailStore()
  const { refresh } = useMail()
  useAuth()  // ensures user profile is loaded
  const { t } = useLang()

  const [showShortcuts, setShowShortcuts] = useState(false)

  /** Index of the currently selected mail inside mailList (-1 if none). */
  const selectedIndex = useMemo(() => {
    if (!selectedMail) return -1
    return mailList.findIndex((m) => m.id === selectedMail.id)
  }, [selectedMail, mailList])

  const selectByIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= mailList.length) return
      const mail = mailList[index]
      // MailDetail needs body + headers; they'll be fetched by MailView
      setSelected({ ...mail, body: '', headers: {} })
    },
    [mailList, setSelected],
  )

  const handleNextMail = useCallback(() => {
    if (mailList.length === 0) return
    const next = selectedIndex < 0 ? 0 : Math.min(selectedIndex + 1, mailList.length - 1)
    selectByIndex(next)
  }, [selectedIndex, mailList.length, selectByIndex])

  const handlePrevMail = useCallback(() => {
    if (mailList.length === 0) return
    const prev = selectedIndex < 0 ? 0 : Math.max(selectedIndex - 1, 0)
    selectByIndex(prev)
  }, [selectedIndex, mailList.length, selectByIndex])

  const handleOpenMail = useCallback(() => {
    // Enter selects the first mail if none selected, otherwise keeps current
    if (!selectedMail && mailList.length > 0) {
      selectByIndex(0)
    }
    // Navigation to /mail/:id is handled by MailView rendering when selectedMail is set
  }, [selectedMail, mailList.length, selectByIndex])

  const handleGoBack = useCallback(() => {
    if (showShortcuts) {
      setShowShortcuts(false)
    } else {
      setSelected(null)
    }
  }, [showShortcuts, setSelected])

  const handleCompose = useCallback(() => {
    toggleCompose()
  }, [toggleCompose])

  const handleReply = useCallback(() => {
    if (!selectedMail) return
    const from = selectedMail.from
    const emailMatch = from.match(/<([^>]+)>/)
    const email = emailMatch ? emailMatch[1] : from
    openReply(email, selectedMail.subject, '', '')
  }, [selectedMail, openReply])

  const handleForward = useCallback(() => {
    if (!selectedMail) return
    openForward(selectedMail.subject, '')
  }, [selectedMail, openForward])

  const handleDelete = useCallback(async () => {
    if (!selectedMail || !accessToken) return
    try {
      await gmailService.trashMessage(accessToken, selectedMail.id)
      setMailList(mailList.filter((m) => m.id !== selectedMail.id))
      setSelected(null)
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }, [selectedMail, accessToken, mailList, setMailList, setSelected])

  const handleToggleHelp = useCallback(() => {
    setShowShortcuts((prev) => !prev)
  }, [])

  // Build shortcut map — only active when compose modal and shortcut help are closed
  const shortcuts = useMemo(
    () => ({
      j: handleNextMail,
      k: handlePrevMail,
      Enter: handleOpenMail,
      Escape: handleGoBack,
      c: handleCompose,
      r: handleReply,
      f: handleForward,
      'Shift+#': handleDelete,
      'Shift+?': handleToggleHelp,
    }),
    [
      handleNextMail,
      handlePrevMail,
      handleOpenMail,
      handleGoBack,
      handleCompose,
      handleReply,
      handleForward,
      handleDelete,
      handleToggleHelp,
    ],
  )

  useKeyboardShortcuts(shortcuts, !isComposing && !showShortcuts)

  return (
    <>
      <AppShell>
        <MailView />
      </AppShell>
      {isComposing && <ComposeModal onSent={refresh} />}
      <ShortcutHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Keyboard shortcut hint — bottom-right, hidden on mobile */}
      {!isComposing && !selectedMail && (
        <div className="fixed bottom-4 right-4 z-30 hidden md:block">
          <button
            onClick={() => setShowShortcuts(true)}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-gray-600 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 text-xs text-slate-500 dark:text-gray-400 shadow-sm backdrop-blur transition-colors hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('Show keyboard shortcuts', 'Hi\u1EC7n ph\u00EDm t\u1EAFt')}
          >
            <kbd className="rounded border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 px-1.5 py-0.5 font-mono text-[10px] font-semibold">?</kbd>
            <span>{t('Keyboard shortcuts', 'Ph\u00EDm t\u1EAFt')}</span>
          </button>
        </div>
      )}
    </>
  )
}
