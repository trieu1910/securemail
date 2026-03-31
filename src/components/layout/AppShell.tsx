import type { ReactNode } from 'react'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { MailList } from './MailList'
import { MobileNav } from './MobileNav'
import { useMailStore } from '../../store/mailStore'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  const selectedMail = useMailStore((s) => s.selectedMail)

  return (
    <div className="flex h-screen flex-col bg-gmail-bg overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* Sidebar: always hidden on mobile, shown on desktop */}
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>
        {/* MailList: full-width on mobile when no mail selected, hidden when mail selected */}
        <div className={`shrink-0 overflow-hidden ${selectedMail ? 'hidden md:block' : 'flex-1 md:flex-none'}`}>
          <MailList />
        </div>
        {/* Main content: hidden on mobile when NO mail is selected */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden bg-white min-w-0 ${!selectedMail ? 'hidden md:block' : ''}`}>
          {children}
        </main>
      </div>
      {/* Bottom nav: mobile only, hidden when viewing mail detail */}
      {!selectedMail && <MobileNav />}
    </div>
  )
}
