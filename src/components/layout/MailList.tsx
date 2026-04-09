import React, { useMemo, useState, useCallback } from 'react'
import { RefreshCw, Lock, MailX, SearchX, Loader2 } from 'lucide-react'
import { useMailStore } from '../../store/mailStore'
import { useMail } from '../../hooks/useMail'
import { Toast } from '../common/Toast'
import { formatDate } from '../../utils/formatDate'
import { extractName } from '../../utils/addressParser'
import type { MailMeta } from '../../types'

function SkeletonRow() {
  return (
    <div className="border-b border-gmail-border/50 dark:border-gray-700 px-3 py-3 space-y-1.5 md:px-4">
      <div className="flex justify-between">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-3 w-12" />
      </div>
      <div className="skeleton h-3 w-3/4" />
      <div className="skeleton h-2.5 w-1/2" />
    </div>
  )
}

const MailRow = React.memo(function MailRow({
  mail,
  selected,
  onSelect,
  isSentFolder,
}: {
  mail: MailMeta
  selected: boolean
  onSelect: (mail: MailMeta) => void
  isSentFolder: boolean
}) {
  const displayName = isSentFolder
    ? `To: ${extractName(mail.to || mail.from)}`
    : extractName(mail.from)
  const isUnread = !mail.isRead

  const handleClick = useCallback(() => {
    onSelect(mail)
  }, [mail, onSelect])

  return (
    <button
      onClick={handleClick}
      className={`group w-full cursor-pointer border-b border-gmail-border/40 dark:border-gray-700 px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset md:px-4 ${
        selected
          ? 'bg-gmail-sidebar/70 dark:bg-gray-700'
          : 'hover:bg-gmail-hover dark:hover:bg-gray-700/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <div className="flex items-center gap-2 min-w-0">
          {isUnread && <div className="h-2 w-2 shrink-0 rounded-full bg-gmail-blue" />}
          <span className={`truncate text-[13px] ${isUnread ? 'font-bold text-gmail-text dark:text-gray-100' : 'text-gmail-text-secondary dark:text-gray-400'}`}>
            {displayName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {mail.isEncrypted && <Lock className="h-3.5 w-3.5 text-gmail-blue" />}
          <span className="text-xs text-gmail-text-secondary dark:text-gray-500">{formatDate(mail.date)}</span>
        </div>
      </div>
      <p className={`truncate text-[13px] ${isUnread ? 'font-semibold text-gmail-text dark:text-gray-100' : 'text-gmail-text-secondary dark:text-gray-400'}`}>
        {mail.subject}
      </p>
      <p className="mt-0.5 truncate text-xs text-gmail-text-secondary/70 dark:text-gray-500">{mail.snippet}</p>
    </button>
  )
})

export function MailList() {
  const { selectedMail, isLoading, setSelected, currentFolder, searchQuery } = useMailStore()
  const { mailList, refresh, loadMore, hasMore, loadingMore, error, clearError } = useMail()
  const [refreshing, setRefreshing] = useState(false)

  const handleSelect = useCallback((mail: MailMeta) => {
    setSelected({ ...mail, body: '', headers: {} })
  }, [setSelected])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }
  const folderLabels: Record<string, string> = {
    inbox: 'Inbox',
    sent: 'Sent',
    trash: 'Trash',
    'encrypted-inbox': 'Encrypted Received',
    'encrypted-sent': 'Encrypted Sent',
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return mailList
    return mailList.filter((m) =>
      m.subject.toLowerCase().includes(q) ||
      m.from.toLowerCase().includes(q) ||
      m.snippet.toLowerCase().includes(q)
    )
  }, [mailList, searchQuery])

  const isSearching = searchQuery.trim().length > 0
  const isSentFolder = currentFolder === 'sent' || currentFolder === 'encrypted-sent'

  return (
    <div className="h-full w-full border-x border-gmail-border/50 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto flex flex-col md:w-80">
      <div className="flex items-center justify-between border-b border-gmail-border/50 dark:border-gray-700 px-3 py-2.5 md:px-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-gmail-text-secondary dark:text-gray-400">
          {isSearching ? `Results (${filtered.length})` : folderLabels[currentFolder]}
        </h2>
        <button
          aria-label="Refresh"
          onClick={handleRefresh}
          disabled={refreshing}
          className="cursor-pointer rounded-full p-2 text-gmail-text-secondary dark:text-gray-400 hover:bg-gmail-hover dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading && (
        <div className="flex-1">
          {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gmail-text-secondary dark:text-gray-400">
          {isSearching ? (
            <>
              <SearchX className="h-10 w-10 text-gmail-border" />
              <p className="text-sm">No results for "{searchQuery}"</p>
            </>
          ) : (
            <>
              <MailX className="h-10 w-10 text-gmail-border" />
              <p className="text-sm">No messages</p>
            </>
          )}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="flex-1">
          {filtered.map((mail) => (
            <MailRow
              key={mail.id}
              mail={mail}
              selected={selectedMail?.id === mail.id}
              isSentFolder={isSentFolder}
              onSelect={handleSelect}
            />
          ))}
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium cursor-pointer transition-colors disabled:cursor-default"
            >
              {loadingMore ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                'Load more'
              )}
            </button>
          )}
        </div>
      )}

      {error && (
        <Toast message={error} type="error" onDismiss={clearError} />
      )}
    </div>
  )
}
