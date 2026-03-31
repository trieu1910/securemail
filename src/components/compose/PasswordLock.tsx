import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface Props {
  password: string
  confirm: string
  onPasswordChange: (v: string) => void
  onConfirmChange: (v: string) => void
}

function strengthLabel(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: '', color: 'bg-gray-200', width: 'w-0' }
  if (pw.length < 8) return { label: 'Too short', color: 'bg-gmail-red', width: 'w-1/4' }
  if (pw.length < 12) return { label: 'Weak', color: 'bg-orange-400', width: 'w-1/2' }
  if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Fair', color: 'bg-yellow-400', width: 'w-3/4' }
  return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
}

export function PasswordLock({ password, confirm, onPasswordChange, onConfirmChange }: Props) {
  const [showPw, setShowPw] = useState(false)
  const strength = strengthLabel(password)
  const mismatch = confirm.length > 0 && password !== confirm

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gmail-text">Password</label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            minLength={8}
            placeholder="Min 8 characters"
            className="w-full rounded-lg border border-gmail-border px-3 py-2 pr-10 text-sm text-gmail-text outline-none focus:ring-2 focus:ring-gmail-blue/20 focus:border-gmail-blue transition-all"
          />
          <button type="button" onClick={() => setShowPw(!showPw)} aria-label={showPw ? 'Hide password' : 'Show password'} className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gmail-text-secondary hover:text-gmail-text focus:outline-none focus:ring-2 focus:ring-blue-500">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {password.length > 0 && (
          <div className="mt-1.5">
            <div className="h-1 w-full rounded-full bg-gray-200">
              <div className={`h-1 rounded-full transition-all ${strength.color} ${strength.width}`} />
            </div>
            <p className="mt-0.5 text-xs text-gmail-text-secondary">{strength.label}</p>
          </div>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gmail-text">Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => onConfirmChange(e.target.value)}
          required
          placeholder="Repeat password"
          className={`w-full rounded-lg border px-3 py-2 text-sm text-gmail-text outline-none focus:ring-2 focus:ring-gmail-blue/20 focus:border-gmail-blue transition-all ${mismatch ? 'border-gmail-red' : 'border-gmail-border'}`}
        />
        {mismatch && <p className="mt-1 text-xs text-gmail-red">Passwords do not match</p>}
      </div>
    </div>
  )
}
