import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../hooks/useLang'
import { LangToggle } from '../components/common/LangToggle'

// ─── DATA ──────────────────────────────────────────────────────────────────

const SETUP_STEPS = [
  {
    numEn: '01',
    titleEn: 'Install Claude Code',
    titleVi: 'Cài Claude Code',
    descEn: 'Install the CLI from claude.ai/code. It runs in your terminal and edits files directly.',
    descVi: 'Cài CLI từ claude.ai/code. Chạy trong terminal và chỉnh sửa file trực tiếp.',
    cmd: 'npm install -g @anthropic-ai/claude-code',
  },
  {
    numEn: '02',
    titleEn: 'Open project folder',
    titleVi: 'Mở folder dự án',
    descEn: 'Run claude in your project root. It reads CLAUDE.md for context.',
    descVi: 'Chạy claude trong thư mục gốc dự án. Nó đọc CLAUDE.md để lấy context.',
    cmd: 'cd securemail && claude',
  },
  {
    numEn: '03',
    titleEn: 'Add MCP servers',
    titleVi: 'Thêm MCP servers',
    descEn: 'Plugins like Playwright (browser automation) and Context7 (live docs).',
    descVi: 'Plugin như Playwright (tự động hóa trình duyệt) và Context7 (docs realtime).',
    cmd: 'claude mcp add playwright',
  },
  {
    numEn: '04',
    titleEn: 'Start prompting',
    titleVi: 'Bắt đầu prompt',
    descEn: 'Just describe what you want in plain language. Vietnamese or English both work.',
    descVi: 'Chỉ cần mô tả bạn muốn gì bằng ngôn ngữ thường. Tiếng Việt hay tiếng Anh đều được.',
    cmd: '> "Tạo cho tôi trang Login với Google OAuth"',
  },
]

const PROMPTS = [
  {
    titleEn: 'Building a feature',
    titleVi: 'Xây tính năng mới',
    promptEn: 'Build an end-to-end encrypted email app using Gmail as transport. Use AES-256-GCM with PBKDF2 password derivation. No backend.',
    promptVi: 'Xây ứng dụng email mã hóa đầu cuối dùng Gmail làm transport. Dùng AES-256-GCM với PBKDF2 password derivation. Không backend.',
    resultEn: 'Claude scaffolded the entire crypto service, Gmail API integration, and React components in one session.',
    resultVi: 'Claude scaffold toàn bộ crypto service, tích hợp Gmail API và React components trong một session.',
    tagEn: 'Feature',
    tagVi: 'Tính năng',
    color: 'blue',
  },
  {
    titleEn: 'Fixing a bug',
    titleVi: 'Sửa bug',
    promptEn: 'Người nhận giải mã thì báo Decryption failed. Wrong password. Check thử coi sao.',
    promptVi: 'Người nhận giải mã thì báo Decryption failed. Wrong password. Check thử coi sao.',
    resultEn: 'Found the bug: Gmail wraps long base64 strings with quoted-printable encoding (=\\r\\n), corrupting the ciphertext. Fixed by stripping QP before parsing.',
    resultVi: 'Tìm ra bug: Gmail wrap base64 dài bằng quoted-printable (=\\r\\n), làm hỏng ciphertext. Sửa bằng cách strip QP trước khi parse.',
    tagEn: 'Debug',
    tagVi: 'Debug',
    color: 'red',
  },
  {
    titleEn: 'Refining UI',
    titleVi: 'Tinh chỉnh UI',
    promptEn: 'Khó đọc chữ quá. Lên internet xem mấy email client pro làm thế nào.',
    promptVi: 'Khó đọc chữ quá. Lên internet xem mấy email client pro làm thế nào.',
    resultEn: 'Switched from dark theme to Gmail-like light theme. Used the ui-ux-pro-max skill to pick a Trust & Authority palette.',
    resultVi: 'Chuyển từ dark theme sang light theme giống Gmail. Dùng skill ui-ux-pro-max để chọn palette Trust & Authority.',
    tagEn: 'UI',
    tagVi: 'UI',
    color: 'purple',
  },
  {
    titleEn: 'Parallel features',
    titleVi: 'Tính năng song song',
    promptEn: 'Thêm CC/BCC, Reply/Forward, Delete, Mark read/unread, Pagination song song bằng 4 agents.',
    promptVi: 'Thêm CC/BCC, Reply/Forward, Delete, Mark read/unread, Pagination song song bằng 4 agents.',
    resultEn: '4 sub-agents ran in parallel, each editing different files. All 5 features delivered in a single session.',
    resultVi: '4 sub-agents chạy song song, mỗi agent sửa file khác nhau. Tất cả 5 tính năng xong trong 1 session.',
    tagEn: 'Parallel',
    tagVi: 'Song song',
    color: 'emerald',
  },
  {
    titleEn: 'Visual UX review',
    titleVi: 'Review UX trực quan',
    promptEn: 'Dùng Playwright chụp ảnh tất cả các trang trên mobile 375px. Tìm vấn đề UX và sửa hết.',
    promptVi: 'Dùng Playwright chụp ảnh tất cả các trang trên mobile 375px. Tìm vấn đề UX và sửa hết.',
    resultEn: 'Playwright MCP took screenshots of every page. Claude identified touch targets <44px, broken layouts, then fixed all of them.',
    resultVi: 'Playwright MCP chụp ảnh từng trang. Claude phát hiện touch target <44px, layout bị bể, rồi sửa hết.',
    tagEn: 'Test',
    tagVi: 'Test',
    color: 'amber',
  },
  {
    titleEn: 'Cleaning up commits',
    titleVi: 'Dọn commits',
    promptEn: 'Tôi có quá nhiều commit nhỏ kiểu "fix typo". Squash lại thành commits gọn cho thầy đỡ thấy.',
    promptVi: 'Tôi có quá nhiều commit nhỏ kiểu "fix typo". Squash lại thành commits gọn cho thầy đỡ thấy.',
    resultEn: 'Claude used git reset --soft to combine 50+ messy commits into 3 clean professional commits with proper messages.',
    resultVi: 'Claude dùng git reset --soft gộp 50+ commit lộn xộn thành 3 commit chuyên nghiệp với message tử tế.',
    tagEn: 'Git',
    tagVi: 'Git',
    color: 'slate',
  },
]

const TIPS = [
  {
    titleEn: 'Speak naturally',
    titleVi: 'Nói tự nhiên',
    bodyEn: 'You don\'t need to write English prompts. "Sửa cho tôi cái nút bị lệch" works just as well as "Fix the misaligned button."',
    bodyVi: 'Không cần viết prompt tiếng Anh. "Sửa cho tôi cái nút bị lệch" hiệu quả y như "Fix the misaligned button."',
  },
  {
    titleEn: 'Show, don\'t tell',
    titleVi: 'Cho xem thay vì kể',
    bodyEn: 'Paste a screenshot of the bug instead of describing it. Claude understands images and can pinpoint issues faster.',
    bodyVi: 'Paste screenshot của bug thay vì mô tả. Claude hiểu hình ảnh và phát hiện vấn đề nhanh hơn.',
  },
  {
    titleEn: 'Iterate fast',
    titleVi: 'Lặp nhanh',
    bodyEn: 'Don\'t write a perfect spec upfront. Start rough, see what Claude builds, then refine. 5 quick iterations beat 1 perfect prompt.',
    bodyVi: 'Đừng viết spec hoàn hảo từ đầu. Bắt đầu thô, xem Claude làm gì, rồi tinh chỉnh. 5 lần lặp nhanh hơn 1 prompt hoàn hảo.',
  },
  {
    titleEn: 'Use parallel agents',
    titleVi: 'Dùng agent song song',
    bodyEn: 'For independent features (no shared files), launch multiple sub-agents at once. 4 features in 1 session beats 4 sessions.',
    bodyVi: 'Với tính năng độc lập (không chia sẻ file), chạy nhiều sub-agent cùng lúc. 4 tính năng trong 1 session nhanh hơn 4 session.',
  },
  {
    titleEn: 'Trust but verify',
    titleVi: 'Tin nhưng kiểm tra',
    bodyEn: 'Always run npm run build and test the actual UI after Claude finishes. AI can write code that compiles but doesn\'t work.',
    bodyVi: 'Luôn chạy npm run build và test UI thật sau khi Claude xong. AI có thể viết code compile được nhưng không chạy đúng.',
  },
  {
    titleEn: 'Let it use tools',
    titleVi: 'Để nó dùng tools',
    bodyEn: 'Install MCP servers (Playwright, Context7). Claude can take screenshots, fetch live docs, and verify its own work.',
    bodyVi: 'Cài MCP servers (Playwright, Context7). Claude có thể chụp ảnh, fetch docs realtime, và verify công việc của chính nó.',
  },
]

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
}

// ─── COMPONENT ─────────────────────────────────────────────────────────────

export function Workflow() {
  const navigate = useNavigate()
  const { lang, toggle, t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-[Lexend] text-slate-800 antialiased">
      {/* ─── NAV ─── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button onClick={() => navigate('/')} className="flex cursor-pointer items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">SecureMail</span>
          </button>
          <div className="hidden items-center gap-8 md:flex">
            <button onClick={() => navigate('/')} className="cursor-pointer text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">{t('Home', 'Trang chủ')}</button>
            <button onClick={() => navigate('/docs')} className="cursor-pointer text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">{t('Docs', 'Tài liệu')}</button>
            <span className="text-sm font-medium text-blue-600">{t('Workflow', 'Quy trình')}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LangToggle lang={lang} toggle={toggle} />
            <button
              onClick={() => navigate('/login')}
              className="hidden whitespace-nowrap cursor-pointer rounded-lg bg-blue-600 sm:text-sm px-5 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.97] md:inline-flex"
            >
              {t('Open App', 'Mở ứng dụng')}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18 18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"} />
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="relative z-50 border-t border-slate-200 bg-white shadow-lg md:hidden">
            <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-4">
              <button onClick={() => { setMenuOpen(false); navigate('/') }} className="block cursor-pointer py-1 text-left text-base font-medium text-slate-600">{t('Home', 'Trang chủ')}</button>
              <button onClick={() => { setMenuOpen(false); navigate('/docs') }} className="block cursor-pointer py-1 text-left text-base font-medium text-slate-600">{t('Docs', 'Tài liệu')}</button>
              <button onClick={() => { setMenuOpen(false); navigate('/login') }} className="mt-2 w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white">{t('Open App', 'Mở ứng dụng')}</button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-white" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/4 rounded-full bg-blue-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 py-20 md:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5">
            <span className="text-xs font-medium text-blue-700">{t('Workflow', 'Quy trình')}</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            {t('How we vibe coded', 'Cách nhóm tôi vibe code')}
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t('this entire project', 'toàn bộ dự án này')}
            </span>
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            {t(
              'No tutorials. No Stack Overflow. Just us, Claude Code, and a continuous loop of "describe → generate → review → refine". This page shows exactly how that loop works.',
              'Không tutorial. Không Stack Overflow. Chỉ có nhóm, Claude Code, và vòng lặp "mô tả → sinh code → review → tinh chỉnh". Trang này show chính xác vòng lặp đó hoạt động ra sao.',
            )}
          </p>
        </div>
      </section>

      {/* ─── THE LOOP ─── */}
      <section className="border-b border-slate-100 py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">{t('The Loop', 'Vòng lặp')}</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {t('Vibe coding is a feedback loop', 'Vibe coding là một vòng lặp phản hồi')}
            </h2>
            <p className="text-lg text-slate-600">
              {t(
                'You don\'t write code. You describe what you want, watch the AI build it, check if it works, then ask for changes. Repeat until done.',
                'Bạn không viết code. Bạn mô tả cái mình muốn, xem AI xây, kiểm tra xem có chạy không, rồi yêu cầu sửa. Lặp đến khi xong.',
              )}
            </p>
          </div>

          {/* Loop diagram */}
          <div className="relative rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 md:p-12">
            <div className="grid gap-6 md:grid-cols-4">
              {[
                {
                  step: '1',
                  titleEn: 'Describe',
                  titleVi: 'Mô tả',
                  descEn: 'Tell Claude what you want in plain language. Be specific about behavior, vague about implementation.',
                  descVi: 'Nói cho Claude biết bạn muốn gì bằng ngôn ngữ thường. Cụ thể về hành vi, mơ hồ về cách triển khai.',
                  icon: 'M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z',
                },
                {
                  step: '2',
                  titleEn: 'Generate',
                  titleVi: 'Sinh code',
                  descEn: 'Claude reads files, edits code, runs commands, and even uses tools like Playwright or Git.',
                  descVi: 'Claude đọc file, sửa code, chạy lệnh, và thậm chí dùng tools như Playwright hay Git.',
                  icon: 'M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z',
                },
                {
                  step: '3',
                  titleEn: 'Review',
                  titleVi: 'Review',
                  descEn: 'Test the result. Run the app. Check the build. Take a screenshot. Did it work?',
                  descVi: 'Test kết quả. Chạy app. Kiểm tra build. Chụp ảnh. Có chạy không?',
                  icon: 'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
                },
                {
                  step: '4',
                  titleEn: 'Refine',
                  titleVi: 'Tinh chỉnh',
                  descEn: 'If it\'s wrong, just say so. "The button is too small" or "This crashes when I click it". Loop back to step 1.',
                  descVi: 'Nếu sai, cứ nói. "Nút này nhỏ quá" hay "Cái này crash khi tôi click". Quay lại bước 1.',
                  icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
                },
              ].map((item, i) => (
                <div key={item.step} className="relative">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {item.step}
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-base font-bold text-slate-900">{t(item.titleEn, item.titleVi)}</h3>
                    <p className="text-xs leading-relaxed text-slate-600">{t(item.descEn, item.descVi)}</p>
                  </div>
                  {/* Arrow to next step */}
                  {i < 3 && (
                    <div className="absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 md:left-auto md:right-0 md:top-1/2 md:mt-0 md:translate-x-3 md:-translate-y-1/2 md:block">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Loop back arrow */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>{t('Loop until done', 'Lặp lại đến khi xong')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SETUP ─── */}
      <section className="border-b border-slate-100 bg-slate-50/50 py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">{t('Setup', 'Cài đặt')}</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {t('Our setup in 4 steps', 'Setup của nhóm trong 4 bước')}
            </h2>
            <p className="text-lg text-slate-600">
              {t(
                'Everything you need to start vibe coding the same way.',
                'Tất cả những gì bạn cần để bắt đầu vibe code y như vậy.',
              )}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {SETUP_STEPS.map((step) => (
              <div key={step.numEn} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-baseline gap-3">
                  <span className="font-mono text-xs font-bold text-blue-600">{step.numEn}</span>
                  <h3 className="text-lg font-bold text-slate-900">{t(step.titleEn, step.titleVi)}</h3>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">{t(step.descEn, step.descVi)}</p>
                <div className="rounded-lg bg-slate-900 px-4 py-3">
                  <code className="font-mono text-xs text-emerald-400">$ {step.cmd}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── REAL PROMPTS ─── */}
      <section className="border-b border-slate-100 py-20 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-600">{t('Real Prompts', 'Prompt thật')}</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {t('Prompts we actually used', 'Những prompt nhóm đã dùng thật')}
            </h2>
            <p className="text-lg text-slate-600">
              {t(
                'No fake examples. These are actual messages we sent to Claude Code while building this project.',
                'Không phải ví dụ giả. Đây là tin nhắn thật nhóm gửi cho Claude Code khi xây dự án này.',
              )}
            </p>
          </div>

          <div className="space-y-5">
            {PROMPTS.map((p, i) => {
              const c = COLOR_MAP[p.color]
              return (
                <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* Prompt */}
                  <div className="border-b border-slate-100 p-5 md:p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`rounded-full ${c.bg} ${c.text} ${c.border} border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
                        {t(p.tagEn, p.tagVi)}
                      </span>
                      <span className="text-xs font-medium text-slate-400">{t(p.titleEn, p.titleVi)}</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                        Q
                      </div>
                      <p className="flex-1 text-sm leading-relaxed text-slate-700 md:text-base">
                        "{t(p.promptEn, p.promptVi)}"
                      </p>
                    </div>
                  </div>
                  {/* Result */}
                  <div className="bg-slate-50/50 p-5 md:p-6">
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                        ✦
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">{t('Result', 'Kết quả')}</p>
                        <p className="text-sm leading-relaxed text-slate-600 md:text-base">
                          {t(p.resultEn, p.resultVi)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── TIPS ─── */}
      <section className="bg-slate-900 py-20 text-white md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-400">{t('Tips', 'Mẹo')}</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              {t('What we learned the hard way', 'Những gì nhóm học được')}
            </h2>
            <p className="text-lg text-slate-400">
              {t(
                '6 patterns that made vibe coding actually work for us.',
                '6 pattern giúp vibe coding thực sự hiệu quả với nhóm.',
              )}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TIPS.map((tip, i) => (
              <div key={i} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-400">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-base font-bold text-white">{t(tip.titleEn, tip.titleVi)}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{t(tip.bodyEn, tip.bodyVi)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-b border-slate-100 py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            {t('Try it yourself', 'Tự thử đi')}
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-slate-600">
            {t(
              'Install Claude Code, open a folder, and start describing what you want to build. That\'s it.',
              'Cài Claude Code, mở một folder, và bắt đầu mô tả thứ bạn muốn xây. Vậy thôi.',
            )}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://claude.ai/code"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl active:scale-[0.97]"
            >
              {t('Get Claude Code', 'Tải Claude Code')}
            </a>
            <a
              href="https://github.com/trieu1910/securemail"
              target="_blank"
              rel="noopener noreferrer"
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-8 py-3.5 text-base font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.97]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
              </svg>
              {t('See the source code', 'Xem source code')}
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t-4 border-[#7a1a2e] bg-slate-50 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-6 text-center">
          <p className="text-sm text-slate-600">
            {t('SecureMail — Vibe coded with Claude Code', 'SecureMail — Vibe code bằng Claude Code')}
          </p>
          <p className="text-xs text-slate-400">
            {t('Ho Chi Minh City University of Banking — Semester 2, 2025-2026', 'Trường Đại học Ngân hàng TP.HCM — HK2 2025-2026')}
          </p>
        </div>
      </footer>
    </div>
  )
}
