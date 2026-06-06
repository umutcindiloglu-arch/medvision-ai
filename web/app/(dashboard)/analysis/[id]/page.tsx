import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Analysis, Message } from '@/types'
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

  const [signedResult, messagesResult] = await Promise.all([
    supabase.storage.from('medical-images').createSignedUrl(analysis.image_url, 3600),
    supabase.from('messages').select('*').eq('analysis_id', id).order('created_at', { ascending: true }),
  ])

  const imageUrl = signedResult.data?.signedUrl ?? null
  const messages = (messagesResult.data ?? []) as Message[]

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
      <ReportView analysis={analysis as Analysis} imageUrl={imageUrl} initialMessages={messages} />
    </div>
  )
}
