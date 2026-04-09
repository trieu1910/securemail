import { useState, useRef, useEffect } from 'react'
import { PenSquare, X, Lock, Paperclip, FileText, Key, ShieldCheck, AlertTriangle, Upload } from 'lucide-react'
import { useMailStore } from '../../store/mailStore'
import { cryptoService } from '../../services/cryptoService'
import { gmailService } from '../../services/gmailService'
import { buildMimeMessage, buildReplyMimeMessage } from '../../utils/mimeBuilder'
import { keyStore } from '../../utils/keyStore'
import type { SavedKey, OwnKeys } from '../../utils/keyStore'
import { PasswordLock } from './PasswordLock'
import { Spinner } from '../common/Spinner'
import { useLang } from '../../hooks/useLang'

interface Props { onSent: () => void }

export function ComposeModal({ onSent }: Props) {
  const { t } = useLang()
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
  const [isDragging, setIsDragging] = useState(false)
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setInterval> | null>(null)
  const [sendCountdown, setSendCountdown] = useState(0)

  // RSA mode state
  const [encryptionMode, setEncryptionMode] = useState<'password' | 'rsa'>('password')
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>([])
  const [selectedRecipientKey, setSelectedRecipientKey] = useState<string>('')
  const [recipientFingerprint, setRecipientFingerprint] = useState<string>('')

  // Signing state
  const [signMessage, setSignMessage] = useState(false)
  const [ownKeys, setOwnKeys] = useState<OwnKeys>({})

  const totalFileSize = files.reduce((sum, f) => sum + f.size, 0)

  // Load saved keys and own keys
  useEffect(() => {
    const rsaKeys = keyStore.getAll().filter((k) => k.keyType === 'rsa')
    setSavedKeys(rsaKeys)
    setOwnKeys(keyStore.getOwnKeys())
  }, [])

  // Auto-select recipient key when "to" changes
  useEffect(() => {
    if (encryptionMode === 'rsa' && to) {
      const matchedKey = keyStore.getByEmail(to, 'rsa')
      if (matchedKey) {
        setSelectedRecipientKey(matchedKey)
      } else {
        setSelectedRecipientKey('')
      }
    }
  }, [to, encryptionMode])

  // Compute fingerprint for selected recipient key
  useEffect(() => {
    if (selectedRecipientKey) {
      keyStore.getFingerprint(selectedRecipientKey)
        .then(setRecipientFingerprint)
        .catch(() => setRecipientFingerprint(''))
    } else {
      setRecipientFingerprint('')
    }
  }, [selectedRecipientKey])

  const hasSigningKeys = Boolean(ownKeys.ecdsaPublicKey && ownKeys.ecdsaPrivateKey)

  const HARD_LIMIT = 25 * 1024 * 1024 // 25 MB
  const isOverSizeLimit = totalFileSize > HARD_LIMIT

  const canSendPassword = to && subject && body && password.length >= 8 && password === confirm && !isOverSizeLimit
  const canSendRSA = to && subject && body && selectedRecipientKey && !isOverSizeLimit
  const canSend = encryptionMode === 'password' ? canSendPassword : canSendRSA

  // Cleanup undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimer) clearInterval(undoTimer)
    }
  }, [undoTimer])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!canSend || !user || !accessToken) return
    setSending(true)
    setError('')
    try {
      let payload

      if (encryptionMode === 'password') {
        // Password mode — existing behavior
        payload = await cryptoService.encrypt(body, password, subject, files)
      } else {
        // RSA mode
        payload = await cryptoService.encryptRSA(body, selectedRecipientKey, subject, files, to)
      }

      // Sign if requested
      if (signMessage && hasSigningKeys && ownKeys.ecdsaPrivateKey && ownKeys.ecdsaPublicKey) {
        const dataToSign = payload.ciphertext + payload.iv + payload.encryptedKey
        const signature = await cryptoService.sign(dataToSign, ownKeys.ecdsaPrivateKey)
        payload = {
          ...payload,
          signature,
          signerPublicKey: ownKeys.ecdsaPublicKey,
        }
      }

      const raw = composeMode === 'reply' && replyMessageId
        ? buildReplyMimeMessage(user.email, to, payload, replyMessageId)
        : buildMimeMessage(user.email, to, payload, cc, bcc)

      // Start undo-send countdown instead of sending immediately
      setSending(false)
      setSendCountdown(7)
      let count = 7
      const interval = setInterval(() => {
        count--
        setSendCountdown(count)
        if (count <= 0) {
          clearInterval(interval)
          actualSend(raw)
        }
      }, 1000)
      setUndoTimer(interval)
    } catch {
      setError(t(
        'Failed to send. Check the recipient address and try again.',
        'Gửi thất bại. Kiểm tra địa chỉ người nhận và thử lại.'
      ))
      setSending(false)
    }
  }

  function handleUndoSend() {
    if (undoTimer) {
      clearInterval(undoTimer)
      setUndoTimer(null)
      setSendCountdown(0)
      // Don't close modal, don't reset form
    }
  }

  async function actualSend(raw: string) {
    setUndoTimer(null)
    setSendCountdown(0)
    try {
      await gmailService.sendMessage(accessToken!, raw)
      toggleCompose()
      onSent()
    } catch {
      setError(t(
        'Failed to send. Check the recipient address and try again.',
        'Gửi thất bại. Kiểm tra địa chỉ người nhận và thử lại.'
      ))
    }
  }

  function handleRecipientKeySelect(email: string) {
    const key = keyStore.getByEmail(email, 'rsa')
    if (key) {
      setSelectedRecipientKey(key)
      // Also set the "to" field if empty
      if (!to) setTo(email)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:justify-center sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20" onClick={toggleCompose} />

      {/* Modal — full-screen on mobile, centered on sm+ */}
      <div
        className="safe-bottom relative w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[90vh] sm:rounded-2xl bg-white dark:bg-gray-800 shadow-2xl animate-slide-up flex flex-col"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={(e) => { if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false) }}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files.length > 0) {
            setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)])
          }
        }}
      >
        {/* Drag & drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center sm:rounded-2xl border-2 border-dashed border-gmail-blue bg-blue-50/80 dark:bg-blue-900/40">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-gmail-blue" />
              <p className="mt-2 text-sm font-medium text-gmail-blue">
                {t('Drop files here', 'Thả file vào đây')}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-gmail-text px-4 py-3 sm:px-5 shrink-0">
          <div className="flex items-center gap-2 text-white">
            <PenSquare className="h-4 w-4" />
            <h2 className="text-sm font-medium">
              {composeMode === 'reply'
                ? t('Reply', 'Trả lời')
                : composeMode === 'forward'
                  ? t('Forward', 'Chuyển tiếp')
                  : t('New Message', 'Soạn thư mới')}
            </h2>
          </div>
          <button onClick={toggleCompose} aria-label={t('Close', 'Đóng')} className="cursor-pointer rounded-full p-1 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-3 p-4 sm:p-5 overflow-y-auto flex-1">
          {/* To */}
          <div className="flex items-center gap-2 border-b border-gmail-border/50 dark:border-gray-600 pb-2">
            <label className="text-sm text-gmail-text-secondary dark:text-gray-400">{t('To', 'Đến')}</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
              readOnly={composeMode === 'reply'}
              className={`flex-1 text-sm text-gmail-text dark:text-gray-100 bg-transparent outline-none placeholder:text-gmail-text-secondary/50 dark:placeholder:text-gray-500${composeMode === 'reply' ? ' bg-gray-50 dark:bg-gray-700 cursor-not-allowed' : ''}`}
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
            <div className="flex items-center gap-2 border-b border-gmail-border/50 dark:border-gray-600 pb-2">
              <label className="text-sm text-gmail-text-secondary dark:text-gray-400">Cc</label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="flex-1 text-sm text-gmail-text dark:text-gray-100 bg-transparent outline-none placeholder:text-gmail-text-secondary/50 dark:placeholder:text-gray-500"
                placeholder="cc@gmail.com"
              />
            </div>
          )}

          {/* Bcc */}
          {showCcBcc && (
            <div className="flex items-center gap-2 border-b border-gmail-border/50 dark:border-gray-600 pb-2">
              <label className="text-sm text-gmail-text-secondary dark:text-gray-400">Bcc</label>
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="flex-1 text-sm text-gmail-text dark:text-gray-100 bg-transparent outline-none placeholder:text-gmail-text-secondary/50 dark:placeholder:text-gray-500"
                placeholder="bcc@gmail.com"
              />
            </div>
          )}

          {/* Subject */}
          <div className="flex items-center gap-2 border-b border-gmail-border/50 dark:border-gray-600 pb-2">
            <label className="text-sm text-gmail-text-secondary dark:text-gray-400">{t('Subject', 'Chủ đề')}</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="flex-1 text-sm text-gmail-text dark:text-gray-100 bg-transparent outline-none placeholder:text-gmail-text-secondary/50 dark:placeholder:text-gray-500"
              placeholder={t('Subject (will be encrypted)', 'Chủ đề (sẽ được mã hóa)')}
            />
          </div>

          <p className="flex items-center gap-1 text-xs text-amber-600">
            <Lock className="h-3 w-3" />
            {t('Subject is encrypted together with the message body', 'Chủ đề được mã hóa cùng nội dung tin nhắn')}
          </p>

          {/* Body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={8}
            placeholder={t('Your message...', 'Nội dung tin nhắn...')}
            className="w-full text-sm text-gmail-text dark:text-gray-100 bg-transparent outline-none placeholder:text-gmail-text-secondary/50 dark:placeholder:text-gray-500 resize-none min-h-[160px]"
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
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gmail-text-secondary dark:text-gray-400 hover:bg-gmail-hover dark:hover:bg-gray-700 transition-colors"
            >
              <Paperclip className="h-4 w-4" />
              {t('Attach files', 'Đính kèm tệp')}
            </button>
            {files.length > 0 && (
              <div className="space-y-1.5">
                {files.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 px-3 py-1.5 text-sm">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="truncate text-gmail-text dark:text-gray-100">{file.name}</span>
                    <span className="text-xs text-gmail-text-secondary dark:text-gray-400 shrink-0">
                      {file.size < 1024 ? `${file.size} B` : file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1048576).toFixed(1)} MB`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="ml-auto shrink-0 rounded-full p-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      aria-label={t(`Remove ${file.name}`, `Xóa ${file.name}`)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {isOverSizeLimit && (
                  <p className="text-xs text-red-600 font-semibold">
                    {t(
                      `Total size (${(totalFileSize / 1048576).toFixed(1)} MB) exceeds 25 MB limit. Remove some files to send.`,
                      `Tổng kích thước (${(totalFileSize / 1048576).toFixed(1)} MB) vượt giới hạn 25 MB. Hãy xóa bớt tệp để gửi.`
                    )}
                  </p>
                )}
                {!isOverSizeLimit && totalFileSize > 15 * 1024 * 1024 && (
                  <p className="text-xs text-amber-600 font-medium">
                    {t(
                      `Total size (${(totalFileSize / 1048576).toFixed(1)} MB) exceeds 15 MB. The email may fail to send.`,
                      `Tổng kích thước (${(totalFileSize / 1048576).toFixed(1)} MB) vượt 15 MB. Email có thể gửi thất bại.`
                    )}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gmail-border/50 dark:border-gray-600 pt-3 space-y-3">
            {/* Encryption mode toggle */}
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-700 p-1" role="radiogroup" aria-label={t('Encryption mode', 'Chế độ mã hóa')}>
              <button
                type="button"
                role="radio"
                aria-checked={encryptionMode === 'password'}
                onClick={() => setEncryptionMode('password')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-gmail-blue/30 ${
                  encryptionMode === 'password'
                    ? 'bg-white dark:bg-gray-600 text-gmail-text dark:text-gray-100 shadow-sm'
                    : 'text-gmail-text-secondary dark:text-gray-400 hover:text-gmail-text dark:hover:text-gray-200'
                }`}
              >
                <Lock className="h-3 w-3" />
                {t('Password', 'Mật khẩu')}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={encryptionMode === 'rsa'}
                onClick={() => setEncryptionMode('rsa')}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-gmail-blue/30 ${
                  encryptionMode === 'rsa'
                    ? 'bg-white dark:bg-gray-600 text-gmail-text dark:text-gray-100 shadow-sm'
                    : 'text-gmail-text-secondary dark:text-gray-400 hover:text-gmail-text dark:hover:text-gray-200'
                }`}
              >
                <Key className="h-3 w-3" />
                {t('Public Key (RSA)', 'Khóa công khai (RSA)')}
              </button>
            </div>

            {/* Encryption mode indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 rounded-full bg-gray-50 dark:bg-gray-700 border border-gmail-border dark:border-gray-600 px-3 py-1 font-semibold text-gmail-text-secondary dark:text-gray-400">
                <Lock className="h-3 w-3" />
                {encryptionMode === 'password'
                  ? t('Password Encryption (AES-256-GCM)', 'Mã hóa bằng mật khẩu (AES-256-GCM)')
                  : t('RSA-OAEP 4096-bit + AES-256-GCM', 'RSA-OAEP 4096-bit + AES-256-GCM')}
              </span>
            </div>

            {/* Password mode fields */}
            {encryptionMode === 'password' && (
              <PasswordLock
                password={password}
                confirm={confirm}
                onPasswordChange={setPassword}
                onConfirmChange={setConfirm}
              />
            )}

            {/* RSA mode fields */}
            {encryptionMode === 'rsa' && (
              <div className="space-y-3">
                {savedKeys.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {t(
                        'No recipient keys. Import keys in Key Manager.',
                        'Chưa có khóa người nhận. Nhập khóa trong Quản lý khóa.'
                      )}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gmail-text dark:text-gray-100">
                      {t('Recipient public key', 'Khóa công khai người nhận')}
                    </label>
                    <select
                      value={savedKeys.find((k) => k.pem === selectedRecipientKey)?.email ?? ''}
                      onChange={(e) => handleRecipientKeySelect(e.target.value)}
                      className="w-full rounded-lg border border-gmail-border dark:border-gray-600 px-3 py-2.5 text-sm text-gmail-text dark:text-gray-100 outline-none focus:ring-2 focus:ring-gmail-blue/20 focus:border-gmail-blue transition-all bg-white dark:bg-gray-700"
                      aria-label={t('Select recipient key', 'Chọn khóa người nhận')}
                    >
                      <option value="">
                        {t('-- Select recipient --', '-- Chọn người nhận --')}
                      </option>
                      {savedKeys.map((k) => (
                        <option key={`${k.email}-${k.savedAt}`} value={k.email}>
                          {k.email}
                        </option>
                      ))}
                    </select>

                    {/* Show selected key info */}
                    {selectedRecipientKey && recipientFingerprint && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2">
                        <Key className="h-3.5 w-3.5 text-gmail-blue shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gmail-text dark:text-gray-100 truncate">
                            {savedKeys.find((k) => k.pem === selectedRecipientKey)?.email}
                          </p>
                          <p className="text-[10px] text-gmail-text-secondary dark:text-gray-400 font-mono">
                            {t('Fingerprint:', 'Vân tay:')} {recipientFingerprint}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sign message checkbox */}
            <div className="flex items-center gap-2">
              <label className="relative flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={signMessage}
                  onChange={(e) => setSignMessage(e.target.checked)}
                  disabled={!hasSigningKeys}
                  className="sr-only peer"
                  aria-label={t('Sign this message', 'Ký số tin nhắn')}
                />
                <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
                  signMessage
                    ? 'border-gmail-blue bg-gmail-blue'
                    : hasSigningKeys
                      ? 'border-gray-300 group-hover:border-gmail-blue/50'
                      : 'border-gray-200 bg-gray-50'
                } peer-focus-visible:ring-2 peer-focus-visible:ring-gmail-blue/30`}>
                  {signMessage && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className={`h-3.5 w-3.5 ${hasSigningKeys ? 'text-gmail-text-secondary' : 'text-gray-300'}`} />
                  <span className={`text-xs font-medium ${hasSigningKeys ? 'text-gmail-text dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {t('Sign this message', 'Ký số tin nhắn')}
                  </span>
                </div>
              </label>
              {!hasSigningKeys && (
                <span
                  className="text-[10px] text-amber-600 italic"
                  title={t(
                    'Generate signing keys in Key Manager first',
                    'Tạo khóa ký số trong Quản lý khóa trước'
                  )}
                >
                  {t('(Generate signing keys in Key Manager first)', '(Tạo khóa ký số trong Quản lý khóa trước)')}
                </span>
              )}
            </div>
          </div>

          {error && <p className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-gmail-red">{error}</p>}

          {/* Undo send countdown bar */}
          {sendCountdown > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-gmail-blue px-4 py-2 text-white">
              <span className="text-sm">
                {t(`Sending in ${sendCountdown}s...`, `Gửi trong ${sendCountdown}s...`)}
              </span>
              <button
                type="button"
                onClick={handleUndoSend}
                className="rounded bg-white px-3 py-1 text-sm font-medium text-gmail-blue hover:bg-gray-100 transition-colors"
              >
                {t('Undo', 'Hoàn tác')}
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={!canSend || sending || sendCountdown > 0}
              className="flex items-center gap-2 rounded-full bg-gmail-blue px-6 py-2.5 text-sm font-medium text-white hover:bg-gmail-blue-hover hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sending ? <Spinner size="sm" /> : <Lock className="h-4 w-4" />}
              {sending
                ? t('Encrypting...', 'Đang mã hóa...')
                : t('Encrypt & Send', 'Mã hóa & Gửi')}
            </button>
            <button type="button" onClick={toggleCompose} className="rounded-full px-4 py-2.5 text-sm text-gmail-text-secondary dark:text-gray-400 hover:bg-gmail-hover dark:hover:bg-gray-700 transition-colors">
              {t('Discard', 'Hủy bỏ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
