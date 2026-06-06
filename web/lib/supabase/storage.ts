'use client'

import { createClient } from './client'

export async function uploadMedicalImage(
  file: File,
  userId: string
): Promise<{ path: string; error: string | null }> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('medical-images')
    .upload(path, file, { contentType: file.type })

  if (error) return { path: '', error: error.message }
  return { path, error: null }
}

export async function getSignedImageUrl(path: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase.storage
    .from('medical-images')
    .createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}
