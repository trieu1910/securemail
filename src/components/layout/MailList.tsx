import { useMemo } from 'react'
import { RefreshCw, Lock, MailX, SearchX } from 'lucide-react'
import { useMailStore } from '../../store/mailStore'
import { formatDate } from '../../utils/formatDate'
import type { MailMeta } from '../../types'

function SkeletonRow() {
  return (
    <div className="border-b border-gmail-border/50 px-3 py-3 space-y-1.5 md:px-4">
      <div className="flex justify-between">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-3 w-12" />
      </div>
      <div className="skeleton h-3 w-3/4" />
      <div className="skeleton h-2.5 w-1/2" />
    </div>
  )
}

function extractName(addr: string): string {
  const match = addr.match(/^"?([^"<]+)"?\s*</)
  return match ? match[1].trim() : addr.split('@')[0]
}

function MailRow({
  mail,
  selected,
  onClick,
  isSentFolder,
}: {
  mail: MailMeta
  selected: boolean
  onClick: () => void
  isSentFolder: boolean
}) {
  const displayName = isSentFolder
    ? `To: ${extractName(mail.to || mail.from)}`
    : extractName(mail.from)
  const isUnread = !mail.isRead

  return (
    <button
      onClick={onClick}
      className={`group w-full cursor-pointer border-b border-gmail-border/40 px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset md:px-4 ${
        selected
          ? 'bg-gmail-sidebar/70'
          : 'hover:bg-gmail-hover'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <div className="flex items-center gap-2 min-w-0">
          {isUnread && <div className="h-2 w-2 shrink-0 rounded-full bg-gmail-blue" />}
          <span className={`truncate text-[13px] ${isUnread ? 'font-bold text-gmail-text' : 'text-gmail-text-secondary'}`}>
            {displayName}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {mail.isEncrypted && <Lock className="h-3.5 w-3.5 text-gmail-blue" />}
          <span className="text-xs text-gmail-text-secondary">{formatDate(mail.date)}</span>
        </div>
      </div>
      <p className={`truncate text-[13px] ${isUnread ? 'font-semibold text-gmail-text' : 'text-gmail-text-secondary'}`}>
        {mail.subject}
      </p>
      <p className="mt-0.5 truncate text-xs text-gmail-text-secondary/70">{mail.snippet}</p>
    </button>
  )
}

export function MailList() {
  const { mailList, selectedMail, isLoading, setSelected, currentFolder, searchQuery } = useMailStore()
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
    <div className="h-full w-full border-x border-gmail-border/50 bg-white overflow-y-auto flex flex-col md:w-80">
      <div className="flex items-center justify-between border-b border-gmail-border/50 px-3 py-2.5 md:px-4">
        <h2 className="text-xs font-bold uppercase tracking-wide text-gmail-text-secondary">
          {isSearching ? `Results (${filtered.length})` : folderLabels[currentFolder]}
        </h2>
        <button aria-label="Refresh" className="cursor-pointer rounded-full p-2 text-gmail-text-secondary hover:bg-gmail-hover transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {isLoading && (
        <div className="flex-1">
          {[...Array(8)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gmail-text-secondary">
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
              onClick={() => setSelected({ ...mail, body: '', headers: {} })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
