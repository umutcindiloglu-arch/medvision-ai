import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
  }

  const body = await request.json()

  const modalUrl = process.env.MODAL_API_URL
  if (!modalUrl) {
    return NextResponse.json({ error: 'Modal URL yapılandırılmamış.' }, { status: 500 })
  }

  const modalRes = await fetch(`${modalUrl}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  })

  if (!modalRes.ok) {
    const text = await modalRes.text()
    return NextResponse.json({ error: `Modal hatası: ${text}` }, { status: modalRes.status })
  }

  const data = await modalRes.json()
  return NextResponse.json(data)
}
