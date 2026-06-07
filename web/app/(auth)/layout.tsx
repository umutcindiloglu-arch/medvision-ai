'use client'

import { useTranslation } from '@/lib/i18n/context'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { T, lang, setLang } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Dil toggle */}
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="text-xs font-semibold border border-slate-200 bg-white rounded-lg px-2.5 py-1 text-slate-500 hover:bg-slate-50 transition"
          >
            {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
          </button>
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">MedVision AI</h1>
          <p className="text-sm text-slate-500 mt-1">{T.auth.platform_name}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {children}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">{T.common.disclaimer}</p>
      </div>
    </div>
  )
}
