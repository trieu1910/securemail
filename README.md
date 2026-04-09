<p align="center">
  <img src="https://img.shields.io/badge/AES--256--GCM-Encrypted-blue?style=for-the-badge" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/RSA--OAEP-4096_bit-green?style=for-the-badge" alt="RSA-OAEP" />
  <img src="https://img.shields.io/badge/ECDSA-P--384_Signatures-purple?style=for-the-badge" alt="ECDSA" />
  <img src="https://img.shields.io/badge/PBKDF2-100K_iterations-teal?style=for-the-badge" alt="PBKDF2" />
  <img src="https://img.shields.io/badge/Web_Crypto_API-Native-orange?style=for-the-badge" alt="Web Crypto API" />
  <img src="https://img.shields.io/badge/Tests-177_passing-brightgreen?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/Backend-None-red?style=for-the-badge" alt="No Backend" />
</p>

# SecureMail

**End-to-end encrypted email web application** with dual encryption modes (password-based AES + RSA public key), ECDSA digital signatures, and defense-in-depth security — all client-side. No backend server, no third-party crypto libraries, zero trust.

> Built as an academic project for the **Information Security in Business** course at Ho Chi Minh City University of Banking.

[Live Demo](https://securemail-fwcl.vercel.app) | [Documentation](https://securemail-fwcl.vercel.app/docs) | [Workflow Case Study](https://securemail-fwcl.vercel.app/workflow)

---

## How It Works

### Password Mode (Symmetric)

```
┌─────────────────────────────────────────────────────────┐
│                      SENDER BROWSER                     │
│                                                         │
│  Password ──→ PBKDF2 (100K) ──→ Wrapping Key (AES-KW)  │
│                                        │                │
│  Random AES-256 Key ◄── wrapped by ────┘                │
│       │                                                 │
│  {body + subject} ──→ AES-256-GCM ──→ CryptoPayload    │
│                                            │            │
└────────────────────────────────────────────┼────────────┘
                                             │
                                        Gmail API
                                             │
┌────────────────────────────────────────────┼────────────┐
│                   GMAIL SERVER                          │
│                                                         │
│  Stores only: {"ciphertext":"Wc-bPnHQ...","iv":"..."}  │
│  Subject shows: [SecureMail] encrypted message          │
│  Google sees: nothing readable                          │
└────────────────────────────────────────────┼────────────┘
                                             │
┌────────────────────────────────────────────┼────────────┐
│                   RECIPIENT BROWSER                     │
│                                                         │
│  CryptoPayload ──→ Enter Password ──→ PBKDF2 ──→ Key   │
│       │                                     │           │
│       └──→ AES-256-GCM Decrypt ◄────────────┘           │
│                    │                                    │
│              {body + subject} ← plaintext restored      │
└─────────────────────────────────────────────────────────┘
```

### RSA Mode (Asymmetric)

```
┌─────────────────────────────────────────────────────────┐
│                      SENDER BROWSER                     │
│                                                         │
│  Recipient Public Key ──→ RSA-OAEP (4096-bit)           │
│                                  │                      │
│  Random AES-256 Key ◄── wrapped ─┘                      │
│       │                                                 │
│  {body + subject} ──→ AES-256-GCM ──→ CryptoPayload    │
│       │                                    │            │
│  [Optional] ECDSA P-384 Sign ──→ Signature │            │
│                                            │            │
└────────────────────────────────────────────┼────────────┘
                                             │
                                        Gmail API
                                             │
┌────────────────────────────────────────────┼────────────┐
│                   RECIPIENT BROWSER                     │
│                                                         │
│  CryptoPayload ──→ Private Key ──→ RSA-OAEP Unwrap     │
│       │                                  │              │
│       └──→ AES-256-GCM Decrypt ◄─────────┘              │
│                    │                                    │
│  Verify ECDSA Signature ──→ ✅ Verified / ❌ Invalid     │
│              {body + subject} ← plaintext restored      │
└─────────────────────────────────────────────────────────┘
```

## Features

### Encryption & Security

| Feature | Description |
|---------|-------------|
| **AES-256-GCM** | Authenticated encryption (AEAD) for content — confidentiality + integrity |
| **RSA-OAEP 4096-bit** | Asymmetric key wrapping — no shared password needed |
| **ECDSA P-384** | Digital signatures — sender verification + tamper detection |
| **PBKDF2-SHA256** | 100,000 iterations key derivation — brute-force resistant |
| **AES-KW** | RFC 3394 key wrapping for password mode |
| **CSP Headers** | Content Security Policy preventing XSS attacks |
| **iframe Sandbox** | Email HTML fully isolated from app (no `allow-same-origin`) |
| **Zod Validation** | Runtime schema validation for all CryptoPayload inputs |
| **Token Validation** | OAuth token verified via Google API, cached 5 min |
| **Rate Limiting** | Exponential backoff + lockout after 5 failed decrypts |
| **No Backend** | Keys never leave the browser |
| **No Dependencies** | Zero third-party crypto libraries — Web Crypto API only |

### User Experience

| Feature | Description |
|---------|-------------|
| **Dual Encryption** | Toggle between password mode and RSA public key mode |
| **Key Manager** | Generate, export, import keys with fingerprint display |
| **Dark Mode** | System / Light / Dark toggle across all components |
| **Keyboard Shortcuts** | `j/k` navigate, `r` reply, `f` forward, `c` compose, `?` help |
| **Drag & Drop** | Drag files onto compose modal to attach |
| **Undo Send** | 7-second countdown before sending with cancel option |
| **Subject Bundling** | Email subject encrypted inside ciphertext — Gmail never sees it |
| **Gmail-like UI** | 3-column layout, virtual folders, mobile bottom nav |
| **Bilingual** | Full English / Vietnamese language toggle |
| **PWA** | Add to Home Screen on Android Chrome (standalone mode) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Styling | TailwindCSS 3 |
| State | Zustand 5 |
| Routing | React Router v7 |
| Crypto | Web Crypto API (AES-GCM, RSA-OAEP, ECDSA, PBKDF2) |
| Validation | Zod |
| Auth | Google OAuth2 PKCE |
| API | Gmail REST API v1 |
| Testing | Vitest + Testing Library (177 tests, 80%+ coverage) |
| CI/CD | GitHub Actions (lint → test → build) |
| Deploy | Vercel |

## Project Structure

```
src/
├── services/
│   ├── cryptoService.ts      # AES-256-GCM + PBKDF2 + AES-KW + RSA-OAEP + ECDSA
│   ├── authService.ts        # Google OAuth2 PKCE flow
│   └── gmailService.ts       # Gmail REST API integration
├── store/mailStore.ts        # Zustand global state
├── hooks/
│   ├── useAuth.ts            # Authentication hook
│   ├── useMail.ts            # Mail fetching + pagination
│   ├── useCrypto.ts          # Decrypt with rate limiting
│   ├── useTheme.ts           # Dark mode (system/light/dark)
│   ├── useKeyboardShortcuts.ts # Global keyboard shortcuts
│   └── useLang.ts            # EN/VI language toggle
├── components/
│   ├── layout/               # AppShell, Sidebar, MailList, TopBar, MobileNav
│   ├── compose/              # ComposeModal (password/RSA modes), PasswordLock
│   ├── decrypt/              # CipherPanel, DecryptForm, SecurityDetails
│   └── common/               # KeyManager, ShortcutHelp, Avatar, Badge, Toast
├── pages/
│   ├── Landing.tsx            # Project showcase + team
│   ├── Docs.tsx               # Technical documentation (24 sections)
│   ├── Workflow.tsx           # Development case study
│   ├── Login.tsx              # Google sign-in
│   └── Inbox.tsx              # Main email app + keyboard shortcuts
├── utils/
│   ├── keyStore.ts           # Key pair + trusted key management
│   ├── base64.ts             # base64url encoding
│   ├── mimeBuilder.ts        # MIME email construction
│   ├── addressParser.ts      # Email address parsing (shared)
│   └── formatDate.ts         # Date formatting
└── types/index.ts            # CryptoPayload, RSAKeyPair, SigningKeyPair
```

## Quick Start

```bash
git clone https://github.com/trieu1910/securemail.git
cd securemail
npm install
```

Create `.env`:
```env
VITE_GOOGLE_CLIENT_ID=<your_client_id>.apps.googleusercontent.com
VITE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_GMAIL_API_BASE=https://gmail.googleapis.com/gmail/v1/users/me
```

```bash
npm run dev       # http://localhost:5173
npm run build     # TypeScript check + production build
npm run test:run  # 177 tests
npm run lint      # ESLint check
```

> **Prerequisites**: Node.js 18+, Google Cloud Console project with Gmail API enabled, OAuth2 Web Client ID.

## Security Analysis

### Algorithms Used

| Algorithm | Purpose | Standard |
|-----------|---------|----------|
| AES-256-GCM | Content encryption (AEAD) | NIST SP 800-38D |
| RSA-OAEP 4096 | Key wrapping (asymmetric) | RFC 8017 |
| ECDSA P-384 | Digital signatures | FIPS 186-4 |
| PBKDF2-SHA256 | Key derivation (100K iter) | RFC 2898 |
| AES-KW | Key wrapping (symmetric) | RFC 3394 |
| OAuth 2.0 + PKCE | Authentication | RFC 6749, RFC 7636 |

### Security Properties

| Property | Mechanism |
|----------|-----------|
| Confidentiality | AES-256-GCM + RSA-OAEP hybrid encryption |
| Integrity | GCM 128-bit auth tag + ECDSA signatures |
| Authentication | ECDSA P-384 sender verification |
| Non-repudiation | ECDSA digital signatures |
| Key exchange | RSA public key (no shared secret needed) |
| XSS protection | CSP headers + iframe sandbox |
| Brute-force protection | PBKDF2 100K + exponential backoff + lockout |
| Input validation | Zod runtime schema checks |

### What SecureMail Protects Against

| Threat | Protection |
|--------|-----------|
| Gmail reading emails | Content encrypted before transmission (AES-256-GCM) |
| Man-in-the-middle | End-to-end encryption + ECDSA signature verification |
| Brute-force password | PBKDF2 100K + rate limiting (exponential backoff + lock after 5) |
| Rainbow table attack | Unique random 16-byte salt per message |
| Ciphertext tampering | GCM 128-bit auth tag + ECDSA integrity check |
| Sender impersonation | ECDSA P-384 digital signatures |
| XSS attacks | Content Security Policy headers + iframe sandbox="" |
| Key reuse | Fresh random AES-256 content key per message |

### Known Limitations

| Severity | Vulnerability | Status |
|----------|--------------|--------|
| HIGH | Token in localStorage (XSS risk) | Mitigated by CSP headers |
| MEDIUM | Private key in localStorage (physical access) | Inherent to frontend-only |
| MEDIUM | No replay protection | Open — needs nonce/timestamp |
| LOW | Metadata visible to Gmail | Transport layer limitation |

> Full security analysis with DevTools attack demonstrations and production mitigations: [Documentation](https://securemail-fwcl.vercel.app/docs)

## Testing

**18 test files, 177 tests, 80%+ coverage**

```bash
npm run test:run
```

| Category | Tests | Coverage |
|----------|-------|----------|
| Crypto (password + RSA + ECDSA) | 53 | Services |
| Hooks (auth, crypto, mail, theme, lang) | 42 | Hooks |
| Components (DecryptForm, PasswordLock, MailList) | 27 | UI |
| Utils (keyStore, addressParser) | 25 | Utilities |
| Store (mailStore state management) | 16 | State |
| Existing (base64, date, MIME, highlight) | 14 | Utils |

## CI/CD

GitHub Actions pipeline runs on every push/PR to `main`:

```
lint (ESLint) ─┐
               ├──→ build (TypeScript + Vite)
test (Vitest) ─┘
```

## License

Academic project — Ho Chi Minh City University of Banking, Department of Data Science, Semester 2, 2025-2026.

Instructor: Nguyen Hoai Duc
