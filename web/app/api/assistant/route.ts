import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })

  const { messages, attachment_b64, session_id } = await request.json()

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Mesaj gerekli.' }, { status: 400 })
  }

  const modalUrl = process.env.MODAL_API_URL
  if (!modalUrl) return NextResponse.json({ error: 'Modal URL yapılandırılmamış.' }, { status: 500 })

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

  // Chat oturumunu kaydet / güncelle
  let chatSessionId = session_id as string | null
  try {
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
    const userText = lastUserMsg?.content ?? ''

    if (!chatSessionId) {
      // Yeni oturum oluştur — başlık ilk kullanıcı mesajından türetilir
      const title = userText.slice(0, 60) || 'Sohbet'
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title, updated_at: new Date().toISOString() })
        .select('id')
        .single()
      chatSessionId = newSession?.id ?? null
    } else {
      // Mevcut oturumun updated_at'ini güncelle
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatSessionId)
        .eq('user_id', user.id)
    }

    if (chatSessionId) {
      await supabase.from('chat_messages').insert([
        { session_id: chatSessionId, role: 'user', content: userText },
        { session_id: chatSessionId, role: 'assistant', content: reply },
      ])
    }
  } catch {
    // DB kayıt hatası yanıtı engellemez
  }

  return NextResponse.json({ reply, session_id: chatSessionId })
}
