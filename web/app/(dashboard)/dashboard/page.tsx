import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Analysis } from '@/types'
import DashboardClient from '@/components/dashboard-client'

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

  return (
    <DashboardClient
      analyses={(analyses ?? []) as Pick<Analysis, 'id' | 'image_name' | 'created_at' | 'report_tr'>[]}
    />
  )
}
