import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })

  const { analysis_id, message, attachment_b64 } = await request.json()

  // Analizi ve görüntü yolunu al
  const { data: analysis, error: analysisError } = await supabase
    .from('analyses')
    .select('image_url, id')
    .eq('id', analysis_id)
    .eq('user_id', user.id)
    .single()

  if (analysisError || !analysis) {
    return NextResponse.json({ error: 'Analiz bulunamadı.' }, { status: 404 })
  }

  // Mevcut mesaj geçmişini al
  const { data: history } = await supabase
    .from('messages')
    .select('role, content')
    .eq('analysis_id', analysis_id)
    .order('created_at', { ascending: true })

  // image_url: tek yol string veya JSON array string olabilir
  function parseFirstPath(imageUrl: string): string {
    if (imageUrl.startsWith('[')) {
      try { return JSON.parse(imageUrl)[0] ?? imageUrl } catch { /* fall through */ }
    }
    return imageUrl
  }
  const imagePath = parseFirstPath(analysis.image_url)

  // Görüntüyü çek — başarısız olursa boş string ile devam et (opsiyonel)
  let base64 = ''
  const { data: fileData } = await supabase.storage
    .from('medical-images')
    .download(imagePath)

  if (fileData) {
    const arrayBuffer = await fileData.arrayBuffer()
    base64 = Buffer.from(arrayBuffer).toString('base64')
  }

  // Modal'a gönderilecek mesaj listesi (mevcut geçmiş + yeni mesaj)
  const messages = [
    ...(history ?? []).map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ]

  const modalUrl = process.env.MODAL_API_URL
  if (!modalUrl) return NextResponse.json({ error: 'Modal URL yapılandırılmamış.' }, { status: 500 })

  const modalRes = await fetch(`${modalUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ image_base64: base64, messages, attachment_base64: attachment_b64 ?? '' }),
  })

  if (!modalRes.ok) {
    const text = await modalRes.text()
    return NextResponse.json({ error: `Modal hatası: ${text}` }, { status: modalRes.status })
  }

  const { reply } = await modalRes.json()

  // Kullanıcı mesajını ve yanıtı DB'ye kaydet
  await supabase.from('messages').insert([
    { analysis_id, role: 'user', content: message },
    { analysis_id, role: 'assistant', content: reply },
  ])

  return NextResponse.json({ reply })
}
