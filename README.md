<p align="center">
  <img src="https://img.shields.io/badge/AES--256--GCM-Encrypted-blue?style=for-the-badge" alt="AES-256-GCM" />
  <img src="https://img.shields.io/badge/PBKDF2-100K_iterations-green?style=for-the-badge" alt="PBKDF2" />
  <img src="https://img.shields.io/badge/Web_Crypto_API-Native-orange?style=for-the-badge" alt="Web Crypto API" />
  <img src="https://img.shields.io/badge/Backend-None-red?style=for-the-badge" alt="No Backend" />
</p>

# SecureMail

**End-to-end encrypted email web application** — encrypts all email content client-side before it touches Gmail. No backend server, no third-party crypto libraries, zero trust.

> Built as an academic project for the **Information Security in Business** course at Ho Chi Minh City University of Banking.

🔗 **Live Demo**: [securemail-fwcl.vercel.app](https://securemail-fwcl.vercel.app)

---

## How It Works

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
│                                                         │
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
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Features

| Feature | Description |
|---------|-------------|
| **AES-256-GCM** | Military-grade authenticated encryption (AEAD) |
| **PBKDF2-SHA256** | 100,000 iterations — makes brute-force computationally infeasible |
| **AES-KW** | RFC 3394 key wrapping with built-in integrity check |
| **Subject Bundling** | Email subject encrypted inside ciphertext — Gmail never sees it |
| **OAuth2 PKCE** | Secure Google authentication without client_secret |
| **No Backend** | Encryption keys never leave the browser |
| **No Dependencies** | Zero third-party crypto libraries — Web Crypto API only |
| **Gmail-like UI** | 3-column layout, virtual folders, mobile bottom nav |
| **Bilingual** | Full English/Vietnamese language toggle |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | TailwindCSS 3 |
| State | Zustand |
| Routing | React Router v7 |
| Crypto | Web Crypto API (browser-native) |
| Auth | Google OAuth2 PKCE |
| API | Gmail REST API v1 |
| Testing | Vitest + Testing Library |
| Deploy | Vercel |

## Project Structure

```
src/
├── services/
│   ├── cryptoService.ts      # AES-256-GCM + PBKDF2 + AES-KW encryption
│   ├── authService.ts        # Google OAuth2 PKCE flow
│   └── gmailService.ts       # Gmail REST API integration
├── store/mailStore.ts        # Zustand global state
├── hooks/                    # useAuth, useMail, useCrypto
├── components/
│   ├── layout/               # AppShell, Sidebar, MailList, TopBar, MobileNav
│   ├── compose/              # ComposeModal, PasswordLock
│   ├── decrypt/              # CipherPanel, DecryptForm, SecurityDetails
│   └── common/               # Avatar, Badge, Spinner, Toast, LangToggle
├── pages/
│   ├── Landing.tsx            # Project showcase + team
│   ├── Docs.tsx               # Technical documentation (18 sections)
│   ├── Login.tsx              # Google sign-in
│   └── Inbox.tsx              # Main email app
└── utils/                    # base64, MIME builder, date formatting
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
npm run build     # Production build
npm run test:run  # Run tests
```

> **Prerequisites**: Node.js 18+, Google Cloud Console project with Gmail API enabled, OAuth2 Web Client ID configured.

## Security Analysis

### What SecureMail Protects Against

| Threat | Protection | Mechanism |
|--------|-----------|-----------|
| Gmail reading emails | Content encrypted before transmission | AES-256-GCM client-side |
| Man-in-the-middle | Only ciphertext in transit | End-to-end encryption |
| Brute-force password | Computationally expensive | PBKDF2 100K iterations |
| Rainbow table attack | Unique salt per message | Random 16-byte salt |
| Ciphertext tampering | Integrity verification | GCM 128-bit auth tag |
| Key reuse | Fresh key per message | Random AES-256 content key |

### Known Limitations

| Severity | Vulnerability | Root Cause |
|----------|--------------|------------|
| CRITICAL | Token theft via localStorage | No backend for HttpOnly cookies |
| CRITICAL | Password interception via JS hooking | Frontend-only architecture |
| HIGH | No brute-force rate limiting | No backend server |
| MEDIUM | No sender authentication | No digital signatures |
| MEDIUM | No replay protection | No nonce/timestamp verification |
| LOW | Metadata visible to Gmail | Transport layer limitation |

> Full security analysis with DevTools attack demonstrations and production mitigations available in the [Documentation](https://securemail-fwcl.vercel.app/docs).

## Documentation

Comprehensive technical documentation available at [`/docs`](https://securemail-fwcl.vercel.app/docs):

- Encryption Architecture (3-layer key hierarchy)
- PBKDF2 Key Derivation
- AES-KW Key Wrapping (RFC 3394)
- AES-256-GCM Authenticated Encryption
- CryptoPayload JSON Format
- OAuth2 PKCE Authentication Flow
- Gmail API Integration
- Threat Model & Security Properties
- **DevTools Attack Vector Analysis** (6 attack demonstrations)
- **Production Mitigation Strategies** (5 defense-in-depth solutions)

## License

Academic project — Ho Chi Minh City University of Banking, Semester 2, 2025-2026.
