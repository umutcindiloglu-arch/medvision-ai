'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'

export default function Navbar() {
  const router = useRouter()
  const { T, lang, setLang } = useTranslation()
  const N = T.nav

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 max-w-5xl h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-800 hover:text-blue-600 transition">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          MedVision AI
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 transition">
            {N.home}
          </Link>
          <Link href="/chat" className="text-sm text-slate-500 hover:text-slate-800 transition">
            {N.assistant}
          </Link>
          <Link href="/medgemma" className="text-sm text-slate-500 hover:text-slate-800 transition hidden sm:block">
            {N.medgemma}
          </Link>
          <Link href="/history" className="text-sm text-slate-500 hover:text-slate-800 transition">
            {N.history}
          </Link>
          {/* Dil toggle */}
          <button
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-500"
            title={lang === 'tr' ? 'Switch to English' : "Türkçe'ye geç"}
          >
            {lang === 'tr' ? '🇬🇧' : '🇹🇷'}
          </button>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-500 hover:text-red-600 transition"
          >
            {N.sign_out}
          </button>
        </div>
      </div>
    </nav>
  )
}
