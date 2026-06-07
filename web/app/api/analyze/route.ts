import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Modal cold-start + model inference uzun sürebilir; Vercel Hobby planı max 60s
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })

  // Kullanıcı kota kontrolü — ücretsiz tier: max 3 analiz
  const { count } = await supabase
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= 3) {
    return NextResponse.json(
      { error: 'Ücretsiz 3 analiz hakkınız doldu. Abonelik sistemi yakında eklenecek.' },
      { status: 403 }
    )
  }

  const { images_b64, doctor_note } = await request.json()

  const images = Array.isArray(images_b64) ? images_b64 : []
  if (images.length === 0 && !doctor_note?.trim()) {
    return NextResponse.json({ error: 'Görüntü veya metin içeriği gerekli.' }, { status: 400 })
  }

  const modalUrl = process.env.MODAL_API_URL
  if (!modalUrl) return NextResponse.json({ error: 'Modal URL yapılandırılmamış.' }, { status: 500 })

  const modalRes = await fetch(`${modalUrl}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ images_base64: images, doctor_note }),
  })

  if (!modalRes.ok) {
    const text = await modalRes.text()
    return NextResponse.json({ error: `Modal hatası: ${text}` }, { status: modalRes.status })
  }

  return NextResponse.json(await modalRes.json())
}
