import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DecryptForm } from './DecryptForm'
import type { CryptoPayload } from '../../types'

// Mock useLang
vi.mock('../../hooks/useLang', () => ({
  useLang: () => ({
    lang: 'en',
    t: (en: string) => en,
  }),
}))

// Mock keyStore
vi.mock('../../utils/keyStore', () => ({
  keyStore: {
    getOwnKeys: vi.fn().mockReturnValue({}),
  },
}))

import { keyStore } from '../../utils/keyStore'

const passwordPayload: CryptoPayload = {
  version: '1.0',
  mode: 'password',
  subject: '',
  ciphertext: 'abc',
  iv: 'def',
  encryptedKey: 'ghi',
  salt: 'jkl',
}

const rsaPayload: CryptoPayload = {
  version: '1.0',
  mode: 'rsa',
  subject: '',
  ciphertext: 'abc',
  iv: 'def',
  encryptedKey: 'ghi',
}

describe('DecryptForm', () => {
  const user = userEvent.setup()
  let mockOnDecrypt: (password: string) => Promise<void>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(keyStore.getOwnKeys).mockReturnValue({})
    mockOnDecrypt = vi.fn<(password: string) => Promise<void>>().mockResolvedValue(undefined)
  })

  it('renders password input for password mode', () => {
    render(
      <DecryptForm onDecrypt={mockOnDecrypt} error={null} payload={passwordPayload} />
    )

    expect(screen.getByPlaceholderText('Enter message password')).toBeInTheDocument()
    expect(screen.getByLabelText('Decrypt')).toBeInTheDocument()
  })

  it('shows error message when error prop provided', () => {
    render(
      <DecryptForm onDecrypt={mockOnDecrypt} error="Wrong password. 4 attempts remaining." payload={passwordPayload} />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Wrong password. 4 attempts remaining.')
  })

  it('submit calls onDecrypt with password', async () => {
    render(
      <DecryptForm onDecrypt={mockOnDecrypt} error={null} payload={passwordPayload} />
    )

    const input = screen.getByPlaceholderText('Enter message password')
    await user.type(input, 'mypassword')

    const submitBtn = screen.getByLabelText('Decrypt')
    await user.click(submitBtn)

    expect(mockOnDecrypt).toHaveBeenCalledWith('mypassword')
  })

  it('submit button is disabled when password is empty', () => {
    render(
      <DecryptForm onDecrypt={mockOnDecrypt} error={null} payload={passwordPayload} />
    )

    const submitBtn = screen.getByLabelText('Decrypt')
    expect(submitBtn).toBeDisabled()
  })

  it('RSA mode shows RSA badge', () => {
    render(
      <DecryptForm onDecrypt={mockOnDecrypt} error={null} payload={rsaPayload} />
    )

    expect(screen.getByText('RSA Encrypted')).toBeInTheDocument()
  })

  it('RSA mode without private key shows warning', () => {
    vi.mocked(keyStore.getOwnKeys).mockReturnValue({})

    render(
      <DecryptForm onDecrypt={mockOnDecrypt} error={null} payload={rsaPayload} />
    )

    expect(screen.getByText(/No RSA private key found/)).toBeInTheDocument()
  })

  it('RSA mode with private key shows decrypt button', () => {
    vi.mocked(keyStore.getOwnKeys).mockReturnValue({
      rsaPublicKey: 'pub',
      rsaPrivateKey: 'priv',
    })

    render(
      <DecryptForm onDecrypt={mockOnDecrypt} error={null} payload={rsaPayload} />
    )

    expect(screen.getByLabelText('Decrypt with your private key')).toBeInTheDocument()
  })

  it('RSA mode decrypt button calls onDecryptRSA', async () => {
    vi.mocked(keyStore.getOwnKeys).mockReturnValue({
      rsaPublicKey: 'pub',
      rsaPrivateKey: 'priv',
    })

    const mockOnDecryptRSA = vi.fn().mockResolvedValue(undefined)

    render(
      <DecryptForm onDecrypt={mockOnDecrypt} onDecryptRSA={mockOnDecryptRSA} error={null} payload={rsaPayload} />
    )

    const decryptBtn = screen.getByLabelText('Decrypt with your private key')
    await user.click(decryptBtn)

    expect(mockOnDecryptRSA).toHaveBeenCalled()
  })

  it('RSA mode shows error when provided', () => {
    vi.mocked(keyStore.getOwnKeys).mockReturnValue({
      rsaPublicKey: 'pub',
      rsaPrivateKey: 'priv',
    })

    render(
      <DecryptForm onDecrypt={mockOnDecrypt} error="RSA decrypt failed" payload={rsaPayload} />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('RSA decrypt failed')
  })
})
