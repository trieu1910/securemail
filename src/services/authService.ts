import { arrayBufferToBase64url, toBase64url } from '../utils/base64'
import type { User } from '../types'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI as string
const TOKEN_KEY = 'sm_access_token'
const VERIFIER_KEY = 'sm_code_verifier'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ')

async function generateCodeVerifier(): Promise<string> {
  // 32 random bytes → base64url → 43 chars (RFC 7636 compliant)
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return toBase64url(bytes)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return arrayBufferToBase64url(digest)
}

export const authService = {
  async login(): Promise<void> {
    const verifier = await generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    sessionStorage.setItem(VERIFIER_KEY, verifier)

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: SCOPES,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      access_type: 'online',
    })
    window.location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
  },

  async handleCallback(code: string): Promise<string> {
    const verifier = sessionStorage.getItem(VERIFIER_KEY)
    if (!verifier) throw new Error('No code verifier found')

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
    })

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!res.ok) throw new Error('Token exchange failed')
    const data = await res.json()
    const token: string = data.access_token
    localStorage.setItem(TOKEN_KEY, token)
    sessionStorage.removeItem(VERIFIER_KEY)
    return token
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY)
  },

  async getUser(token: string): Promise<User> {
    const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to fetch user profile')
    const data = await res.json()
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    }
  },
}
