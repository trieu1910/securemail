import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { authService } from '../services/authService'
import { useMailStore } from '../store/mailStore'

export function AuthCallback() {
  const navigate = useNavigate()
  const { setToken } = useMailStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      navigate('/login')
      return
    }

    authService.handleCallback(code)
      .then((token) => {
        setToken(token)
        navigate('/inbox')
      })
      .catch((err) => {
        console.error('OAuth callback failed:', err)
        navigate('/login')
      })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gmail-bg">
      <div className="text-center">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-gmail-blue" />
        <p className="text-sm text-gmail-text-secondary">Completing sign-in...</p>
      </div>
    </div>
  )
}
