import { useEffect, useRef } from 'react'
import { X, Keyboard } from 'lucide-react'
import { useLang } from '../../hooks/useLang'

interface ShortcutHelpProps {
  open: boolean
  onClose: () => void
}

interface ShortcutEntry {
  key: string
  en: string
  vi: string
}

const SHORTCUTS: ShortcutEntry[] = [
  { key: 'j', en: 'Next message', vi: 'Tin ti\u1EBFp theo' },
  { key: 'k', en: 'Previous message', vi: 'Tin tr\u01B0\u1EDBc \u0111\u00F3' },
  { key: 'Enter', en: 'Open message', vi: 'M\u1EDF tin nh\u1EAFn' },
  { key: 'Escape', en: 'Go back / Close', vi: 'Quay l\u1EA1i / \u0110\u00F3ng' },
  { key: 'c', en: 'Compose new', vi: 'So\u1EA1n m\u1EDBi' },
  { key: 'r', en: 'Reply', vi: 'Tr\u1EA3 l\u1EDDi' },
  { key: 'f', en: 'Forward', vi: 'Chuy\u1EC3n ti\u1EBFp' },
  { key: '#', en: 'Delete', vi: 'X\u00F3a' },
  { key: '?', en: 'Show shortcuts', vi: 'Hi\u1EC7n ph\u00EDm t\u1EAFt' },
]

export function ShortcutHelp({ open, onClose }: ShortcutHelpProps) {
  const { t } = useLang()
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Trap focus and handle Escape
  useEffect(() => {
    if (!open) return

    // Focus the close button when modal opens
    closeButtonRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={t('Keyboard Shortcuts', 'Ph\u00EDm t\u1EAFt')}
    >
      <div className="relative mx-4 w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-700 px-5 py-4">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-gmail-blue" />
            <h2 className="text-base font-semibold text-gmail-text dark:text-gray-100">
              {t('Keyboard Shortcuts', 'Ph\u00EDm t\u1EAFt')}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 dark:text-gray-500 hover:bg-slate-100 dark:hover:bg-gray-700 hover:text-slate-600 dark:hover:text-gray-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('Close', '\u0110\u00F3ng')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="px-5 py-4">
          <table className="w-full" role="presentation">
            <tbody>
              {SHORTCUTS.map((shortcut) => (
                <tr key={shortcut.key} className="group">
                  <td className="py-1.5 pr-4">
                    <kbd className="inline-flex min-w-[2rem] items-center justify-center rounded-md border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 px-2 py-1 font-mono text-xs font-semibold text-slate-700 dark:text-gray-200 shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </td>
                  <td className="py-1.5 text-sm text-slate-600 dark:text-gray-300">
                    {t(shortcut.en, shortcut.vi)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-100 dark:border-gray-700 px-5 py-3">
          <p className="text-center text-xs text-slate-400 dark:text-gray-500">
            {t(
              'Shortcuts are disabled while typing in input fields',
              'Ph\u00EDm t\u1EAFt b\u1ECB t\u1EAFt khi \u0111ang nh\u1EADp li\u1EC7u',
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
