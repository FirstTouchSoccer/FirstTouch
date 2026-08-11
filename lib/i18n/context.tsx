'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Language } from './types'
import { en } from './en'
import { ru } from './ru'

const dictionaries = { en, ru }
const STORAGE_KEY = 'ft_language'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof en
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Starts at 'en' on the server and the client's first paint, then syncs from
  // localStorage right after mount — matches next-themes' own approach so
  // there's no server/client markup mismatch to warn about.
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === 'en' || saved === 'ru') setLanguageState(saved)
    } catch {
      // localStorage unavailable (private browsing, etc.) — stay on 'en'.
    }
  }, [])

  // Keeps the <html lang> attribute honest — screen readers and the
  // browser's own translation prompts both key off it.
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      window.localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Nothing to persist to — the choice still applies for this session.
    }
  }, [])

  const value = useMemo(
    () => ({ language, setLanguage, t: dictionaries[language] }),
    [language, setLanguage]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used within a LanguageProvider')
  return ctx
}
