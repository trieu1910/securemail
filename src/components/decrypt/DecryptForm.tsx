import { useState, useRef, useEffect } from 'react'
import { Unlock, Key, AlertTriangle } from 'lucide-react'
import { Spinner } from '../common/Spinner'
import { keyStore } from '../../utils/keyStore'
import { useLang } from '../../hooks/useLang'
import type { CryptoPayload } from '../../types'

interface Props {
  onDecrypt: (password: string) => Promise<void>
  onDecryptRSA?: () => Promise<void>
  error: string | null
  payload?: CryptoPayload | null
}

export function DecryptForm({ onDecrypt, onDecryptRSA, error, payload }: Props) {
  const { t } = useLang()
  const [password, setPassword] = useState('')
  const [shaking, setShaking] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isRSAMode = payload?.mode === 'rsa'
  const ownKeys = keyStore.getOwnKeys()
  const hasPrivateKey = Boolean(ownKeys.rsaPrivateKey)

  useEffect(() => {
    if (error) {
      setShaking(true) // eslint-disable-line react-hooks/set-state-in-effect -- shake animation trigger
      setTimeout(() => setShaking(false), 400)
    }
  }, [error])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onDecrypt(password)
    setLoading(false)
  }

  async function handleDecryptRSA() {
    if (!onDecryptRSA) return
    setLoading(true)
    await onDecryptRSA()
    setLoading(false)
  }

  // RSA mode UI
  if (isRSAMode) {
    return (
      <div className="space-y-3">
        {/* RSA mode badge */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-semibold text-gmail-blue">
            <Key className="h-3 w-3" />
            {t('RSA Encrypted', 'Mã hóa RSA')}
          </span>
        </div>

        {hasPrivateKey ? (
          <>
            <button
              type="button"
              onClick={handleDecryptRSA}
              disabled={loading}
              aria-label={t('Decrypt with your private key', 'Giải mã bằng khóa riêng của bạn')}
              className={`flex w-full items-center justify-center gap-2 rounded-full bg-gmail-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-gmail-blue-hover hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                shaking ? 'animate-shake' : ''
              }`}
            >
              {loading ? <Spinner size="sm" /> : <Unlock className="h-4 w-4" />}
              {t('Decrypt with your private key', 'Giải mã bằng khóa riêng của bạn')}
            </button>
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-gmail-red">
                {error}
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {t(
                'No RSA private key found. Generate keys in Key Manager.',
                'Không tìm thấy khóa riêng RSA. Tạo khóa trong Quản lý khóa.'
              )}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Password mode UI (unchanged behavior)
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gmail-text dark:text-gray-100">
          {t('Password', 'Mật khẩu')}
        </label>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('Enter message password', 'Nhập mật khẩu tin nhắn')}
          required
          className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gmail-text dark:text-gray-100 bg-white dark:bg-gray-700 outline-none transition-all focus:ring-2 focus:ring-gmail-blue/20 focus:border-gmail-blue ${
            error ? 'border-gmail-red' : 'border-gmail-border dark:border-gray-600'
          } ${shaking ? 'animate-shake' : ''}`}
        />
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-gmail-red">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        aria-label={t('Decrypt', 'Giải mã')}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gmail-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-gmail-blue-hover hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? <Spinner size="sm" /> : <Unlock className="h-4 w-4" />}
        {t('Decrypt Message', 'Giải mã tin nhắn')}
      </button>
    </form>
  )
}
