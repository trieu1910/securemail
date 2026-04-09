import { useState, useEffect, useCallback } from 'react'
import { Upload, Trash2, Shield, Users, Fingerprint } from 'lucide-react'
import { keyStore } from '../../../utils/keyStore'
import type { SavedKey } from '../../../utils/keyStore'
import { useLang } from '../../../hooks/useLang'

interface Props {
  onToast: (message: string, type: 'success' | 'error') => void
}

export function TrustedKeysSection({ onToast }: Props) {
  const { t } = useLang()
  const [keys, setKeys] = useState<SavedKey[]>([])
  const [fingerprints, setFingerprints] = useState<Record<string, string>>({})
  const [showImport, setShowImport] = useState(false)
  const [importEmail, setImportEmail] = useState('')
  const [importPem, setImportPem] = useState('')
  const [importKeyType, setImportKeyType] = useState<'rsa' | 'ecdsa'>('rsa')

  const loadKeys = useCallback(async () => {
    const all = keyStore.getAll()
    setKeys(all)
    const fps: Record<string, string> = {}
    for (const k of all) {
      fps[k.email + k.keyType] = await keyStore.getFingerprint(k.pem)
    }
    setFingerprints(fps)
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- load on mount is intentional
  useEffect(() => { void loadKeys() }, [loadKeys])

  function handleImport() {
    const email = importEmail.trim()
    const pem = importPem.trim()
    if (!email) {
      onToast(t('Please enter an email address', 'Vui lòng nhập địa chỉ email'), 'error')
      return
    }
    if (!pem) {
      onToast(t('Please paste a public key', 'Vui lòng dán khóa công khai'), 'error')
      return
    }
    keyStore.save(email, pem, importKeyType)
    setImportEmail('')
    setImportPem('')
    setShowImport(false)
    void loadKeys()
    onToast(
      t('Public key saved for ' + email, 'Đã lưu khóa công khai cho ' + email),
      'success'
    )
  }

  function handleDelete(email: string) {
    keyStore.delete(email)
    void loadKeys()
    onToast(
      t('Key deleted for ' + email, 'Đã xóa khóa cho ' + email),
      'success'
    )
  }

  return (
    <section aria-labelledby="trusted-keys-heading">
      <div className="flex items-center justify-between">
        <h3
          id="trusted-keys-heading"
          className="flex items-center gap-2 text-base font-semibold text-gmail-text"
        >
          <Users className="h-5 w-5 text-gmail-blue" aria-hidden="true" />
          {t('Trusted Keys', 'Khóa tin cậy')}
        </h3>
        <button
          onClick={() => setShowImport(!showImport)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gmail-border bg-white px-3 py-1.5 text-sm font-medium text-gmail-text transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gmail-blue focus:ring-offset-1"
          aria-label={t('Import public key', 'Nhập khóa công khai')}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          {t('Import Key', 'Nhập khóa')}
        </button>
      </div>

      {/* Import form */}
      {showImport && (
        <div className="mt-3 animate-slide-up rounded-xl border border-gmail-blue/20 bg-blue-50/50 p-4">
          <div className="space-y-3">
            <div>
              <label htmlFor="import-email" className="block text-xs font-medium text-gmail-text-secondary">
                {t('Recipient Email', 'Email người nhận')}
              </label>
              <input
                id="import-email"
                type="email"
                value={importEmail}
                onChange={(e) => setImportEmail(e.target.value)}
                placeholder="alice@example.com"
                className="mt-1 w-full rounded-lg border border-gmail-border bg-white px-3 py-2 text-sm text-gmail-text placeholder:text-gmail-text-secondary/50 focus:border-gmail-blue focus:outline-none focus:ring-1 focus:ring-gmail-blue"
              />
            </div>
            <div>
              <label htmlFor="import-key-type" className="block text-xs font-medium text-gmail-text-secondary">
                {t('Key Type', 'Loại khóa')}
              </label>
              <select
                id="import-key-type"
                value={importKeyType}
                onChange={(e) => setImportKeyType(e.target.value as 'rsa' | 'ecdsa')}
                className="mt-1 w-full rounded-lg border border-gmail-border bg-white px-3 py-2 text-sm text-gmail-text focus:border-gmail-blue focus:outline-none focus:ring-1 focus:ring-gmail-blue"
              >
                <option value="rsa">RSA-OAEP</option>
                <option value="ecdsa">ECDSA</option>
              </select>
            </div>
            <div>
              <label htmlFor="import-pem" className="block text-xs font-medium text-gmail-text-secondary">
                {t('Public Key (base64)', 'Khóa công khai (base64)')}
              </label>
              <textarea
                id="import-pem"
                rows={4}
                value={importPem}
                onChange={(e) => setImportPem(e.target.value)}
                placeholder={t('Paste the public key here...', 'Dán khóa công khai ở đây...')}
                className="mt-1 w-full rounded-lg border border-gmail-border bg-white px-3 py-2 font-mono text-xs text-gmail-text placeholder:text-gmail-text-secondary/50 focus:border-gmail-blue focus:outline-none focus:ring-1 focus:ring-gmail-blue"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                className="rounded-lg bg-gmail-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gmail-blue-hover focus:outline-none focus:ring-2 focus:ring-gmail-blue focus:ring-offset-1"
              >
                {t('Save Key', 'Lưu khóa')}
              </button>
              <button
                onClick={() => setShowImport(false)}
                className="rounded-lg border border-gmail-border px-4 py-2 text-sm font-medium text-gmail-text-secondary transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gmail-blue focus:ring-offset-1"
              >
                {t('Cancel', 'Hủy')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key list */}
      {keys.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-gmail-border bg-gray-50 p-6 text-center">
          <Shield className="mx-auto h-10 w-10 text-gmail-text-secondary" aria-hidden="true" />
          <p className="mt-2 text-sm text-gmail-text-secondary">
            {t(
              "No trusted keys yet. Import a recipient's public key to send them encrypted messages.",
              'Chưa có khóa tin cậy nào. Nhập khóa công khai của người nhận để gửi tin nhắn mã hóa.'
            )}
          </p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2" aria-label={t('Trusted keys list', 'Danh sách khóa tin cậy')}>
          {keys.map((k) => (
            <li
              key={k.email + k.keyType}
              className="flex items-center gap-3 rounded-lg border border-gmail-border bg-white p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gmail-sidebar">
                <Shield className="h-4 w-4 text-gmail-blue" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gmail-text">{k.email}</p>
                <p className="flex items-center gap-1 text-xs text-gmail-text-secondary">
                  <Fingerprint className="h-3 w-3" aria-hidden="true" />
                  <span className="font-mono">{fingerprints[k.email + k.keyType] ?? '...'}</span>
                  <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                    {k.keyType}
                  </span>
                </p>
                <p className="text-[11px] text-gmail-text-secondary/70">
                  {new Date(k.savedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(k.email)}
                className="shrink-0 rounded-lg p-2 text-gmail-text-secondary transition-colors hover:bg-red-50 hover:text-gmail-red focus:outline-none focus:ring-2 focus:ring-gmail-red"
                aria-label={t('Delete key for ' + k.email, 'Xóa khóa cho ' + k.email)}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
