import { ShieldCheck } from 'lucide-react'
import type { CryptoPayload } from '../../types'

interface Props { payload: CryptoPayload }

export function SecurityDetails({ payload }: Props) {
  return (
    <div className="rounded-lg border border-gmail-border/50 bg-gmail-bg p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-gmail-blue" />
        <span className="text-sm font-bold text-gmail-text">Encryption Details</span>
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs">
        <span className="font-semibold text-gmail-text-secondary">Encryption</span>
        <span className="text-gmail-text">AES-256-GCM</span>

        <span className="font-semibold text-gmail-text-secondary">Key derivation</span>
        <span className="text-gmail-text">PBKDF2-SHA256 · 100,000 iterations</span>

        <span className="font-semibold text-gmail-text-secondary">Key wrapping</span>
        <span className="text-gmail-text">AES-KW 256-bit</span>

        <span className="font-semibold text-gmail-text-secondary">Mode</span>
        <span className="text-gmail-text">Password (PBKDF2 + AES-KW)</span>

        <span className="font-semibold text-gmail-text-secondary">Version</span>
        <span className="text-gmail-text">SecureMail {payload.version}</span>
      </div>
    </div>
  )
}
