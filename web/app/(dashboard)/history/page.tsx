import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HistoryList } from './history-list'

export default async function HistoryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: analyses } = await supabase
    .from('analyses')
    .select('id, image_name, doctor_note, created_at, report_tr')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Analiz Geçmişi</h1>
          <p className="text-slate-500 text-sm mt-1">
            {analyses?.length ?? 0} analiz
          </p>
        </div>
        <a
          href="/analyze"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
            text-white font-medium rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Analiz
        </a>
      </div>

      <HistoryList analyses={analyses ?? []} />
    </div>
  )
}
