import { Inbox, Send, Trash2, ShieldCheck, ShieldAlert, Lock, PenSquare } from 'lucide-react'
import { useMailStore } from '../../store/mailStore'

type FolderId = 'inbox' | 'sent' | 'trash' | 'spam' | 'encrypted-inbox' | 'encrypted-sent'

const items: { id: FolderId; label: string; Icon: typeof Inbox }[] = [
  { id: 'inbox', label: 'Inbox', Icon: Inbox },
  { id: 'sent', label: 'Sent', Icon: Send },
  { id: 'trash', label: 'Trash', Icon: Trash2 },
  { id: 'spam', label: 'Spam', Icon: ShieldAlert },
  { id: 'encrypted-inbox', label: 'Encrypted', Icon: ShieldCheck },
  { id: 'encrypted-sent', label: 'Enc. Sent', Icon: Lock },
]

export function MobileNav() {
  const { currentFolder, setFolder, toggleCompose } = useMailStore()

  return (
    <nav className="flex items-center justify-around border-t border-gmail-border/50 dark:border-gray-700 bg-white dark:bg-gray-800 px-1 py-2 md:hidden">
      {items.map((item) => {
        const isActive = currentFolder === item.id
        return (
          <button
            key={item.id}
            onClick={() => setFolder(item.id)}
            className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
              isActive
                ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <item.Icon className="h-5 w-5" />
            <span className="leading-tight">{item.label}</span>
          </button>
        )
      })}
      <button
        onClick={toggleCompose}
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 text-[10px] font-medium text-white bg-blue-600 cursor-pointer hover:bg-blue-700 transition-colors"
      >
        <PenSquare className="h-5 w-5" />
        <span className="leading-tight">Compose</span>
      </button>
    </nav>
  )
}
