import { useEffect, useRef } from 'react'
import { X, ShieldCheck } from 'lucide-react'
import { useLang } from '../../../hooks/useLang'
import { useToast } from '../Toast'
import { MyKeysSection } from './MyKeysSection'
import { TrustedKeysSection } from './TrustedKeysSection'

interface Props {
  open: boolean
  onClose: () => void
}

export function KeyManager({ open, onClose }: Props) {
  const { t } = useLang()
  const { showToast, ToastContainer } = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Trap focus inside modal when open
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <>
      <ToastContainer />
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="key-manager-title"
        tabIndex={-1}
        className="fixed inset-x-4 bottom-0 top-auto z-50 mx-auto max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl animate-slide-up sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-w-2xl sm:w-full sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gmail-border bg-white px-5 py-4 sm:px-6 sm:rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gmail-sidebar">
              <ShieldCheck className="h-5 w-5 text-gmail-blue" aria-hidden="true" />
            </div>
            <h2
              id="key-manager-title"
              className="text-lg font-semibold text-gmail-text"
            >
              {t('Key Management', 'Quản lý khóa')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gmail-text-secondary transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gmail-blue"
            aria-label={t('Close', 'Đóng')}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-8 px-5 py-6 sm:px-6">
          <MyKeysSection onToast={showToast} />
          <div className="border-t border-gmail-border" />
          <TrustedKeysSection onToast={showToast} />
        </div>
      </div>
    </>
  )
}
