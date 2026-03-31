import { useState, useRef, useEffect } from 'react'
import { Unlock } from 'lucide-react'
import { Spinner } from '../common/Spinner'

interface Props {
  onDecrypt: (password: string) => Promise<void>
  error: string | null
}

export function DecryptForm({ onDecrypt, error }: Props) {
  const [password, setPassword] = useState('')
  const [shaking, setShaking] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (error) {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
    }
  }, [error])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onDecrypt(password)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gmail-text">Password</label>
        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter message password"
          required
          className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gmail-text outline-none transition-all focus:ring-2 focus:ring-gmail-blue/20 focus:border-gmail-blue ${
            error ? 'border-gmail-red' : 'border-gmail-border'
          } ${shaking ? 'animate-shake' : ''}`}
        />
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-gmail-red">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        aria-label="Decrypt"
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gmail-blue px-4 py-2.5 text-sm font-medium text-white hover:bg-gmail-blue-hover hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? <Spinner size="sm" /> : <Unlock className="h-4 w-4" />}
        Decrypt Message
      </button>
    </form>
  )
}
