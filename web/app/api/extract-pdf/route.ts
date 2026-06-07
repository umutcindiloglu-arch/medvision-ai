import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_PDF_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 })
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'PDF dosyası gerekli.' }, { status: 400 })
  if (file.size > MAX_PDF_SIZE) return NextResponse.json({ error: 'PDF 20MB\'den büyük olamaz.' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  // pdf-parse/lib/pdf-parse.js — doğrudan lib dosyasını import ediyoruz, aksi hâlde
  // paket kök import sırasında test PDF'i okumaya çalışır ve Next.js'de hata fırlatır.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse/lib/pdf-parse.js') as (buf: Buffer) => Promise<{ text: string }>
  const { text } = await pdfParse(buffer)

  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return NextResponse.json({ error: 'PDF\'den metin okunamadı (taranmış görüntü olabilir).' }, { status: 422 })

  return NextResponse.json({ text: cleaned.slice(0, 12000) }) // model context sınırı
}
