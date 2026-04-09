import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'system'

const THEME_KEY = 'sm_theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem(THEME_KEY) as Theme) ?? 'system'
  })

  useEffect(() => {
    const root = document.documentElement
    let isDark: boolean

    if (theme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark = theme === 'dark'
    }

    root.classList.toggle('dark', isDark)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
  }

  return { theme, setTheme }
}
