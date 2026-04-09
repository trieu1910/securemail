import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../hooks/useLang'
import { LangToggle } from '../components/common/LangToggle'

const TEAM = [
  { name: 'Trần Quang Triều',       mssv: '030239230266', role: 'Project Lead & Frontend Developer',  initials: 'TT', color: 'bg-blue-600' },
  { name: 'Nguyễn Thị Phương Uyên', mssv: '030239230279', role: 'UI/UX Designer',                     initials: 'NU', color: 'bg-rose-500' },
  { name: 'Trương Văn Toàn',        mssv: '030239230248', role: 'Cryptography Engineer',               initials: 'TT', color: 'bg-emerald-600' },
  { name: 'Phan Ngô Phong',         mssv: '030239230183', role: 'Gmail API Integration',               initials: 'PP', color: 'bg-amber-600' },
  { name: 'Nguyễn Ngọc Đăng Khoa',  mssv: '030239230092', role: 'Authentication & OAuth2',             initials: 'NK', color: 'bg-violet-600' },
  { name: 'Nguyễn Thái Thanh Vân',  mssv: '030239230284', role: 'Testing & Quality Assurance',         initials: 'NV', color: 'bg-cyan-600' },
  { name: 'Đỗ Nguyễn Ngọc Thiện',   mssv: '030239230228', role: 'Documentation & Security Analysis',   initials: 'ĐT', color: 'bg-indigo-600' },
]

const getFeatures = (t: (en: string, vi: string) => string) => [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: t('AES-256-GCM Encryption', 'Mã hóa AES-256-GCM'),
    desc: t(
      'Military-grade symmetric encryption with authenticated encryption mode, ensuring both confidentiality and integrity of every message.',
      'Mã hóa đối xứng cấp quân sự với chế độ mã hóa xác thực, đảm bảo tính bảo mật và toàn vẹn của mỗi tin nhắn.',
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
      </svg>
    ),
    title: t('PBKDF2 Key Derivation', 'Dẫn xuất khóa PBKDF2'),
    desc: t(
      '100,000 iterations of PBKDF2-SHA256 transform your password into a strong encryption key. Makes brute-force attacks computationally infeasible.',
      '100.000 lần lặp PBKDF2-SHA256 biến mật khẩu thành khóa mã hóa mạnh. Khiến tấn công brute-force trở nên bất khả thi về mặt tính toán.',
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    ),
    title: t('Web Crypto API Only', 'Chỉ dùng Web Crypto API'),
    desc: t(
      "Zero third-party crypto libraries. All operations use the browser's native Web Crypto API — auditable, hardware-accelerated, and tamper-proof.",
      'Không dùng thư viện mã hóa bên thứ ba. Mọi thao tác đều sử dụng Web Crypto API gốc của trình duyệt — có thể kiểm tra, tăng tốc phần cứng và chống giả mạo.',
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
      </svg>
    ),
    title: t('No Backend Server', 'Không cần máy chủ'),
    desc: t(
      'Encryption keys never leave your browser. Gmail only sees ciphertext. No server means no single point of compromise.',
      'Khóa mã hóa không bao giờ rời trình duyệt. Gmail chỉ thấy bản mã. Không máy chủ nghĩa là không có điểm yếu tập trung.',
    ),
  },
]

const getSteps = (t: (en: string, vi: string) => string) => [
  {
    step: '01',
    title: t('Compose', 'Soạn thư'),
    desc: t('Write your email and set an encryption password.', 'Viết email và đặt mật khẩu mã hóa.'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
  },
  {
    step: '02',
    title: t('Encrypt', 'Mã hóa'),
    desc: t(
      'Subject + body are encrypted client-side into a CryptoPayload JSON before sending.',
      'Tiêu đề + nội dung được mã hóa phía client thành CryptoPayload JSON trước khi gửi.',
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
      </svg>
    ),
  },
  {
    step: '03',
    title: t('Send via Gmail', 'Gửi qua Gmail'),
    desc: t(
      'The encrypted payload is sent through Gmail API. Only the recipient with the correct key can decrypt.',
      'Payload mã hóa được gửi qua Gmail API. Chỉ người nhận có đúng khóa mới giải mã được.',
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    ),
  },
]

const getLimitations = (t: (en: string, vi: string) => string) => [
  {
    title: t('XSS attacks can access localStorage', 'Tấn công XSS có thể truy cập localStorage'),
    desc: t(
      'Since encryption keys are stored in the browser, a Cross-Site Scripting attack could steal them. Mitigation: Content Security Policy headers.',
      'Vì khóa mã hóa được lưu trong trình duyệt, tấn công XSS có thể đánh cắp chúng. Giảm thiểu: Content Security Policy headers.',
    ),
    severity: 'high',
  },
  {
    title: t('No digital signature (sender verification)', 'Không có chữ ký số (xác minh người gửi)'),
    desc: t(
      "SecureMail does not verify who sent the email. A third party with the recipient's public information could forge encrypted messages.",
      'SecureMail không xác minh ai gửi email. Bên thứ ba có thông tin công khai của người nhận có thể giả mạo tin nhắn mã hóa.',
    ),
    severity: 'medium',
  },
  {
    title: t('Replay attacks not prevented', 'Không ngăn chặn tấn công phát lại'),
    desc: t(
      'An intercepted encrypted email could be re-sent. The recipient has no way to detect duplicates without timestamp/nonce verification.',
      'Email mã hóa bị chặn có thể bị gửi lại. Người nhận không thể phát hiện bản sao nếu không có xác minh timestamp/nonce.',
    ),
    severity: 'medium',
  },
  {
    title: t('Depends on Gmail as transport', 'Phụ thuộc Gmail làm kênh truyền'),
    desc: t(
      'Gmail can delete emails or deny access. SecureMail encrypts content but cannot guarantee email delivery or persistence.',
      'Gmail có thể xóa email hoặc từ chối truy cập. SecureMail mã hóa nội dung nhưng không đảm bảo giao email hoặc lưu trữ lâu dài.',
    ),
    severity: 'low',
  },
  {
    title: t('Physical access = key compromise', 'Truy cập vật lý = lộ khóa'),
    desc: t(
      "Anyone with access to the user's browser can extract keys from localStorage. Defense-in-depth is needed.",
      'Bất kỳ ai truy cập trình duyệt của người dùng đều có thể lấy khóa từ localStorage. Cần bảo vệ nhiều lớp.',
    ),
    severity: 'high',
  },
  {
    title: t('Frontend-only architecture', 'Kiến trúc chỉ frontend'),
    desc: t(
      'No backend means no server-side key escrow, no rate limiting on brute-force, and no centralized audit logs.',
      'Không backend nghĩa là không có ký gửi khóa phía server, không giới hạn tốc độ brute-force, và không có nhật ký kiểm toán tập trung.',
    ),
    severity: 'medium',
  },
]

const TECH = [
  { name: 'React 19',       color: 'bg-sky-100 text-sky-700' },
  { name: 'TypeScript',     color: 'bg-blue-100 text-blue-700' },
  { name: 'Vite 8',         color: 'bg-purple-100 text-purple-700' },
  { name: 'TailwindCSS',    color: 'bg-cyan-100 text-cyan-700' },
  { name: 'Zustand',        color: 'bg-amber-100 text-amber-700' },
  { name: 'Web Crypto API', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Gmail REST API', color: 'bg-red-100 text-red-700' },
  { name: 'OAuth2 PKCE',    color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Vitest',         color: 'bg-green-100 text-green-700' },
  { name: 'Vercel',         color: 'bg-gray-100 text-gray-700' },
]

const DEMO_TABS = [
  {
    src: '/screenshot-inbox.png',
    label: 'Inbox',
    descEn: 'Gmail-like interface with encrypted email indicators',
    descVi: 'Giao diện giống Gmail với chỉ báo email đã mã hóa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h2.21a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
      </svg>
    ),
  },
  {
    src: '/screenshot-compose.png',
    label: 'Compose',
    descEn: 'Compose email and set encryption password',
    descVi: 'Soạn email và đặt mật khẩu mã hóa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
      </svg>
    ),
  },
  {
    src: '/screenshot-encrypted.png',
    label: 'Encrypted',
    descEn: 'Ciphertext payload with detailed encryption info',
    descVi: 'Ciphertext payload kèm thông tin mã hóa chi tiết',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
  {
    src: '/screenshot-decrypted.png',
    label: 'Decrypted',
    descEn: 'Enter password to view original content',
    descVi: 'Nhập mật khẩu để xem nội dung gốc',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
]

function DemoShowcase({ t }: { t: (en: string, vi: string) => string }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const tab = DEMO_TABS[active]

  return (
    <section id="demo" className="border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 py-10 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">{t('Live Demo', 'Demo trực tiếp')}</p>
          <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 md:text-4xl">
            {t('See it in action', 'Xem ứng dụng hoạt động')}
          </h2>
          <p className="text-lg text-slate-600">
            {t('Click each tab to explore the app. Click the image to zoom in.', 'Nhấn từng tab để khám phá. Nhấn vào ảnh để phóng to.')}
          </p>
        </div>

        {/* Tab buttons */}
        <div className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-2">
          {DEMO_TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 sm:px-5 sm:py-2.5 text-sm font-medium transition-all ${
                i === active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active screenshot — large */}
        <div className="mx-auto mt-8 max-w-5xl">
          <button
            onClick={() => setLightbox(true)}
            className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg transition-all hover:shadow-xl"
          >
            <div className="relative overflow-hidden">
              <img
                src={tab.src}
                alt={tab.label}
                className="w-full transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
                <span className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-200 opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                  </svg>
                  {t('Click to zoom', 'Nhấn để phóng to')}
                </span>
              </div>
            </div>
          </button>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-gray-100">{tab.label}</h3>
            <p className="text-sm text-slate-500">{t(tab.descEn, tab.descVi)}</p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="absolute right-6 top-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={tab.src}
            alt={tab.label}
            className="max-h-[90vh] max-w-[95vw] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}

export function Landing() {
  const navigate = useNavigate()
  const { lang, toggle, t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)

  const features = getFeatures(t)
  const steps = getSteps(t)
  const limitations = getLimitations(t)

  return (
    <div className="min-h-screen overflow-x-hidden bg-white dark:bg-gray-900 font-[Lexend] text-slate-800 dark:text-gray-200 antialiased">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-gray-100 dark:text-gray-100">SecureMail</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#demo" className="text-sm font-medium text-slate-600 dark:text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400">{t('Demo', 'Demo')}</a>
            <a href="#features" className="text-sm font-medium text-slate-600 dark:text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400">{t('Features', 'Tính năng')}</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400">{t('How It Works', 'Cách hoạt động')}</a>
            <a href="#limitations" className="text-sm font-medium text-slate-600 dark:text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400">{t('Limitations', 'Hạn chế')}</a>
            <a href="#team" className="text-sm font-medium text-slate-600 dark:text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400">{t('Team', 'Nhóm')}</a>
            <button onClick={() => navigate('/workflow')} className="cursor-pointer text-sm font-medium text-slate-600 dark:text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400">{t('Workflow', 'Quy trình')}</button>
            <button onClick={() => navigate('/docs')} className="cursor-pointer text-sm font-medium text-blue-600 transition-colors hover:text-blue-700">{t('Docs', 'Tài liệu')}</button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LangToggle lang={lang} toggle={toggle} />
            <button
              onClick={() => navigate('/login')}
              className="hidden whitespace-nowrap cursor-pointer rounded-lg bg-blue-600 sm:text-sm px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.97] md:inline-flex"
            >
              {t('Open App', 'Mở ứng dụng')}
            </button>
            {/* Hamburger menu button - mobile only */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 dark:border-gray-600 text-slate-600 dark:text-gray-400 transition-colors hover:bg-slate-100 dark:hover:bg-gray-700 md:hidden"
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="relative z-50 border-t border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg md:hidden">
            <div className="mx-auto max-w-7xl px-6 py-4">
              <div className="flex flex-col gap-4">
                <a href="#demo" onClick={() => setMenuOpen(false)} className="block py-1 text-base font-medium text-slate-600 transition-colors hover:text-blue-600">{t('Demo', 'Demo')}</a>
                <a href="#features" onClick={() => setMenuOpen(false)} className="block py-1 text-base font-medium text-slate-600 transition-colors hover:text-blue-600">{t('Features', 'Tính năng')}</a>
                <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block py-1 text-base font-medium text-slate-600 transition-colors hover:text-blue-600">{t('How It Works', 'Cách hoạt động')}</a>
                <a href="#limitations" onClick={() => setMenuOpen(false)} className="block py-1 text-base font-medium text-slate-600 transition-colors hover:text-blue-600">{t('Limitations', 'Hạn chế')}</a>
                <a href="#team" onClick={() => setMenuOpen(false)} className="block py-1 text-base font-medium text-slate-600 transition-colors hover:text-blue-600">{t('Team', 'Nhóm')}</a>
                <button onClick={() => { setMenuOpen(false); navigate('/workflow') }} className="block cursor-pointer py-1 text-left text-base font-medium text-slate-600 transition-colors hover:text-blue-600">{t('Workflow', 'Quy trình')}</button>
                <button onClick={() => { setMenuOpen(false); navigate('/docs') }} className="block cursor-pointer py-1 text-left text-base font-medium text-blue-600 transition-colors hover:text-blue-700">{t('Docs', 'Tài liệu')}</button>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/login') }}
                  className="mt-2 w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.97]"
                >
                  {t('Open App', 'Mở ứng dụng')}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-white" />
        <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/4 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/3 translate-y-1/4 rounded-full bg-indigo-100/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pt-24 lg:pt-28">
          {/* University branding — formal card */}
          <div className="mx-auto mb-12 max-w-2xl rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 px-8 py-6 shadow-sm backdrop-blur">
            <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:text-left sm:gap-5">
              <div className="flex items-center gap-3">
                <img src="/logo-hub.png" alt="Trường Đại học Ngân hàng TP.HCM" className="h-20 w-auto shrink-0 object-contain" />
                <img src="/logo-khoa.png" alt="Khoa Khoa học Dữ liệu" className="h-20 w-auto shrink-0 object-contain" />
              </div>
              <div className="hidden h-16 w-px bg-slate-200 sm:block" />
              <div>
                <p className="text-sm font-bold uppercase leading-tight tracking-wide text-slate-800 sm:text-base">{t('Ho Chi Minh City University of Banking', 'Trường Đại học Ngân hàng TP.HCM')}</p>
                <p className="text-sm font-bold text-blue-700 sm:text-base">{t('Department of Data Science', 'Khoa: Khoa học Dữ liệu')}</p>
                <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">{t('Course: Information Security in Business', 'Môn: An toàn bảo mật thông tin trong kinh doanh')}</p>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-blue-700">{t('End-to-End Encrypted', 'Mã hóa đầu cuối')}</span>
            </div>

            <h1 className="mb-6 text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-gray-100 md:text-5xl lg:text-6xl">
              {t('Your emails,', 'Email của bạn,')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('truly private', 'thật sự riêng tư')}
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600 md:text-xl">
              {t('SecureMail encrypts your email content client-side using', 'SecureMail mã hóa nội dung email phía client bằng')}{' '}
              <strong className="font-semibold text-slate-700 dark:text-gray-200">AES-256-GCM</strong> {t('with', 'với')}{' '}
              <strong className="font-semibold text-slate-700 dark:text-gray-200">PBKDF2</strong> {t('key derivation before it ever touches Gmail. No backend, no compromise.', 'dẫn xuất khóa trước khi gửi lên Gmail. Không backend, không thỏa hiệp.')}
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate('/login')}
                className="group flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.97]"
              >
                {t('Go to App', 'Mở ứng dụng')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 transition-transform group-hover:translate-x-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <a
                href="https://github.com/trieu1910/securemail"
                target="_blank"
                rel="noopener noreferrer"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 dark:text-gray-200 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:shadow-md active:scale-[0.97]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>

          {/* Crypto badge strip */}
          <div className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-3">
            {['AES-256-GCM', 'PBKDF2-SHA256', 'AES-KW 256-bit', '100K Iterations', 'Web Crypto API'].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROBLEM ─── */}
      <section className="border-t border-slate-100 py-10 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-red-500">{t('The Problem', 'Vấn đề')}</p>
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 md:text-4xl">
              {t('Why regular email is not safe', 'Tại sao email thông thường không an toàn')}
            </h2>
            <p className="text-lg text-slate-600">
              {t(
                'Every email you send passes through multiple servers in plaintext. Anyone with access can read it.',
                'Mỗi email bạn gửi đều đi qua nhiều máy chủ dưới dạng văn bản thô. Bất kỳ ai có quyền truy cập đều có thể đọc được.',
              )}
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-3">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                ),
                title: t('Google can read your emails', 'Google có thể đọc email của bạn'),
                desc: t(
                  'Gmail stores emails in plaintext on their servers. Google scans content for ads targeting and data analysis.',
                  'Gmail lưu email dưới dạng văn bản thô trên máy chủ. Google quét nội dung để nhắm mục tiêu quảng cáo và phân tích dữ liệu.',
                ),
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                  </svg>
                ),
                title: t('Man-in-the-middle attacks', 'Tấn công trung gian (MITM)'),
                desc: t(
                  'Emails travel through multiple network hops. Attackers can intercept and read content at any point.',
                  'Email đi qua nhiều nút mạng. Kẻ tấn công có thể chặn và đọc nội dung tại bất kỳ điểm nào.',
                ),
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-8 w-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                ),
                title: t('Data breaches expose everything', 'Rò rỉ dữ liệu làm lộ mọi thứ'),
                desc: t(
                  'When Gmail servers are compromised, all your unencrypted emails are exposed. There have been billions of leaked records.',
                  'Khi máy chủ Gmail bị xâm nhập, tất cả email không mã hóa đều bị lộ. Đã có hàng tỷ bản ghi bị rò rỉ.',
                ),
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-red-100 bg-red-50/50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-500">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-gray-100">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 py-10 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">{t('Before & After', 'Trước & Sau')}</p>
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 md:text-4xl">
              {t('What changes with SecureMail', 'Thay đổi với SecureMail')}
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-2">
            {/* WITHOUT */}
            <div className="rounded-2xl border border-red-200 bg-white p-5 sm:p-8">
              <div className="mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-red-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider text-red-500">{t('Without SecureMail', 'Không có SecureMail')}</span>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="mb-1 text-xs font-semibold text-slate-500">{t('Email content on Gmail server:', 'Nội dung email trên máy chủ Gmail:')}</p>
                  <p className="font-mono text-sm text-red-700">"Password ATM: 123456, PIN: 9999"</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-red-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  {t('Google, hackers, admins can all read this', 'Google, hacker, quản trị viên đều đọc được')}
                </div>
              </div>
            </div>

            {/* WITH */}
            <div className="rounded-2xl border border-green-200 bg-white p-5 sm:p-8">
              <div className="mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-wider text-green-600">{t('With SecureMail', 'Có SecureMail')}</span>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="mb-1 text-xs font-semibold text-slate-500">{t('Email content on Gmail server:', 'Nội dung email trên máy chủ Gmail:')}</p>
                  <p className="font-mono text-sm text-green-700 break-all">"Wc-bPnHQ1K3IE...4VE2ULIhAdQ"</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-green-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  {t('Only ciphertext — unreadable without password', 'Chỉ bản mã — không đọc được nếu không có mật khẩu')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── APP DEMO SCREENSHOTS ─── */}
      <DemoShowcase t={t} />

      {/* ─── FEATURES ─── */}
      <section id="features" className="border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 py-10 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">{t('Security First', 'Bảo mật là ưu tiên')}</p>
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 md:text-4xl">
              {t('Built for zero-trust email', 'Xây dựng cho email không tin cậy')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('Every design decision prioritizes your privacy. No shortcuts, no compromises.', 'Mọi quyết định thiết kế đều ưu tiên quyền riêng tư của bạn. Không tắt đường, không thỏa hiệp.')}
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-gray-100">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="border-t border-slate-100 py-10 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">{t('How It Works', 'Cách hoạt động')}</p>
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 md:text-4xl">
              {t('Three steps to encrypted email', 'Ba bước để mã hóa email')}
            </h2>
            <p className="text-lg text-slate-600">
              {t('Simple for users, impenetrable for attackers.', 'Đơn giản cho người dùng, bất khả xâm phạm với kẻ tấn công.')}
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-12 hidden h-px w-full translate-x-1/2 bg-gradient-to-r from-blue-300 to-transparent md:block" />
                )}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-blue-600 shadow-sm">
                  {s.icon}
                </div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-blue-600">{s.step}</span>
                <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-gray-100">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ENCRYPTION FLOW DIAGRAM ─── */}
      <section className="border-t border-slate-100 bg-slate-900 py-10 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-400">{t('Under the Hood', 'Bên trong hệ thống')}</p>
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-white md:text-4xl">
              {t('Encryption Architecture', 'Kiến trúc mã hóa')}
            </h2>
            <p className="text-lg text-slate-400">
              {t('How SecureMail protects your messages at every step.', 'Cách SecureMail bảo vệ tin nhắn của bạn ở mọi bước.')}
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-4xl">
            {/* Password Mode */}
            <div className="mb-10 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-4 sm:p-6 md:p-8">
              <h3 className="mb-6 flex items-center gap-3 text-lg font-semibold text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6 text-amber-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
                {t('Encryption Flow', 'Quy trình mã hóa')}
              </h3>
              <div className="flex flex-col items-center gap-3 md:flex-row md:gap-0">
                {['Password', 'PBKDF2 (100K)', 'Derived Key', 'AES-KW Wrap', 'AES-256-GCM', 'Ciphertext'].map(
                  (step, i, arr) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="whitespace-nowrap rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200">
                        {step}
                      </span>
                      {i < arr.length - 1 && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-blue-400 md:rotate-0 rotate-90">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                        </svg>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Tech Stack inline */}
            <div className="mt-10 pt-8 border-t border-slate-700/50">
              <h3 className="mb-5 text-center text-xs font-semibold uppercase tracking-wider text-blue-400">{t('Built with', 'Xây dựng với')}</h3>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {TECH.map((tech) => (
                  <span
                    key={tech.name}
                    className="rounded-full border border-slate-600 bg-slate-800 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:scale-105 hover:bg-slate-700 hover:text-white"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── TECH STACK — merged into Encryption section above, keeping id for nav ─── */}
      <section id="tech" className="hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">Technology</p>
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 md:text-4xl">
              Modern tech stack
            </h2>
            <p className="text-lg text-slate-600">
              Built with industry-standard tools for reliability and performance.
            </p>
          </div>

          <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-3">
            {TECH.map((tech) => (
              <span
                key={tech.name}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold ${tech.color} transition-transform hover:scale-105`}
              >
                {tech.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIMITATIONS ─── */}
      <section id="limitations" className="border-t border-slate-100 py-10 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-600">{t('Transparency', 'Minh bạch')}</p>
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 md:text-4xl">
              {t('Known limitations', 'Hạn chế đã biết')}
            </h2>
            <p className="text-lg text-slate-600">
              {t(
                'No system is perfectly secure. Here is what SecureMail does not protect against.',
                'Không hệ thống nào an toàn tuyệt đối. Đây là những gì SecureMail không bảo vệ được.',
              )}
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">
            {limitations.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase ${
                  item.severity === 'high' ? 'bg-red-100 text-red-600' :
                  item.severity === 'medium' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-gray-100">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-500">
            {t(
              'These limitations are inherent to client-side-only encryption architecture. A production system would add a backend for key escrow, CSP headers, digital signatures, and replay protection.',
              'Những hạn chế này là cố hữu của kiến trúc mã hóa chỉ phía client. Hệ thống production sẽ thêm backend cho ký gửi khóa, CSP headers, chữ ký số và bảo vệ phát lại.',
            )}
          </p>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <section id="team" className="border-t border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50 py-10 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header with university logos */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 flex items-center justify-center gap-5">
              <img src="/logo-hub.png" alt="HUB" className="h-20 w-auto object-contain" />
              <img src="/logo-khoa.png" alt="Khoa KHDL" className="h-20 w-auto object-contain" />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#7a1a2e]">{t('Our Team', 'Đội ngũ')}</p>
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-gray-100 md:text-4xl">
              SecureMail
            </h2>
            <p className="text-lg text-slate-600">
              {t('Department of Data Science — Ho Chi Minh City University of Banking', 'Khoa: Khoa học Dữ liệu — Trường Đại học Ngân hàng TP.HCM')}
            </p>
          </div>

          {/* Advisor card */}
          <div className="mx-auto mt-10 max-w-md">
            <div className="flex flex-col items-center text-center sm:flex-row sm:text-left gap-4 rounded-2xl border border-[#7a1a2e]/20 bg-gradient-to-r from-[#7a1a2e]/5 to-[#7a1a2e]/10 p-5 shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#7a1a2e] text-lg font-bold text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7a1a2e]">{t('Instructor', 'Giảng viên hướng dẫn')}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-gray-100">Nguyễn Hoài Đức</p>
                <p className="text-xs text-slate-500">{t('Ho Chi Minh City University of Banking', 'Trường Đại học Ngân hàng TP.HCM')}</p>
              </div>
            </div>
          </div>

          {/* Team grid — 7 members in responsive grid */}
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {TEAM.map((m) => (
              <div
                key={m.mssv}
                className="group flex flex-col items-center rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-6 text-center shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
              >
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white ${m.color}`}>
                  {m.initials}
                </div>
                <h3 className="mb-0.5 text-sm font-bold text-slate-900 dark:text-gray-100">{m.name}</h3>
                <p className="mb-2 text-xs font-medium text-slate-400">MSSV: {m.mssv}</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-slate-100 bg-gradient-to-br from-blue-600 to-indigo-700 py-12 md:py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-2xl sm:text-3xl font-bold text-white md:text-4xl">
            {t('Ready to send encrypted emails?', 'Sẵn sàng gửi email mã hóa?')}
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            {t('No installation required. Just sign in with your Google account.', 'Không cần cài đặt. Chỉ cần đăng nhập bằng tài khoản Google.')}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="cursor-pointer rounded-xl bg-white px-10 py-4 text-sm sm:text-base font-bold text-blue-600 shadow-lg transition-all hover:shadow-xl active:scale-[0.97]"
          >
            {t('Launch SecureMail', 'Khởi chạy SecureMail')}
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t-4 border-[#7a1a2e] bg-slate-50 dark:bg-gray-800 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-5">
            <img src="/logo-hub.png" alt="Trường Đại học Ngân hàng TP.HCM" className="h-12 sm:h-16 w-auto object-contain" />
            <img src="/logo-khoa.png" alt="Khoa Khoa học Dữ liệu" className="h-12 sm:h-16 w-auto object-contain" />
          </div>
          <div className="text-center text-sm text-slate-500 md:text-right">
            <p className="font-bold text-[#7a1a2e]">{t('Ho Chi Minh City University of Banking', 'Trường Đại học Ngân hàng Thành phố Hồ Chí Minh')}</p>
            <p className="font-medium text-slate-600">{t('Department of Data Science', 'Khoa: Khoa học Dữ liệu')}</p>
            <p>{t('Instructor: Nguyễn Hoài Đức — Semester 2, 2025-2026', 'GVHD: Nguyễn Hoài Đức — HK2 2025-2026')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
