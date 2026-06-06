import Link from 'next/link'

export default function AnalysisNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl mb-5">
        <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-800 mb-2">Analiz bulunamadı</h2>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">
        Bu analiz mevcut değil veya erişim izniniz yok.
      </p>
      <div className="flex gap-3">
        <Link
          href="/history"
          className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors"
        >
          Geçmişe Dön
        </Link>
        <Link
          href="/analyze"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
        >
          Yeni Analiz
        </Link>
      </div>
    </div>
  )
}
