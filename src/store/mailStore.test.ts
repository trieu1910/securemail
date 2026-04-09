import { describe, it, expect, beforeEach } from 'vitest'
import { useMailStore } from './mailStore'

beforeEach(() => {
  localStorage.clear()
  // Reset zustand store to initial state between tests
  useMailStore.setState({
    user: null,
    accessToken: null,
    mailList: [],
    selectedMail: null,
    currentFolder: 'inbox',
    nextPageToken: null,
    decryptedContent: null,
    decryptError: null,
    isComposing: false,
    isLoading: false,
    searchQuery: '',
    composeMode: 'new',
    composeTo: '',
    composeSubject: '',
    composeBody: '',
    replyMessageId: '',
  })
})

describe('mailStore — initial state', () => {
  it('has correct default values', () => {
    const state = useMailStore.getState()
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.mailList).toEqual([])
    expect(state.selectedMail).toBeNull()
    expect(state.currentFolder).toBe('inbox')
    expect(state.nextPageToken).toBeNull()
    expect(state.isComposing).toBe(false)
    expect(state.isLoading).toBe(false)
    expect(state.searchQuery).toBe('')
    expect(state.decryptedContent).toBeNull()
    expect(state.decryptError).toBeNull()
  })
})

describe('mailStore — auth actions', () => {
  it('setToken stores token to localStorage', () => {
    useMailStore.getState().setToken('my-access-token')
    expect(useMailStore.getState().accessToken).toBe('my-access-token')
    expect(localStorage.getItem('sm_access_token')).toBe('my-access-token')
  })

  it('setToken(null) removes token from localStorage', () => {
    localStorage.setItem('sm_access_token', 'existing-token')
    useMailStore.getState().setToken(null)
    expect(useMailStore.getState().accessToken).toBeNull()
    expect(localStorage.getItem('sm_access_token')).toBeNull()
  })

  it('setUser updates user in store', () => {
    const user = { id: '1', email: 'test@test.com', name: 'Test', picture: '' }
    useMailStore.getState().setUser(user)
    expect(useMailStore.getState().user).toEqual(user)
  })

  it('setUser(null) clears user', () => {
    useMailStore.getState().setUser({ id: '1', email: 'a@b.com', name: 'A', picture: '' })
    useMailStore.getState().setUser(null)
    expect(useMailStore.getState().user).toBeNull()
  })
})

describe('mailStore — mail actions', () => {
  it('setMailList updates mail list', () => {
    const mails = [
      { id: '1', threadId: 't1', from: 'a@b.com', to: 'c@d.com', subject: 'Hi', date: '2024-01-01', snippet: '', isEncrypted: false, isRead: true },
      { id: '2', threadId: 't2', from: 'e@f.com', to: 'g@h.com', subject: 'Hey', date: '2024-01-02', snippet: '', isEncrypted: true, isRead: false },
    ]
    useMailStore.getState().setMailList(mails)
    expect(useMailStore.getState().mailList).toEqual(mails)
    expect(useMailStore.getState().mailList.length).toBe(2)
  })

  it('appendMailList adds to existing list', () => {
    const mail1 = { id: '1', threadId: 't1', from: '', to: '', subject: '', date: '', snippet: '', isEncrypted: false, isRead: true }
    const mail2 = { id: '2', threadId: 't2', from: '', to: '', subject: '', date: '', snippet: '', isEncrypted: false, isRead: true }
    useMailStore.getState().setMailList([mail1])
    useMailStore.getState().appendMailList([mail2])
    expect(useMailStore.getState().mailList.length).toBe(2)
  })

  it('setSelected selects a mail and clears decrypt state', () => {
    // Set some decrypt state first
    useMailStore.setState({ decryptedContent: 'old content', decryptError: 'old error' })

    const mail = {
      id: '1', threadId: 't1', from: 'a@b.com', to: 'c@d.com',
      subject: 'Test', date: '2024-01-01', snippet: '', isEncrypted: false, isRead: true,
      body: 'Hello', headers: {},
    }
    useMailStore.getState().setSelected(mail)
    expect(useMailStore.getState().selectedMail).toEqual(mail)
    expect(useMailStore.getState().decryptedContent).toBeNull()
    expect(useMailStore.getState().decryptError).toBeNull()
  })

  it('setFolder changes folder and clears mail state', () => {
    useMailStore.getState().setMailList([{ id: '1', threadId: 't1', from: '', to: '', subject: '', date: '', snippet: '', isEncrypted: false, isRead: true }])
    useMailStore.getState().setFolder('sent')
    expect(useMailStore.getState().currentFolder).toBe('sent')
    expect(useMailStore.getState().mailList).toEqual([])
    expect(useMailStore.getState().selectedMail).toBeNull()
    expect(useMailStore.getState().nextPageToken).toBeNull()
  })
})

describe('mailStore — UI actions', () => {
  it('toggleCompose toggles compose modal on', () => {
    expect(useMailStore.getState().isComposing).toBe(false)
    useMailStore.getState().toggleCompose()
    expect(useMailStore.getState().isComposing).toBe(true)
  })

  it('toggleCompose toggles compose modal off and resets compose fields', () => {
    useMailStore.setState({
      isComposing: true,
      composeMode: 'reply',
      composeTo: 'test@test.com',
      composeSubject: 'Re: Test',
      composeBody: 'Reply body',
      replyMessageId: 'msg1',
    })
    useMailStore.getState().toggleCompose()
    expect(useMailStore.getState().isComposing).toBe(false)
    expect(useMailStore.getState().composeMode).toBe('new')
    expect(useMailStore.getState().composeTo).toBe('')
    expect(useMailStore.getState().composeSubject).toBe('')
    expect(useMailStore.getState().composeBody).toBe('')
    expect(useMailStore.getState().replyMessageId).toBe('')
  })

  it('setLoading updates loading state', () => {
    useMailStore.getState().setLoading(true)
    expect(useMailStore.getState().isLoading).toBe(true)
    useMailStore.getState().setLoading(false)
    expect(useMailStore.getState().isLoading).toBe(false)
  })

  it('setSearchQuery updates search query', () => {
    useMailStore.getState().setSearchQuery('hello')
    expect(useMailStore.getState().searchQuery).toBe('hello')
  })
})

describe('mailStore — decrypt actions', () => {
  it('setDecrypted sets content and clears error', () => {
    useMailStore.setState({ decryptError: 'some error' })
    useMailStore.getState().setDecrypted('decrypted body')
    expect(useMailStore.getState().decryptedContent).toBe('decrypted body')
    expect(useMailStore.getState().decryptError).toBeNull()
  })

  it('setDecryptError sets error and clears content', () => {
    useMailStore.setState({ decryptedContent: 'some content' })
    useMailStore.getState().setDecryptError('Wrong password')
    expect(useMailStore.getState().decryptError).toBe('Wrong password')
    expect(useMailStore.getState().decryptedContent).toBeNull()
  })
})

describe('mailStore — compose context', () => {
  it('openReply sets reply compose state', () => {
    useMailStore.getState().openReply('sender@test.com', 'Original Subject', 'Quote body', 'msg123')
    const state = useMailStore.getState()
    expect(state.isComposing).toBe(true)
    expect(state.composeMode).toBe('reply')
    expect(state.composeTo).toBe('sender@test.com')
    expect(state.composeSubject).toBe('Re: Original Subject')
    expect(state.composeBody).toBe('Quote body')
    expect(state.replyMessageId).toBe('msg123')
  })

  it('openForward sets forward compose state', () => {
    useMailStore.getState().openForward('Original Subject', 'Forward body')
    const state = useMailStore.getState()
    expect(state.isComposing).toBe(true)
    expect(state.composeMode).toBe('forward')
    expect(state.composeTo).toBe('')
    expect(state.composeSubject).toBe('Fwd: Original Subject')
    expect(state.composeBody).toBe('Forward body')
    expect(state.replyMessageId).toBe('')
  })
})
