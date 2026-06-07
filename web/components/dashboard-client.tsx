'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import { Analysis } from '@/types'

interface Props {
  analyses: Pick<Analysis, 'id' | 'image_name' | 'created_at' | 'report_tr'>[]
}

export default function DashboardClient({ analyses }: Props) {
  const { T, lang } = useTranslation()
  const D = T.dashboard

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-5">
          <svg className="w-9 h-9 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">MedVision AI</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">{D.hero_desc}</p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700
            text-white font-medium rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {D.new_analysis}
        </Link>
      </div>

      {analyses.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">{D.recent}</h2>
          <div className="space-y-3">
            {analyses.map((a) => (
              <Link
                key={a.id}
                href={`/analysis/${a.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white
                  hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {a.image_name ?? T.history.image_default}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(a.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 text-sm">{D.no_analyses}</p>
          <p className="text-slate-400 text-xs mt-1">{D.no_analyses_hint}</p>
        </div>
      )}
    </div>
  )
}
