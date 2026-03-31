import { useEffect, useState, useRef, useCallback } from 'react'
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react'
import { useMailStore } from '../store/mailStore'
import { gmailService } from '../services/gmailService'
import { cryptoService } from '../services/cryptoService'
import { SecurityDetails } from '../components/decrypt/SecurityDetails'
import { CipherPanel } from '../components/decrypt/CipherPanel'
import { DecryptForm } from '../components/decrypt/DecryptForm'
import { Avatar } from '../components/common/Avatar'
import { formatDate } from '../utils/formatDate'
import type { CryptoPayload } from '../types'

function extractName(addr: string): string {
  const match = addr.match(/^"?([^"<]+)"?\s*</)
  return match ? match[1].trim() : addr.split('@')[0]
}

function extractEmail(addr: string): string {
  const match = addr.match(/<([^>]+)>/)
  return match ? match[1] : addr
}

/** Renders email HTML inside a sandboxed iframe for style isolation */
function EmailFrame({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(400)

  const writeContent = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument
    if (!doc) return

    const wrappedHtml = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1f2937; word-break: break-word; overflow-wrap: break-word; }
  img { max-width: 100% !important; height: auto !important; }
  table { max-width: 100% !important; }
  a { color: #1a73e8; }
  pre, code { white-space: pre-wrap; max-width: 100%; overflow-x: auto; }
</style>
</head><body>${html}</body></html>`

    doc.open()
    doc.write(wrappedHtml)
    doc.close()

    // Auto-resize iframe to content height
    const resize = () => {
      const h = doc.documentElement?.scrollHeight ?? doc.body?.scrollHeight ?? 400
      setHeight(Math.max(h + 16, 100))
    }
    // Resize after images load
    const images = doc.querySelectorAll('img')
    if (images.length) {
      let loaded = 0
      images.forEach((img) => {
        if (img.complete) { loaded++; return }
        img.onload = img.onerror = () => { loaded++; if (loaded >= images.length) resize() }
      })
      if (loaded >= images.length) resize()
    }
    // Initial resize
    setTimeout(resize, 50)
    setTimeout(resize, 300)
  }, [html])

  useEffect(() => { writeContent() }, [writeContent])

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-same-origin"
      title="Email content"
      className="w-full border-0"
      style={{ height: `${height}px`, minHeight: '100px' }}
    />
  )
}

export function MailView() {
  const { selectedMail, accessToken, decryptedContent, decryptError, setDecrypted, setDecryptError, currentFolder, setSelected } = useMailStore()
  const [fullMail, setFullMail] = useState(selectedMail)
  const [payload, setPayload] = useState<CryptoPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [decryptedSubject, setDecryptedSubject] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedMail || !accessToken) return
    setLoading(true)
    setPayload(null)
    setDecrypted(null)
    setDecryptError(null)
    setDecryptedSubject(null)

    gmailService.getMessage(accessToken, selectedMail.id)
      .then((detail) => {
        setFullMail(detail)
        if (cryptoService.isEncryptedMail(detail.body)) {
          setPayload(JSON.parse(detail.body.trim()) as CryptoPayload)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedMail?.id])

  if (!selectedMail) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gmail-border">
        <Mail className="mb-3 h-12 w-12" />
        <p className="text-sm text-gmail-text-secondary">Select a message to read</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl p-3 space-y-5 animate-fade-in md:p-8">
        <div className="skeleton h-6 w-2/3" />
        <div className="flex items-center gap-3">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <div className="skeleton h-3 w-36" />
            <div className="skeleton h-2.5 w-48" />
          </div>
        </div>
        <div className="skeleton h-px w-full" />
        <div className="space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
          <div className="skeleton h-3 w-4/6" />
          <div className="skeleton h-3 w-3/6" />
        </div>
      </div>
    )
  }

  const isSentFolder = currentFolder === 'sent' || currentFolder === 'encrypted-sent'
  const from = fullMail?.from ?? selectedMail.from
  const to = fullMail?.to ?? selectedMail.to
  const name = extractName(from)
  const email = extractEmail(from)
  const recipientName = extractName(to)
  const recipientEmail = extractEmail(to)

  async function handleDecrypt(password: string) {
    if (!payload) return
    try {
      const result = await cryptoService.decrypt(payload, password)
      setDecrypted(result.body)
      setDecryptedSubject(result.subject)
    } catch {
      setDecryptError('Decryption failed. Wrong password or corrupted message.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 animate-fade-in md:px-8 md:py-6">
      {/* Back button — mobile only */}
      <button
        onClick={() => setSelected(null)}
        className="mb-3 flex items-center gap-1.5 cursor-pointer rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-gmail-text-secondary hover:bg-gmail-hover transition-colors md:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Subject */}
      <h1 className="text-xl font-normal text-gmail-text leading-tight">
        {decryptedSubject ?? selectedMail.subject}
      </h1>

      {/* Sender info */}
      <div className="mt-5 flex items-center gap-3">
        <Avatar name={name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <span className="text-sm font-bold text-gmail-text">{name}</span>
            <span className="truncate text-xs text-gmail-text-secondary">&lt;{email}&gt;</span>
          </div>
          <p className="text-xs text-gmail-text-secondary">
            {isSentFolder
              ? `to ${recipientName} <${recipientEmail}>`
              : 'to me'
            }
            {' · '}
            {formatDate(selectedMail.date)}
          </p>
        </div>
      </div>

      {/* Separator */}
      <div className="my-5 border-t border-gmail-border/50" />

      {/* Encrypted mail */}
      {payload && !decryptedContent && (
        <div className="space-y-4 animate-slide-up">
          <SecurityDetails payload={payload} />
          <CipherPanel payload={payload} />
          <DecryptForm onDecrypt={handleDecrypt} error={decryptError} />
        </div>
      )}

      {/* Decrypted content */}
      {decryptedContent && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-5 animate-slide-up">
          <div className="mb-3 flex items-center gap-1.5 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Decrypted</span>
          </div>
          {decryptedSubject && (
            <p className="mb-2 text-sm font-semibold text-gmail-text">Subject: {decryptedSubject}</p>
          )}
          <div className="whitespace-pre-wrap text-sm text-gmail-text leading-relaxed">{decryptedContent}</div>
        </div>
      )}

      {/* Plain mail — render in sandboxed iframe for style isolation */}
      {!payload && fullMail?.body && (
        <EmailFrame html={fullMail.body} />
      )}
    </div>
  )
}
