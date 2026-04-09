import { useState, useRef, useEffect } from 'react'
import { ShieldCheck, Search, X, LogOut, ChevronDown, Monitor, Sun, Moon } from 'lucide-react'
import { Avatar } from '../common/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { useMailStore } from '../../store/mailStore'
import { useTheme } from '../../hooks/useTheme'

export function TopBar() {
  const { user, logout } = useAuth()
  const { searchQuery, setSearchQuery } = useMailStore()
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const themeIcon = theme === 'system' ? Monitor : theme === 'light' ? Sun : Moon
  const themeLabel = theme === 'system' ? 'System' : theme === 'light' ? 'Light' : 'Dark'
  function cycleTheme() {
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    setTheme(next)
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="flex h-14 items-center justify-between bg-white dark:bg-gray-800 px-3 shadow-sm dark:shadow-gray-900/30 md:h-16 md:px-4">
      {/* Logo */}
      <div className="flex items-center gap-1.5 min-w-0 md:gap-2 md:min-w-[200px]">
        <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-gmail-blue shrink-0" />
        <span className="text-lg md:text-[22px] font-normal text-gmail-text-secondary dark:text-gray-300 truncate">SecureMail</span>
      </div>

      {/* Search bar */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gmail-text-secondary dark:text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mail"
            className="w-full rounded-full bg-gmail-bg dark:bg-gray-700 pl-12 pr-10 py-2.5 text-sm text-gmail-text dark:text-gray-100 outline-none placeholder:text-gmail-text-secondary dark:placeholder:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-600 hover:shadow-sm focus:bg-white dark:focus:bg-gray-600 focus:shadow-md focus:ring-2 focus:ring-gmail-border dark:focus:ring-gray-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); inputRef.current?.focus() }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 cursor-pointer text-gmail-text-secondary dark:text-gray-400 hover:bg-gmail-hover dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Theme toggle + Profile */}
      <div className="flex items-center gap-1">
        <button
          onClick={cycleTheme}
          aria-label={`Theme: ${themeLabel}`}
          title={`Theme: ${themeLabel}`}
          className="rounded-full p-2 cursor-pointer text-gmail-text-secondary dark:text-gray-400 hover:bg-gmail-hover dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {(() => { const Icon = themeIcon; return <Icon className="h-5 w-5" /> })()}
        </button>

      {user && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Account menu"
            className="flex items-center gap-1 rounded-full p-1 cursor-pointer hover:bg-gmail-hover dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Avatar name={user.name} picture={user.picture} size={32} />
            <ChevronDown className={`h-4 w-4 text-gmail-text-secondary dark:text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-lg border border-gmail-border dark:border-gray-600 bg-white dark:bg-gray-800 py-1 shadow-lg z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gmail-border dark:border-gray-600">
                <p className="text-sm font-medium text-gmail-text dark:text-gray-100">{user.name}</p>
                <p className="text-xs text-gmail-text-secondary dark:text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gmail-text-secondary dark:text-gray-400 hover:bg-gmail-hover dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </header>
  )
}
