import { useEffect, useState, useRef } from 'react'
import { Mail, CheckCircle2, ArrowLeft, Trash2, MailOpen, Reply, Forward, FileText, Download, Paperclip } from 'lucide-react'
import { z } from 'zod'
import { useMailStore } from '../store/mailStore'
import { gmailService } from '../services/gmailService'
import { cryptoService } from '../services/cryptoService'
import { keyStore } from '../utils/keyStore'
import { SecurityDetails } from '../components/decrypt/SecurityDetails'
import { CipherPanel } from '../components/decrypt/CipherPanel'
import { DecryptForm } from '../components/decrypt/DecryptForm'
import { Avatar } from '../components/common/Avatar'
import { formatDate } from '../utils/formatDate'
import { extractName, extractEmail } from '../utils/addressParser'
import type { CryptoPayload } from '../types'

/** Zod schema for validating untrusted JSON before casting to CryptoPayload.
 *  Prevents type-confusion attacks where malformed JSON is blindly trusted. */
const CryptoPayloadSchema = z.object({
  version: z.string(),
  mode: z.enum(['password', 'rsa']),
  subject: z.string(),
  ciphertext: z.string(),
  iv: z.string(),
  encryptedKey: z.string(),
  salt: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    data: z.string(),
  })).optional(),
  // Future RSA fields
  encryptedKeys: z.record(z.string(), z.string()).optional(),
  signature: z.string().optional(),
  signerPublicKey: z.string().optional(),
})

/** Renders email HTML inside a fully sandboxed iframe using srcdoc.
 *  SECURITY: sandbox="" (empty) provides maximum isolation — the iframe cannot
 *  access the parent's DOM, localStorage, or execute scripts. This prevents
 *  malicious email HTML from stealing the OAuth token stored in localStorage.
 *  CSS is inlined directly in the srcdoc so no same-origin access is needed. */
function EmailFrame({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(400)

  // Build the full HTML document with inline styles for the srcdoc attribute.
  // Since sandbox="" blocks all script execution, we use postMessage from an
  // inline script that runs only inside the sandboxed context (not the parent).
  // NOTE: sandbox="" blocks scripts too, so auto-resize relies on a fixed
  // generous height plus MutationObserver on the parent when possible.
  const srcdocContent = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1f2937; word-break: break-word; overflow-wrap: break-word; }
  img { max-width: 100% !important; height: auto !important; }
  table { max-width: 100% !important; }
  a { color: #1a73e8; text-decoration: none; }
  a:hover { text-decoration: underline; }
  pre, code { white-space: pre-wrap; max-width: 100%; overflow-x: auto; }
</style>
</head><body>${html}</body></html>`

  // With sandbox="" we cannot access contentDocument for auto-resize.
  // Use a reasonable default height; the iframe scrolls internally if content is taller.
  // We attempt to observe natural content height via the iframe's onload event
  // combined with allow-same-origin would be needed, but we intentionally avoid it
  // for security. A fixed height with overflow-y: auto is the safe tradeoff.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reset height on content change
  useEffect(() => { setHeight(400) }, [html])

  return (
    <iframe
      ref={iframeRef}
      sandbox=""
      srcDoc={srcdocContent}
      title="Email content"
      className="w-full border-0"
      style={{ height: `${height}px`, minHeight: '100px', overflowY: 'auto' }}
    />
  )
}

export function MailView() {
  const { selectedMail, accessToken, decryptedContent, decryptError, setDecrypted, setDecryptError, currentFolder, setSelected, mailList, setMailList, openReply, openForward } = useMailStore()
  const [fullMail, setFullMail] = useState(selectedMail)
  const [payload, setPayload] = useState<CryptoPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [decryptedSubject, setDecryptedSubject] = useState<string | null>(null)
  const [decryptedAttachments, setDecryptedAttachments] = useState<{ name: string; type: string; size: number; data: ArrayBuffer }[]>([])
  const [isRead, setIsRead] = useState(selectedMail?.isRead ?? true)
  const [toggleReadLoading, setToggleReadLoading] = useState(false)

  useEffect(() => {
    if (selectedMail) setIsRead(selectedMail.isRead)
  }, [selectedMail?.id])

  useEffect(() => {
    if (!selectedMail || !accessToken) return
    const controller = new AbortController()

    setLoading(true)
    setPayload(null)
    setDecrypted(null)
    setDecryptError(null)
    setDecryptedSubject(null)
    setDecryptedAttachments([])

    async function loadMessage() {
      try {
        const detail = await gmailService.getMessage(accessToken!, selectedMail!.id)
        if (controller.signal.aborted) return

        setFullMail(detail)
        if (cryptoService.isEncryptedMail(detail.body)) {
          // Gmail may encode long text/plain as quoted-printable, inserting
          // "=\r\n" or "=\n" soft line breaks. Must remove the "=" too,
          // otherwise base64url values get corrupted with trailing "=".
          const cleanBody = detail.body.trim()
            .replace(/=\r?\n/g, '')   // quoted-printable soft line breaks
            .replace(/[\r\n\t]/g, '') // remaining line breaks
          try {
            const parsed = CryptoPayloadSchema.safeParse(JSON.parse(cleanBody))
            if (!controller.signal.aborted && parsed.success) {
              setPayload(parsed.data as CryptoPayload)
            }
            // If validation fails, treat as normal (non-encrypted) email — no setPayload
          } catch {
            // Body may be truncated by Gmail API for large payloads.
            // Fetch raw MIME for the complete body.
            console.warn('CryptoPayload parse failed, fetching raw MIME...')
            const rawBody = await gmailService.getMessageRaw(accessToken!, selectedMail!.id)
            if (controller.signal.aborted) return
            if (rawBody) {
              const cleanRaw = rawBody.trim()
                .replace(/=\r?\n/g, '')
                .replace(/[\r\n\t]/g, '')
              try {
                const parsedRaw = CryptoPayloadSchema.safeParse(JSON.parse(cleanRaw))
                if (!controller.signal.aborted && parsedRaw.success) {
                  setPayload(parsedRaw.data as CryptoPayload)
                }
              } catch (e) {
                console.error('Raw body parse also failed:', e)
              }
            }
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadMessage()
    return () => controller.abort()
  }, [selectedMail?.id])

  if (!selectedMail) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gmail-border dark:text-gray-600">
        <Mail className="mb-3 h-12 w-12" />
        <p className="text-sm text-gmail-text-secondary dark:text-gray-400">Select a message to read</p>
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

  function handleDownloadAttachment(att: { name: string; type: string; data: ArrayBuffer }) {
    const blob = new Blob([att.data], { type: att.type || 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = att.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function handleDecrypt(password: string) {
    if (!payload) return
    try {
      const result = await cryptoService.decrypt(payload, password)
      setDecrypted(result.body)
      setDecryptedSubject(result.subject)
      if (result.attachments) setDecryptedAttachments(result.attachments)
    } catch {
      setDecryptError('Decryption failed. Wrong password or corrupted message.')
    }
  }

  async function handleDecryptRSA() {
    if (!payload) return
    const ownKeys = keyStore.getOwnKeys()
    if (!ownKeys.rsaPrivateKey) {
      setDecryptError('No RSA private key found. Generate keys in Key Manager.')
      return
    }
    try {
      const result = await cryptoService.decryptRSA(payload, ownKeys.rsaPrivateKey)
      setDecrypted(result.body)
      setDecryptedSubject(result.subject)
      if (result.attachments) setDecryptedAttachments(result.attachments)
    } catch {
      setDecryptError('RSA decryption failed. Wrong key or corrupted message.')
    }
  }

  async function handleDelete() {
    if (!accessToken || !selectedMail) return
    try {
      await gmailService.trashMessage(accessToken, selectedMail.id)
      setMailList(mailList.filter((m) => m.id !== selectedMail.id))
      setSelected(null)
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  async function handleToggleRead() {
    if (!accessToken || !selectedMail || toggleReadLoading) return
    setToggleReadLoading(true)
    try {
      await gmailService.modifyLabels(
        accessToken,
        selectedMail.id,
        isRead ? ['UNREAD'] : [],
        isRead ? [] : ['UNREAD'],
      )
      const newIsRead = !isRead
      setIsRead(newIsRead)
      setMailList(mailList.map((m) =>
        m.id === selectedMail.id ? { ...m, isRead: newIsRead } : m,
      ))
    } catch (err) {
      console.error('Failed to toggle read status:', err)
    } finally {
      setToggleReadLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 animate-fade-in md:px-8 md:py-6">
      {/* Back button — mobile only */}
      <button
        onClick={() => setSelected(null)}
        className="mb-3 flex items-center gap-1.5 cursor-pointer rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-gmail-text-secondary dark:text-gray-400 hover:bg-gmail-hover dark:hover:bg-gray-700 transition-colors md:hidden"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-3 border-b border-slate-100 dark:border-gray-700 pb-3">
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
        <button
          onClick={handleToggleRead}
          disabled={toggleReadLoading}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRead ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          {isRead ? 'Mark unread' : 'Mark read'}
        </button>
      </div>

      {/* Subject */}
      <h1 className="text-xl font-normal text-gmail-text dark:text-gray-100 leading-tight">
        {decryptedSubject ?? selectedMail.subject}
      </h1>

      {/* Sender info */}
      <div className="mt-5 flex items-center gap-3">
        <Avatar name={name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
            <span className="text-sm font-bold text-gmail-text dark:text-gray-100">{name}</span>
            <span className="truncate text-xs text-gmail-text-secondary dark:text-gray-400">&lt;{email}&gt;</span>
          </div>
          <p className="text-xs text-gmail-text-secondary dark:text-gray-400">
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
      <div className="my-5 border-t border-gmail-border/50 dark:border-gray-700" />

      {/* Encrypted mail */}
      {payload && !decryptedContent && (
        <div className="space-y-4 animate-slide-up">
          <SecurityDetails payload={payload} />
          <CipherPanel payload={payload} />
          <DecryptForm onDecrypt={handleDecrypt} onDecryptRSA={handleDecryptRSA} error={decryptError} payload={payload} />
        </div>
      )}

      {/* Decrypted content */}
      {decryptedContent && (
        <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-5 animate-slide-up">
          <div className="mb-3 flex items-center gap-1.5 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Decrypted</span>
          </div>
          {decryptedSubject && (
            <p className="mb-2 text-sm font-semibold text-gmail-text dark:text-gray-100">Subject: {decryptedSubject}</p>
          )}
          <div className="whitespace-pre-wrap text-sm text-gmail-text dark:text-gray-200 leading-relaxed">{decryptedContent}</div>
        </div>
      )}

      {/* Decrypted attachments */}
      {decryptedAttachments.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 p-4 animate-slide-up">
          <div className="mb-3 flex items-center gap-1.5 text-slate-600 dark:text-gray-300">
            <Paperclip className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {decryptedAttachments.length} Decrypted Attachment{decryptedAttachments.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {decryptedAttachments.map((att, idx) => (
              <div
                key={`${att.name}-${idx}`}
                className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
              >
                <FileText className="h-8 w-8 text-slate-400 dark:text-gray-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gmail-text dark:text-gray-100">{att.name}</p>
                  <p className="text-xs text-gmail-text-secondary dark:text-gray-400">
                    {att.size < 1024 ? `${att.size} B` : att.size < 1048576 ? `${(att.size / 1024).toFixed(1)} KB` : `${(att.size / 1048576).toFixed(1)} MB`}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadAttachment(att)}
                  className="shrink-0 rounded-full p-2 text-gmail-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  aria-label={`Download ${att.name}`}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plain mail — render in sandboxed iframe for style isolation */}
      {!payload && fullMail?.body && (
        <EmailFrame html={fullMail.body} />
      )}

      {/* Reply & Forward buttons */}
      {(decryptedContent || (!payload && fullMail?.body)) && (() => {
        const displaySubject = decryptedSubject ?? selectedMail.subject
        const displayBody = decryptedContent ?? fullMail?.body ?? ''
        const quotedBody = `\n\n--- Original Message ---\nFrom: ${from}\nDate: ${formatDate(selectedMail.date)}\n\n${displayBody}`
        const messageId = fullMail?.headers?.['Message-ID'] ?? ''
        return (
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => openReply(email, displaySubject, quotedBody, messageId)}
              className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Reply className="h-4 w-4" />
              Reply
            </button>
            <button
              onClick={() => openForward(displaySubject, quotedBody)}
              className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-gray-600 px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Forward className="h-4 w-4" />
              Forward
            </button>
          </div>
        )
      })()}
    </div>
  )
}
