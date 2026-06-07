import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HistoryList } from './history-list'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: analyses }, { data: chatSessions }] = await Promise.all([
    supabase
      .from('analyses')
      .select('id, image_name, doctor_note, created_at, report_tr')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('chat_sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
  ])

  return (
    <HistoryList
      analyses={analyses ?? []}
      chatSessions={chatSessions ?? []}
    />
  )
}
