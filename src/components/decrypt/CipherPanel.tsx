import type { CryptoPayload } from '../../types'
import { highlightJson } from '../../utils/highlightJson'

interface Props { payload: CryptoPayload }

export function CipherPanel({ payload }: Props) {
  // Build a display version: replace attachments array with a summary to keep the panel readable
  const displayPayload = payload.attachments && payload.attachments.length > 0
    ? { ...payload, attachments: `[${payload.attachments.length} encrypted file${payload.attachments.length > 1 ? 's' : ''}]` as unknown }
    : payload
  const raw = JSON.stringify(displayPayload, null, 2)
  const preview = raw.length > 500 ? raw.slice(0, 500) + '\n  ...' : raw
  const highlighted = highlightJson(preview)

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 sm:p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Encrypted Payload</p>
      <pre
        className="overflow-x-auto text-xs leading-relaxed"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </div>
  )
}
