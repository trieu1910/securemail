/* eslint-disable react-refresh/only-export-components */
import React, { useState, useEffect, Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Spinner } from './components/common/Spinner'
import './index.css'

// Lazy-load pages to reduce initial bundle size (code-splitting)
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })))
const Docs = lazy(() => import('./pages/Docs').then(m => ({ default: m.Docs })))
const Workflow = lazy(() => import('./pages/Workflow').then(m => ({ default: m.Workflow })))
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(m => ({ default: m.AuthCallback })))
const Inbox = lazy(() => import('./pages/Inbox').then(m => ({ default: m.Inbox })))

const TOKEN_KEY = 'sm_access_token'
const TOKEN_VALIDATED_KEY = 'sm_token_validated_at'
const VALIDATION_INTERVAL = 5 * 60 * 1000 // 5 minutes

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading')
  const token = localStorage.getItem(TOKEN_KEY)

  useEffect(() => {
    if (!token) {
      setStatus('invalid') // eslint-disable-line react-hooks/set-state-in-effect
      return
    }

    // Check if token was recently validated (within 5 min)
    const validatedAt = localStorage.getItem(TOKEN_VALIDATED_KEY)
    if (validatedAt && Date.now() - Number(validatedAt) < VALIDATION_INTERVAL) {
      setStatus('valid') // eslint-disable-line react-hooks/set-state-in-effect
      return
    }

    // Validate token against Google userinfo endpoint
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem(TOKEN_VALIDATED_KEY, String(Date.now()))
          setStatus('valid') // eslint-disable-line react-hooks/set-state-in-effect
        } else {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(TOKEN_VALIDATED_KEY)
          setStatus('invalid') // eslint-disable-line react-hooks/set-state-in-effect
        }
      })
      .catch(() => {
        setStatus('valid') // eslint-disable-line react-hooks/set-state-in-effect
      })
  }, [token])

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (status === 'invalid') return <Navigate to="/login" replace />
  return <>{children}</>
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner /></div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
          <Route path="/mail/:id" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>
)
