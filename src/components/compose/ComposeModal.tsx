import { useState } from 'react'
import { PenSquare, X, Lock } from 'lucide-react'
import { useMailStore } from '../../store/mailStore'
import { cryptoService } from '../../services/cryptoService'
import { gmailService } from '../../services/gmailService'
import { buildMimeMessage } from '../../utils/mimeBuilder'
import { PasswordLock } from './PasswordLock'
import { Spinner } from '../common/Spinner'

interface Props { onSent: () => void }

export function ComposeModal({ onSent }: Props) {
  const { toggleCompose, user, accessToken } = useMailStore()
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const canSend = to && subject && body && password.length >= 8 && password === confirm

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!canSend || !user || !accessToken) return
    setSending(true)
    setError('')
    try {
      const payload = await cryptoService.encrypt(body, password, subject)
      const raw = buildMimeMessage(user.email, to, payload)
      await gmailService.sendMessage(accessToken, raw)
      toggleCompose()
      onSent()
    } catch {
      setError('Failed to send. Check the recipient address and try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20" onClick={toggleCompose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-2xl bg-white shadow-2xl animate-slide-up flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gmail-text px-4 py-3 sm:px-5 shrink-0">
          <div className="flex items-center gap-2 text-white">
            <PenSquare className="h-4 w-4" />
            <h2 className="text-sm font-medium">New Message</h2>
          </div>
          <button onClick={toggleCompose} aria-label="Close" className="cursor-pointer rounded-full p-1 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-3 p-4 sm:p-5 overflow-y-auto flex-1">
          {/* To */}
          <div className="flex items-center gap-2 border-b border-gmail-border/50 pb-2">
            <label className="text-sm text-gmail-text-secondary">To</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              className="flex-1 text-sm text-gmail-text outline-none placeholder:text-gmail-text-secondary/50"
              placeholder="recipient@gmail.com"
            />
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2 border-b border-gmail-border/50 pb-2">
            <label className="text-sm text-gmail-text-secondary">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="flex-1 text-sm text-gmail-text outline-none placeholder:text-gmail-text-secondary/50"
              placeholder="Subject (will be encrypted)"
            />
          </div>

          <p className="flex items-center gap-1 text-xs text-amber-600">
            <Lock className="h-3 w-3" />
            Subject is encrypted together with the message body
          </p>

          {/* Body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={8}
            placeholder="Your message..."
            className="w-full text-sm text-gmail-text outline-none placeholder:text-gmail-text-secondary/50 resize-none min-h-[160px]"
          />

          <div className="border-t border-gmail-border/50 pt-3 space-y-3">
            {/* Encryption mode indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-full bg-gray-50 border border-gmail-border px-3 py-1 font-semibold text-gmail-text-secondary">
                <Lock className="h-3 w-3" />
                Password Encryption (AES-256-GCM)
              </span>
            </div>

            <PasswordLock
              password={password}
              confirm={confirm}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirm}
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-gmail-red">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={!canSend || sending}
              className="flex items-center gap-2 rounded-full bg-gmail-blue px-6 py-2.5 text-sm font-medium text-white hover:bg-gmail-blue-hover hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sending ? <Spinner size="sm" /> : <Lock className="h-4 w-4" />}
              {sending ? 'Encrypting...' : 'Encrypt & Send'}
            </button>
            <button type="button" onClick={toggleCompose} className="rounded-full px-4 py-2.5 text-sm text-gmail-text-secondary hover:bg-gmail-hover transition-colors">
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
