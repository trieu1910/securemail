import { useState } from 'react'
import { Inbox, Send, Trash2, PenSquare, ShieldCheck, ShieldAlert, Lock, Key } from 'lucide-react'
import { useMailStore } from '../../store/mailStore'
import { useLang } from '../../hooks/useLang'
import { KeyManager } from '../common/KeyManager'

type FolderId = 'inbox' | 'sent' | 'trash' | 'spam' | 'encrypted-inbox' | 'encrypted-sent'

const folders: { id: FolderId; label: string; Icon: typeof Inbox }[] = [
  { id: 'inbox', label: 'Inbox', Icon: Inbox },
  { id: 'sent', label: 'Sent', Icon: Send },
  { id: 'trash', label: 'Trash', Icon: Trash2 },
  { id: 'spam', label: 'Spam', Icon: ShieldAlert },
]

const encryptedFolders: { id: FolderId; label: string; Icon: typeof Lock }[] = [
  { id: 'encrypted-inbox', label: 'Encrypted Received', Icon: ShieldCheck },
  { id: 'encrypted-sent', label: 'Encrypted Sent', Icon: Lock },
]

export function Sidebar() {
  const { currentFolder, setFolder, toggleCompose, mailList } = useMailStore()
  const { t } = useLang()
  const [showKeyManager, setShowKeyManager] = useState(false)
  const unreadCount = mailList.filter((m) => !m.isRead).length

  function renderFolder(f: { id: FolderId; label: string; Icon: typeof Inbox }, showBadge = false) {
    const isActive = currentFolder === f.id
    return (
      <button
        key={f.id}
        onClick={() => setFolder(f.id)}
        className={`flex w-full items-center justify-center gap-3 rounded-full px-2 py-2 text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-4 md:py-2.5 md:justify-start ${
          isActive
            ? 'bg-gmail-sidebar dark:bg-gray-700 font-bold text-gmail-text dark:text-gray-100'
            : 'text-gmail-text-secondary dark:text-gray-400 hover:bg-gmail-hover dark:hover:bg-gray-700 font-medium'
        }`}
      >
        <f.Icon className="h-4 w-4 md:h-5 md:w-5 shrink-0" />
        <span className="hidden md:inline flex-1 text-left">{f.label}</span>
        {showBadge && unreadCount > 0 && (
          <span className="hidden md:inline text-xs font-bold text-gmail-text">
            {unreadCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <aside className="flex w-12 flex-col items-center gap-1 bg-gmail-bg dark:bg-gray-800 pt-2 md:w-56 md:items-start md:px-3 md:pt-4">
      {/* Compose button */}
      <button
        onClick={toggleCompose}
        className="mb-2 flex items-center justify-center gap-3 rounded-2xl bg-gmail-sidebar dark:bg-gray-700 px-3 py-2.5 text-sm font-medium text-gmail-text dark:text-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:bg-[#d3e3fd] dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all md:mb-4 md:px-6 md:py-3.5 md:w-auto"
      >
        <PenSquare className="h-4 w-4 md:h-5 md:w-5 text-gmail-text dark:text-gray-200" />
        <span className="hidden md:inline">Compose</span>
      </button>

      {/* Main folders */}
      <div className="w-full space-y-0.5">
        {folders.map((f) => renderFolder(f, f.id === 'inbox'))}
      </div>

      {/* Separator */}
      <div className="my-2 hidden md:block w-full border-t border-gmail-border/50 dark:border-gray-700" />

      {/* SecureMail encrypted folders */}
      <p className="hidden md:block px-4 text-xs font-bold uppercase tracking-wider text-gmail-text-secondary dark:text-gray-500 mb-1">
        SecureMail
      </p>
      <div className="w-full space-y-0.5">
        {encryptedFolders.map((f) => renderFolder(f))}
      </div>

      {/* Separator */}
      <div className="my-2 hidden md:block w-full border-t border-gmail-border/50 dark:border-gray-700" />

      {/* Key Management button */}
      <button
        onClick={() => setShowKeyManager(true)}
        className="flex w-full items-center justify-center gap-3 rounded-full px-2 py-2 text-sm font-medium text-gmail-text-secondary dark:text-gray-400 transition-colors hover:bg-gmail-hover dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-4 md:py-2.5 md:justify-start cursor-pointer"
        aria-label={t('Key Management', 'Quản lý khóa')}
      >
        <Key className="h-4 w-4 md:h-5 md:w-5 shrink-0" aria-hidden="true" />
        <span className="hidden md:inline flex-1 text-left">
          {t('Key Management', 'Quản lý khóa')}
        </span>
      </button>

      {/* Key Manager modal */}
      <KeyManager open={showKeyManager} onClose={() => setShowKeyManager(false)} />
    </aside>
  )
}
