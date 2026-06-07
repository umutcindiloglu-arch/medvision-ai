'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import t, { Lang, Translations } from './translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  T: Translations
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'tr',
  setLang: () => {},
  T: t.tr as Translations,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr')

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null
    if (stored === 'en' || stored === 'tr') setLangState(stored)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('lang', l)
    document.documentElement.lang = l
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, T: t[lang] as Translations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
