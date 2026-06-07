import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Analysis } from '@/types'

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: analyses } = await supabase
    .from('analyses')
    .select('id, image_name, created_at, report_tr')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const hasAnalyses = analyses && analyses.length > 0

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-5">
          <svg className="w-9 h-9 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">MedVision AI</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Tıbbi görüntülerinizi MedGemma yapay zekasıyla analiz edin. Saniyeler içinde Türkçe ve İngilizce rapor alın.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700
            text-white font-medium rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Analiz Başlat
        </Link>
      </div>

      {/* Son Analizler */}
      {hasAnalyses ? (
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
            Son Analizler
          </h2>
          <div className="space-y-3">
            {(analyses as Pick<Analysis, 'id' | 'image_name' | 'created_at' | 'report_tr'>[]).map((a) => (
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
                    {a.image_name ?? 'Tıbbi Görüntü'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(a.created_at).toLocaleDateString('tr-TR', {
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
          <p className="text-slate-400 text-sm">Henüz analiz yapılmadı.</p>
          <p className="text-slate-400 text-xs mt-1">Yukarıdaki butona tıklayarak ilk analizinizi başlatın.</p>
        </div>
      )}
    </div>
  )
}
