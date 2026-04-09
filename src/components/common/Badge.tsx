import { Lock } from 'lucide-react'

export function EncryptedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-xs font-medium text-gmail-blue">
      <Lock className="h-3 w-3" />
    </span>
  )
}
