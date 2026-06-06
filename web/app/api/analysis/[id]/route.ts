import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 })

  // Önce görüntü yolunu al (Storage'dan silmek için)
  const { data: analysis } = await supabase
    .from('analyses')
    .select('image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!analysis) return NextResponse.json({ error: 'Analiz bulunamadı.' }, { status: 404 })

  // Storage'dan görüntüyü sil
  await supabase.storage.from('medical-images').remove([analysis.image_url])

  // DB'den analizi sil (messages ON DELETE CASCADE ile otomatik silinir)
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
