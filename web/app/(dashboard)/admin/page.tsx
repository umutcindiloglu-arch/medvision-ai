import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AdminClient } from './admin-client'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || user.email !== adminEmail) redirect('/dashboard')

  const admin = createAdminClient()
  const [
    { data: authData },
    { data: analyses },
    { data: chats },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('analyses').select('user_id, created_at'),
    admin.from('chat_sessions').select('user_id, created_at'),
  ])

  const analysisMap = new Map<string, number>()
  analyses?.forEach((r) => analysisMap.set(r.user_id, (analysisMap.get(r.user_id) ?? 0) + 1))
  const chatMap = new Map<string, number>()
  chats?.forEach((r) => chatMap.set(r.user_id, (chatMap.get(r.user_id) ?? 0) + 1))

  const users = (authData?.users ?? [])
    .map((u) => ({
      id: u.id,
      email: u.email ?? '—',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      analyses: analysisMap.get(u.id) ?? 0,
      chats: chatMap.get(u.id) ?? 0,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const summary = {
    totalUsers: users.length,
    totalAnalyses: analyses?.length ?? 0,
    totalChats: chats?.length ?? 0,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Admin Paneli</h1>
        <p className="text-slate-500 mt-1 text-sm">Kullanıcı istatistikleri ve kullanım bilgileri.</p>
      </div>
      <AdminClient users={users} summary={summary} />
    </div>
  )
}
