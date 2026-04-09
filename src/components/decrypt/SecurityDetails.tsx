import { useState, useEffect } from 'react'
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react'
import { cryptoService } from '../../services/cryptoService'
import { keyStore } from '../../utils/keyStore'
import { useLang } from '../../hooks/useLang'
import type { CryptoPayload } from '../../types'

interface Props { payload: CryptoPayload }

type VerifyStatus = 'idle' | 'verifying' | 'verified' | 'invalid' | 'error'

export function SecurityDetails({ payload }: Props) {
  const { t } = useLang()
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>('idle')
  const [signerFingerprint, setSignerFingerprint] = useState<string>('')

  const isRSA = payload.mode === 'rsa'
  const hasSig = Boolean(payload.signature && payload.signerPublicKey)

  // Verify signature on mount if present
  useEffect(() => {
    if (!hasSig || !payload.signature || !payload.signerPublicKey) return

    let cancelled = false

    async function doVerify() {
      try {
        const dataToVerify = payload.ciphertext + payload.iv + payload.encryptedKey
        const result = await cryptoService.verify(
          dataToVerify,
          payload.signature!,
          payload.signerPublicKey!
        )

        if (cancelled) return

        if (result) {
          setVerifyStatus('verified')
          // Compute signer fingerprint
          try {
            const fp = await keyStore.getFingerprint(payload.signerPublicKey!)
            if (!cancelled) setSignerFingerprint(fp)
          } catch {
            // Fingerprint computation failed, but verification succeeded
          }
        } else {
          setVerifyStatus('invalid')
        }
      } catch {
        if (!cancelled) setVerifyStatus('error')
      }
    }

    // Use microtask to set verifying state, avoiding synchronous setState in effect body
    void Promise.resolve().then(() => {
      if (!cancelled) setVerifyStatus('verifying')
    })
    doVerify()
    return () => { cancelled = true }
  }, [payload.signature, payload.signerPublicKey, payload.ciphertext, payload.iv, payload.encryptedKey, hasSig])

  return (
    <div className="rounded-lg border border-gmail-border/50 dark:border-gray-700 bg-gmail-bg dark:bg-gray-800 p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-gmail-blue" />
        <span className="text-sm font-bold text-gmail-text dark:text-gray-100">
          {t('Encryption Details', 'Chi tiết mã hóa')}
        </span>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs">
        <span className="font-semibold text-gmail-text-secondary dark:text-gray-400">
          {t('Encryption', 'Mã hóa')}
        </span>
        <span className="text-gmail-text dark:text-gray-200">AES-256-GCM</span>

        {isRSA ? (
          <>
            <span className="font-semibold text-gmail-text-secondary dark:text-gray-400">
              {t('Key wrapping', 'Bọc khóa')}
            </span>
            <span className="text-gmail-text dark:text-gray-200">RSA-OAEP 4096-bit</span>

            <span className="font-semibold text-gmail-text-secondary dark:text-gray-400">
              {t('Mode', 'Chế độ')}
            </span>
            <span className="text-gmail-text dark:text-gray-200">
              {t('RSA-OAEP 4096-bit + AES-256-GCM', 'RSA-OAEP 4096-bit + AES-256-GCM')}
            </span>
          </>
        ) : (
          <>
            <span className="font-semibold text-gmail-text-secondary dark:text-gray-400">
              {t('Key derivation', 'Dẫn xuất khóa')}
            </span>
            <span className="text-gmail-text dark:text-gray-200">PBKDF2-SHA256 · 100,000 {t('iterations', 'vòng lặp')}</span>

            <span className="font-semibold text-gmail-text-secondary dark:text-gray-400">
              {t('Key wrapping', 'Bọc khóa')}
            </span>
            <span className="text-gmail-text dark:text-gray-200">AES-KW 256-bit</span>

            <span className="font-semibold text-gmail-text-secondary dark:text-gray-400">
              {t('Mode', 'Chế độ')}
            </span>
            <span className="text-gmail-text dark:text-gray-200">
              {t('Password (PBKDF2 + AES-KW)', 'Mật khẩu (PBKDF2 + AES-KW)')}
            </span>
          </>
        )}

        <span className="font-semibold text-gmail-text-secondary dark:text-gray-400">
          {t('Version', 'Phiên bản')}
        </span>
        <span className="text-gmail-text dark:text-gray-200">SecureMail {payload.version}</span>

        {/* Signature section */}
        <span className="font-semibold text-gmail-text-secondary dark:text-gray-400">
          {t('Signature', 'Chữ ký số')}
        </span>
        <span className="text-gmail-text dark:text-gray-200">
          {!hasSig ? (
            <span className="text-gray-400 italic">
              {t('Not signed', 'Chưa ký')}
            </span>
          ) : verifyStatus === 'verifying' ? (
            <span className="inline-flex items-center gap-1 text-gmail-text-secondary">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t('Verifying...', 'Đang xác minh...')}
            </span>
          ) : verifyStatus === 'verified' ? (
            <span className="inline-flex items-center gap-1 text-green-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('Verified', 'Đã xác minh')}
            </span>
          ) : verifyStatus === 'invalid' || verifyStatus === 'error' ? (
            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
              <ShieldAlert className="h-3.5 w-3.5" />
              {t(
                'Signature verification failed — message may be tampered',
                'Xác minh chữ ký thất bại — tin nhắn có thể bị sửa đổi'
              )}
            </span>
          ) : null}
        </span>

        {/* Signer fingerprint if verified */}
        {hasSig && verifyStatus === 'verified' && signerFingerprint && (
          <>
            <span className="font-semibold text-gmail-text-secondary dark:text-gray-400">
              {t('Signer', 'Người ký')}
            </span>
            <span className="text-gmail-text dark:text-gray-300 font-mono text-[10px]">
              {signerFingerprint}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
