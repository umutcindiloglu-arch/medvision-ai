import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })

  const { images_b64, doctor_note } = await request.json()

  if (!Array.isArray(images_b64) || images_b64.length === 0) {
    return NextResponse.json({ error: 'En az bir görüntü gerekli.' }, { status: 400 })
  }

  const modalUrl = process.env.MODAL_API_URL
  if (!modalUrl) return NextResponse.json({ error: 'Modal URL yapılandırılmamış.' }, { status: 500 })

  const modalRes = await fetch(`${modalUrl}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ images_base64: images_b64, doctor_note }),
  })

  if (!modalRes.ok) {
    const text = await modalRes.text()
    return NextResponse.json({ error: `Modal hatası: ${text}` }, { status: modalRes.status })
  }

  return NextResponse.json(await modalRes.json())
}
