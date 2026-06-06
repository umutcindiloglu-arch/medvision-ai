import { NextResponse } from 'next/server'

// Modal container'ını önceden uyandırır (cold-start'ı kullanıcıdan gizlemek için).
// Frontend, sohbet/analiz arayüzü açılınca bunu fire-and-forget çağırır.
export async function GET() {
  const modalUrl = process.env.MODAL_API_URL
  if (!modalUrl) return NextResponse.json({ ok: false })

  try {
    await fetch(`${modalUrl}/health`, { method: 'GET' })
  } catch {
    // Uyandırma başarısız olsa bile sorun değil — gerçek istek yine deneyecek
  }
  return NextResponse.json({ ok: true })
}
