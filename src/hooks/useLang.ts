import { useState, useEffect } from 'react'

export type Lang = 'en' | 'vi'

const KEY = 'sm_lang'

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem(KEY) as Lang) || 'en'
  })

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem(KEY, l)
  }

  function toggle() {
    setLang(lang === 'en' ? 'vi' : 'en')
  }

  // Sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY && (e.newValue === 'en' || e.newValue === 'vi')) {
        setLangState(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { lang, setLang, toggle, t: (en: string, vi: string) => (lang === 'en' ? en : vi) }
}
