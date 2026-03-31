import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMailStore } from '../store/mailStore'
import { authService } from '../services/authService'
import { gmailService } from '../services/gmailService'

export function useAuth() {
  const { accessToken, user, setToken, setUser } = useMailStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (accessToken && !user) {
      gmailService.getProfile(accessToken)
        .then(setUser)
        .catch(() => {
          // Token invalid — clear and redirect
          setToken(null)
          navigate('/login')
        })
    }
  }, [accessToken])

  function logout() {
    authService.logout()
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  return { user, accessToken, logout, isAuthenticated: !!accessToken }
}
