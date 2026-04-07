import { useState, useRef } from 'react'
import { PenSquare, X, Lock, Paperclip, FileText } from 'lucide-react'
import { useMailStore } from '../../store/mailStore'
import { cryptoService } from '../../services/cryptoService'
import { gmailService } from '../../services/gmailService'
import { buildMimeMessage, buildReplyMimeMessage } from '../../utils/mimeBuilder'
import { PasswordLock } from './PasswordLock'
import { Spinner } from '../common/Spinner'

interface Props { onSent: () => void }

export function ComposeModal({ onSent }: Props) {
  const { toggleCompose, user, accessToken, composeMode, composeTo, composeSubject, composeBody, replyMessageId } = useMailStore()
  const [to, setTo] = useState(composeTo)
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [subject, setSubject] = useState(composeSubject)
  const [body, setBody] = useState(composeBody)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const totalFileSize = files.reduce((sum, f) => sum + f.size, 0)

  const canSend = to && subject && body && password.length >= 8 && password === confirm

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!canSend || !user || !accessToken) return
    setSending(true)
    setError('')
    try {
      const payload = await cryptoService.encrypt(body, password, subject, files)
      const raw = composeMode === 'reply' && replyMessageId
        ? buildReplyMimeMessage(user.email, to, payload, replyMessageId)
        : buildMimeMessage(user.email, to, payload, cc, bcc)
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
            <h2 className="text-sm font-medium">
              {composeMode === 'reply' ? 'Reply' : composeMode === 'forward' ? 'Forward' : 'New Message'}
            </h2>
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
              readOnly={composeMode === 'reply'}
              className={`flex-1 text-sm text-gmail-text outline-none placeholder:text-gmail-text-secondary/50${composeMode === 'reply' ? ' bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="recipient@gmail.com"
            />
            {!showCcBcc && (
              <span
                onClick={() => setShowCcBcc(true)}
                className="text-xs text-gmail-text-secondary cursor-pointer hover:underline select-none"
              >
                Cc Bcc
              </span>
            )}
          </div>

          {/* Cc */}
          {showCcBcc && (
            <div className="flex items-center gap-2 border-b border-gmail-border/50 pb-2">
              <label className="text-sm text-gmail-text-secondary">Cc</label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="flex-1 text-sm text-gmail-text outline-none placeholder:text-gmail-text-secondary/50"
                placeholder="cc@gmail.com"
              />
            </div>
          )}

          {/* Bcc */}
          {showCcBcc && (
            <div className="flex items-center gap-2 border-b border-gmail-border/50 pb-2">
              <label className="text-sm text-gmail-text-secondary">Bcc</label>
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="flex-1 text-sm text-gmail-text outline-none placeholder:text-gmail-text-secondary/50"
                placeholder="bcc@gmail.com"
              />
            </div>
          )}

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

          {/* File attachments */}
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
                  e.target.value = ''
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gmail-text-secondary hover:bg-gmail-hover transition-colors"
            >
              <Paperclip className="h-4 w-4" />
              Attach files
            </button>
            {files.length > 0 && (
              <div className="space-y-1.5">
                {files.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-sm">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate text-gmail-text">{file.name}</span>
                    <span className="text-xs text-gmail-text-secondary shrink-0">
                      {file.size < 1024 ? `${file.size} B` : file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1048576).toFixed(1)} MB`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="ml-auto shrink-0 rounded-full p-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {totalFileSize > 15 * 1024 * 1024 && (
                  <p className="text-xs text-amber-600 font-medium">
                    Total size ({(totalFileSize / 1048576).toFixed(1)} MB) exceeds 15 MB. The email may fail to send.
                  </p>
                )}
              </div>
            )}
          </div>

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
