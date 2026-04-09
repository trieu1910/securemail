import { useState, useEffect, useCallback } from 'react'
import {
  Key,
  Fingerprint,
  Copy,
  Download,
  RefreshCw,
  Check,
  Shield,
} from 'lucide-react'
import { keyStore } from '../../../utils/keyStore'
import type { OwnKeys } from '../../../utils/keyStore'
import { cryptoService } from '../../../services/cryptoService'
import { useLang } from '../../../hooks/useLang'
import { Spinner } from '../Spinner'

interface Props {
  onToast: (message: string, type: 'success' | 'error') => void
}

export function MyKeysSection({ onToast }: Props) {
  const { t } = useLang()
  const [ownKeys, setOwnKeys] = useState<OwnKeys>({})
  const [rsaFingerprint, setRsaFingerprint] = useState('')
  const [ecdsaFingerprint, setEcdsaFingerprint] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmRegen, setConfirmRegen] = useState(false)

  const loadKeys = useCallback(async () => {
    const keys = keyStore.getOwnKeys()
    setOwnKeys(keys)
    if (keys.rsaPublicKey) {
      setRsaFingerprint(await keyStore.getFingerprint(keys.rsaPublicKey))
    }
    if (keys.ecdsaPublicKey) {
      setEcdsaFingerprint(await keyStore.getFingerprint(keys.ecdsaPublicKey))
    }
  }, [])

  useEffect(() => {
    void loadKeys()
  }, [loadKeys])

  const hasKeys = Boolean(ownKeys.rsaPublicKey || ownKeys.ecdsaPublicKey)

  async function generateKeys() {
    setGenerating(true)
    try {
      const rsa = await cryptoService.generateRSAKeyPair()
      const ecdsa = await cryptoService.generateSigningKeyPair()
      const newKeys: OwnKeys = {
        rsaPublicKey: rsa.publicKey,
        rsaPrivateKey: rsa.privateKey,
        ecdsaPublicKey: ecdsa.publicKey,
        ecdsaPrivateKey: ecdsa.privateKey,
        generatedAt: new Date().toISOString(),
      }
      keyStore.saveOwnKeys(newKeys)
      await loadKeys()
      onToast(t('Key pair generated successfully!', 'Tạo cặp khóa thành công!'), 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      onToast(t('Failed to generate keys: ' + msg, 'Tạo khóa thất bại: ' + msg), 'error')
    } finally {
      setGenerating(false)
      setConfirmRegen(false)
    }
  }

  async function copyPublicKey() {
    if (!ownKeys.rsaPublicKey) return
    try {
      await navigator.clipboard.writeText(ownKeys.rsaPublicKey)
      setCopied(true)
      onToast(t('Public key copied to clipboard', 'Đã sao chép khóa công khai'), 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      onToast(t('Failed to copy key', 'Sao chép khóa thất bại'), 'error')
    }
  }

  function downloadPublicKey() {
    if (!ownKeys.rsaPublicKey) return
    const blob = new Blob([ownKeys.rsaPublicKey], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'securemail-rsa-public-key.pem'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onToast(t('Public key downloaded', 'Đã tải xuống khóa công khai'), 'success')
  }

  const genDate = ownKeys.generatedAt
    ? new Date(ownKeys.generatedAt).toLocaleString()
    : null

  return (
    <section aria-labelledby="my-keys-heading">
      <h3
        id="my-keys-heading"
        className="flex items-center gap-2 text-base font-semibold text-gmail-text"
      >
        <Key className="h-5 w-5 text-gmail-blue" aria-hidden="true" />
        {t('My Keys', 'Khóa của tôi')}
      </h3>

      {!hasKeys ? (
        <div className="mt-4 rounded-xl border border-dashed border-gmail-border bg-gray-50 p-6 text-center">
          <Shield className="mx-auto h-10 w-10 text-gmail-text-secondary" aria-hidden="true" />
          <p className="mt-2 text-sm text-gmail-text-secondary">
            {t(
              'No keys generated yet. Generate a key pair to start sending and receiving encrypted messages.',
              'Chưa có khóa nào. Tạo cặp khóa để bắt đầu gửi và nhận tin nhắn mã hóa.'
            )}
          </p>
          <button
            onClick={() => void generateKeys()}
            disabled={generating}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gmail-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gmail-blue-hover focus:outline-none focus:ring-2 focus:ring-gmail-blue focus:ring-offset-2 disabled:opacity-60"
            aria-label={t('Generate key pair', 'Tạo cặp khóa')}
          >
            {generating ? <Spinner size="sm" /> : <Key className="h-4 w-4" aria-hidden="true" />}
            {t('Generate Key Pair', 'Tạo cặp khóa')}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {/* RSA fingerprint */}
          <div className="rounded-lg border border-gmail-border bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gmail-text-secondary">
                  <Fingerprint className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('RSA-OAEP Public Key', 'Khóa công khai RSA-OAEP')}
                </p>
                <p className="mt-1 font-mono text-sm text-gmail-text" aria-label={t('RSA fingerprint', 'Vân tay RSA')}>
                  {rsaFingerprint || '...'}
                </p>
              </div>
            </div>
          </div>

          {/* ECDSA fingerprint */}
          <div className="rounded-lg border border-gmail-border bg-white p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gmail-text-secondary">
              <Fingerprint className="h-3.5 w-3.5" aria-hidden="true" />
              {t('ECDSA Signing Key', 'Khóa ký ECDSA')}
            </p>
            <p className="mt-1 font-mono text-sm text-gmail-text" aria-label={t('ECDSA fingerprint', 'Vân tay ECDSA')}>
              {ecdsaFingerprint || '...'}
            </p>
          </div>

          {/* Generated timestamp */}
          {genDate && (
            <p className="text-xs text-gmail-text-secondary">
              {t('Generated:', 'Đã tạo:')} {genDate}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => void copyPublicKey()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gmail-border bg-white px-3 py-2 text-sm font-medium text-gmail-text transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gmail-blue focus:ring-offset-1"
              aria-label={t('Copy public key', 'Sao chép khóa công khai')}
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {t('Copy Public Key', 'Sao chép khóa')}
            </button>
            <button
              onClick={downloadPublicKey}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gmail-border bg-white px-3 py-2 text-sm font-medium text-gmail-text transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gmail-blue focus:ring-offset-1"
              aria-label={t('Download public key', 'Tải xuống khóa công khai')}
            >
              <Download className="h-4 w-4" />
              {t('Download .pem', 'Tải .pem')}
            </button>
            {!confirmRegen ? (
              <button
                onClick={() => setConfirmRegen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gmail-red/30 bg-white px-3 py-2 text-sm font-medium text-gmail-red transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-gmail-red focus:ring-offset-1"
                aria-label={t('Regenerate keys', 'Tạo lại khóa')}
              >
                <RefreshCw className="h-4 w-4" />
                {t('Regenerate', 'Tạo lại')}
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-gmail-red bg-red-50 px-3 py-2">
                <p className="text-xs text-gmail-red">
                  {t(
                    'This will replace your existing keys. Recipients will need your new public key.',
                    'Thao tác này sẽ thay thế khóa hiện tại. Người nhận cần khóa mới của bạn.'
                  )}
                </p>
                <button
                  onClick={() => void generateKeys()}
                  disabled={generating}
                  className="shrink-0 rounded bg-gmail-red px-3 py-1 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-gmail-red disabled:opacity-60"
                >
                  {generating ? <Spinner size="sm" /> : t('Confirm', 'Xác nhận')}
                </button>
                <button
                  onClick={() => setConfirmRegen(false)}
                  className="shrink-0 text-xs text-gmail-text-secondary hover:text-gmail-text focus:outline-none"
                >
                  {t('Cancel', 'Hủy')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
