import { Inbox, Send, Trash2, PenSquare, ShieldCheck, ShieldAlert, Lock } from 'lucide-react'
import { useMailStore } from '../../store/mailStore'

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
  const unreadCount = mailList.filter((m) => !m.isRead).length

  function renderFolder(f: { id: FolderId; label: string; Icon: typeof Inbox }, showBadge = false) {
    const isActive = currentFolder === f.id
    return (
      <button
        key={f.id}
        onClick={() => setFolder(f.id)}
        className={`flex w-full items-center justify-center gap-3 rounded-full px-2 py-2 text-sm cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 md:px-4 md:py-2.5 md:justify-start ${
          isActive
            ? 'bg-gmail-sidebar font-bold text-gmail-text'
            : 'text-gmail-text-secondary hover:bg-gmail-hover font-medium'
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
    <aside className="flex w-12 flex-col items-center gap-1 bg-gmail-bg pt-2 md:w-56 md:items-start md:px-3 md:pt-4">
      {/* Compose button */}
      <button
        onClick={toggleCompose}
        className="mb-2 flex items-center justify-center gap-3 rounded-2xl bg-gmail-sidebar px-3 py-2.5 text-sm font-medium text-gmail-text shadow-sm cursor-pointer hover:shadow-md hover:bg-[#d3e3fd] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all md:mb-4 md:px-6 md:py-3.5 md:w-auto"
      >
        <PenSquare className="h-4 w-4 md:h-5 md:w-5 text-gmail-text" />
        <span className="hidden md:inline">Compose</span>
      </button>

      {/* Main folders */}
      <div className="w-full space-y-0.5">
        {folders.map((f) => renderFolder(f, f.id === 'inbox'))}
      </div>

      {/* Separator */}
      <div className="my-2 hidden md:block w-full border-t border-gmail-border/50" />

      {/* SecureMail encrypted folders */}
      <p className="hidden md:block px-4 text-xs font-bold uppercase tracking-wider text-gmail-text-secondary mb-1">
        SecureMail
      </p>
      <div className="w-full space-y-0.5">
        {encryptedFolders.map((f) => renderFolder(f))}
      </div>
    </aside>
  )
}
