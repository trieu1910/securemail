import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MailList } from './MailList'
import { useMailStore } from '../../store/mailStore'
import type { MailMeta } from '../../types'

// Mock useMail hook
const mockRefresh = vi.fn().mockResolvedValue(undefined)
const mockLoadMore = vi.fn().mockResolvedValue(undefined)
const mockClearError = vi.fn()

vi.mock('../../hooks/useMail', () => ({
  useMail: () => ({
    mailList: useMailStore.getState().mailList,
    refresh: mockRefresh,
    loadMore: mockLoadMore,
    hasMore: useMailStore.getState().nextPageToken !== null,
    loadingMore: false,
    error: null,
    clearError: mockClearError,
  }),
}))

// Mock formatDate
vi.mock('../../utils/formatDate', () => ({
  formatDate: (d: string) => d ? 'Jan 1' : '',
}))

// Mock addressParser
vi.mock('../../utils/addressParser', () => ({
  extractName: (addr: string) => addr.split('@')[0],
}))

const mockMails: MailMeta[] = [
  {
    id: '1',
    threadId: 't1',
    from: 'alice@test.com',
    to: 'bob@test.com',
    subject: 'Hello World',
    date: '2024-01-01T00:00:00Z',
    snippet: 'Hello from Alice',
    isEncrypted: false,
    isRead: true,
  },
  {
    id: '2',
    threadId: 't2',
    from: 'carol@test.com',
    to: 'bob@test.com',
    subject: '[SecureMail] encrypted message',
    date: '2024-01-02T00:00:00Z',
    snippet: 'Encrypted content',
    isEncrypted: true,
    isRead: false,
  },
]

describe('MailList', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    useMailStore.setState({
      selectedMail: null,
      isLoading: false,
      currentFolder: 'inbox',
      searchQuery: '',
      mailList: [],
      nextPageToken: null,
    })
  })

  it('renders loading skeleton when loading', () => {
    useMailStore.setState({ isLoading: true, mailList: [] })

    const { container } = render(<MailList />)

    // SkeletonRow renders divs with class "skeleton"
    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders mail items when loaded', () => {
    useMailStore.setState({ isLoading: false, mailList: mockMails })

    render(<MailList />)

    expect(screen.getByText('Hello World')).toBeInTheDocument()
    expect(screen.getByText('[SecureMail] encrypted message')).toBeInTheDocument()
  })

  it('renders sender names', () => {
    useMailStore.setState({ isLoading: false, mailList: mockMails })

    render(<MailList />)

    expect(screen.getByText('alice')).toBeInTheDocument()
    expect(screen.getByText('carol')).toBeInTheDocument()
  })

  it('renders snippets', () => {
    useMailStore.setState({ isLoading: false, mailList: mockMails })

    render(<MailList />)

    expect(screen.getByText('Hello from Alice')).toBeInTheDocument()
    expect(screen.getByText('Encrypted content')).toBeInTheDocument()
  })

  it('click on mail calls setSelected', async () => {
    useMailStore.setState({ isLoading: false, mailList: mockMails })

    render(<MailList />)

    const mailRow = screen.getByText('Hello World').closest('button')!
    await user.click(mailRow)

    const selected = useMailStore.getState().selectedMail
    expect(selected).not.toBeNull()
    expect(selected!.id).toBe('1')
  })

  it('shows "No messages" empty state when no mails and not searching', () => {
    useMailStore.setState({ isLoading: false, mailList: [], searchQuery: '' })

    render(<MailList />)

    expect(screen.getByText('No messages')).toBeInTheDocument()
  })

  it('shows search empty state when searching with no results', () => {
    useMailStore.setState({ isLoading: false, mailList: [], searchQuery: 'nonexistent' })

    render(<MailList />)

    expect(screen.getByText(/No results for/)).toBeInTheDocument()
  })

  it('search filters mails by subject', () => {
    useMailStore.setState({ isLoading: false, mailList: mockMails, searchQuery: 'Hello' })

    render(<MailList />)

    expect(screen.getByText('Hello World')).toBeInTheDocument()
    expect(screen.queryByText('[SecureMail] encrypted message')).not.toBeInTheDocument()
  })

  it('search filters mails by sender', () => {
    useMailStore.setState({ isLoading: false, mailList: mockMails, searchQuery: 'carol' })

    render(<MailList />)

    expect(screen.queryByText('Hello World')).not.toBeInTheDocument()
    expect(screen.getByText('[SecureMail] encrypted message')).toBeInTheDocument()
  })

  it('search filters mails by snippet', () => {
    useMailStore.setState({ isLoading: false, mailList: mockMails, searchQuery: 'Encrypted content' })

    render(<MailList />)

    expect(screen.queryByText('Hello World')).not.toBeInTheDocument()
    expect(screen.getByText('[SecureMail] encrypted message')).toBeInTheDocument()
  })

  it('shows folder label', () => {
    useMailStore.setState({ isLoading: false, mailList: mockMails, currentFolder: 'inbox' })

    render(<MailList />)

    expect(screen.getByText('Inbox')).toBeInTheDocument()
  })

  it('shows "Encrypted Received" for encrypted-inbox folder', () => {
    useMailStore.setState({ isLoading: false, mailList: [], currentFolder: 'encrypted-inbox' })

    render(<MailList />)

    expect(screen.getByText('Encrypted Received')).toBeInTheDocument()
  })

  it('refresh button is rendered', () => {
    useMailStore.setState({ isLoading: false, mailList: mockMails })

    render(<MailList />)

    expect(screen.getByLabelText('Refresh')).toBeInTheDocument()
  })
})
