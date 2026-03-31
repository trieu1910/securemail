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
  setMailList: (list: MailMeta[]) => void
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
  setMailList: (mailList) => set({ mailList }),
  setSelected: (selectedMail) => set({ selectedMail, decryptedContent: null, decryptError: null }),
  setFolder: (currentFolder) => set({ currentFolder, mailList: [], selectedMail: null }),

  // Decrypt
  decryptedContent: null,
  decryptError: null,
  setDecrypted: (decryptedContent) => set({ decryptedContent, decryptError: null }),
  setDecryptError: (decryptError) => set({ decryptError, decryptedContent: null }),

  // UI
  isComposing: false,
  isLoading: false,
  searchQuery: '',
  toggleCompose: () => set((s) => ({ isComposing: !s.isComposing })),
  setLoading: (isLoading) => set({ isLoading }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
