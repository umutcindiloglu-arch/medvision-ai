import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })

  const { messages, attachment_b64 } = await request.json()

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Mesaj gerekli.' }, { status: 400 })
  }

  const modalUrl = process.env.MODAL_API_URL
  if (!modalUrl) return NextResponse.json({ error: 'Modal URL yapılandırılmamış.' }, { status: 500 })

  // Görüntüsüz serbest sohbet — image_base64 boş, sadece mesaj geçmişi gönderilir
  const modalRes = await fetch(`${modalUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      image_base64: '',
      messages,
      attachment_base64: attachment_b64 ?? '',
    }),
  })

  if (!modalRes.ok) {
    const text = await modalRes.text()
    return NextResponse.json({ error: `Modal hatası: ${text}` }, { status: modalRes.status })
  }

  const { reply } = await modalRes.json()
  return NextResponse.json({ reply })
}
