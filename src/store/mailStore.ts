import { create } from 'zustand'
import type { User, MailMeta, MailDetail } from '../types'

interface MailStore {
  // Auth — initialized from localStorage
  user: User | null
  accessToken: string | null
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void  // writes to both store + localStorage

  // Mail
  mailList: MailMeta[]
  selectedMail: MailDetail | null
  currentFolder: 'inbox' | 'sent' | 'trash' | 'encrypted-inbox' | 'encrypted-sent'
  nextPageToken: string | null
  setMailList: (list: MailMeta[]) => void
  appendMailList: (list: MailMeta[]) => void
  setNextPageToken: (token: string | null) => void
  setSelected: (mail: MailDetail | null) => void
  setFolder: (folder: 'inbox' | 'sent' | 'trash' | 'encrypted-inbox' | 'encrypted-sent') => void

  // Decrypt
  decryptedContent: string | null
  decryptError: string | null
  setDecrypted: (content: string | null) => void
  setDecryptError: (err: string | null) => void

  // UI
  isComposing: boolean
  isLoading: boolean
  searchQuery: string
  toggleCompose: () => void
  setLoading: (v: boolean) => void
  setSearchQuery: (q: string) => void

  // Compose context (reply / forward)
  composeMode: 'new' | 'reply' | 'forward'
  composeTo: string
  composeSubject: string
  composeBody: string
  replyMessageId: string
  openReply: (to: string, subject: string, body: string, messageId: string) => void
  openForward: (subject: string, body: string) => void
}

const TOKEN_KEY = 'sm_access_token'

export const useMailStore = create<MailStore>((set) => ({
  // Auth: init from localStorage
  user: null,
  accessToken: localStorage.getItem(TOKEN_KEY),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
    set({ accessToken: token })
  },

  // Mail
  mailList: [],
  selectedMail: null,
  currentFolder: 'inbox',
  nextPageToken: null,
  setMailList: (mailList) => set({ mailList }),
  appendMailList: (list) => set((s) => ({ mailList: [...s.mailList, ...list] })),
  setNextPageToken: (nextPageToken) => set({ nextPageToken }),
  setSelected: (selectedMail) => set({ selectedMail, decryptedContent: null, decryptError: null }),
  setFolder: (currentFolder) => set({ currentFolder, mailList: [], selectedMail: null, nextPageToken: null }),

  // Decrypt
  decryptedContent: null,
  decryptError: null,
  setDecrypted: (decryptedContent) => set({ decryptedContent, decryptError: null }),
  setDecryptError: (decryptError) => set({ decryptError, decryptedContent: null }),

  // UI
  isComposing: false,
  isLoading: false,
  searchQuery: '',
  toggleCompose: () => set((s) => ({
    isComposing: !s.isComposing,
    composeMode: s.isComposing ? 'new' : s.composeMode,
    composeTo: s.isComposing ? '' : s.composeTo,
    composeSubject: s.isComposing ? '' : s.composeSubject,
    composeBody: s.isComposing ? '' : s.composeBody,
    replyMessageId: s.isComposing ? '' : s.replyMessageId,
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Compose context
  composeMode: 'new',
  composeTo: '',
  composeSubject: '',
  composeBody: '',
  replyMessageId: '',
  openReply: (to, subject, body, messageId) => set({
    isComposing: true,
    composeMode: 'reply',
    composeTo: to,
    composeSubject: 'Re: ' + subject,
    composeBody: body,
    replyMessageId: messageId,
  }),
  openForward: (subject, body) => set({
    isComposing: true,
    composeMode: 'forward',
    composeTo: '',
    composeSubject: 'Fwd: ' + subject,
    composeBody: body,
    replyMessageId: '',
  }),
}))
