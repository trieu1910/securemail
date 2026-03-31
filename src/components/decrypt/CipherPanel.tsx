import type { CryptoPayload } from '../../types'
import { highlightJson } from '../../utils/highlightJson'

interface Props { payload: CryptoPayload }

export function CipherPanel({ payload }: Props) {
  const raw = JSON.stringify(payload, null, 2)
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
