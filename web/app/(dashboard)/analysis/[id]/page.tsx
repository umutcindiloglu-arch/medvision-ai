import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Analysis } from '@/types'
import { ReportView } from './report-view'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AnalysisPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: analysis, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !analysis) notFound()

  // Depolanan yoldan imzalı URL oluştur (1 saat geçerli)
  const { data: signedData } = await supabase.storage
    .from('medical-images')
    .createSignedUrl(analysis.image_url, 3600)

  const imageUrl = signedData?.signedUrl ?? null

  return (
    <div>
      <div className="mb-6">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Ana Sayfa
        </a>
      </div>
      <ReportView analysis={analysis as Analysis} imageUrl={imageUrl} />
    </div>
  )
}
