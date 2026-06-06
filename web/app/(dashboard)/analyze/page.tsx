'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MultiImageDropzone } from '@/components/multi-image-dropzone'
import { uploadMedicalImage } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'

type Step = 'idle' | 'uploading' | 'analyzing' | 'saving'

const STEP_LABELS: Record<Step, string> = {
  idle: '',
  uploading: 'Görüntüler yükleniyor...',
  analyzing: 'MedGemma analiz ediyor... (15-20 saniye sürebilir)',
  saving: 'Rapor kaydediliyor...',
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AnalyzePage() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [doctorNote, setDoctorNote] = useState('')
  const [step, setStep] = useState<Step>('idle')

  const isLoading = step !== 'idle'

  // Sayfa açılınca Modal container'ını önceden uyandır (cold-start'ı gizle)
  useEffect(() => {
    fetch('/api/warmup').catch(() => {})
  }, [])

  const handleAdd = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles])
    setPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))])
  }, [])

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (files.length === 0) {
      toast.error('Lütfen en az bir görüntü seçin.')
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Oturum süresi dolmuş.')
        router.push('/login')
        return
      }

      // 1. Tüm görüntüleri Storage'a yükle
      setStep('uploading')
      const paths: string[] = []
      for (const file of files) {
        const { path, error } = await uploadMedicalImage(file, user.id)
        if (error) throw new Error(`Yükleme hatası: ${error}`)
        paths.push(path)
      }

      // 2. Tüm görüntüleri base64'e çevir ve Modal'a gönder
      setStep('analyzing')
      const imagesB64 = await Promise.all(files.map(toBase64))

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images_b64: imagesB64,
          doctor_note: doctorNote.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Analiz başarısız.')
      }

      const { report_en, report_tr } = await res.json()

      // 3. DB'ye kaydet — paths JSON olarak saklanır
      setStep('saving')
      const imageUrl = paths.length === 1 ? paths[0] : JSON.stringify(paths)
      const { data: analysis, error: dbError } = await supabase
        .from('analyses')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          image_name: files.map((f) => f.name).join(', '),
          doctor_note: doctorNote.trim() || null,
          report_en,
          report_tr,
        })
        .select('id')
        .single()

      if (dbError) throw new Error(`Kayıt hatası: ${dbError.message}`)

      toast.success('Analiz tamamlandı!')
      router.push(`/analysis/${analysis.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Beklenmeyen hata.')
      setStep('idle')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">Yeni Analiz</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Tıbbi görüntülerinizi yükleyin, MedGemma yapay zekası analiz etsin. En fazla 5 görüntü ekleyebilirsiniz.
        </p>
      </div>

      <div className="mb-6 flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Tıbbi Sorumluluk Reddi:</strong> Bu sistem yalnızca araştırma ve destek amaçlıdır.
          Üretilen raporlar tıbbi teşhis yerine geçmez.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tıbbi Görüntüler <span className="text-red-500">*</span>
          </label>
          <MultiImageDropzone
            files={files}
            previews={previews}
            onAdd={handleAdd}
            onRemove={handleRemove}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="doctorNote" className="block text-sm font-medium text-slate-700 mb-2">
            Klinisyen Notu <span className="text-slate-400 font-normal">(isteğe bağlı)</span>
          </label>
          <textarea
            id="doctorNote"
            value={doctorNote}
            onChange={(e) => setDoctorNote(e.target.value)}
            disabled={isLoading}
            rows={3}
            placeholder="Örn: 65 yaşında erkek hasta, öksürük şikayetiyle başvurdu. Göğüs X-ray AP ve lateral..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-60 disabled:cursor-not-allowed resize-none transition"
          />
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm text-blue-700 font-medium">{STEP_LABELS[step]}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || files.length === 0}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed
            text-white font-medium rounded-xl transition-colors text-sm"
        >
          {isLoading ? 'Analiz ediliyor...' : `Analiz Et${files.length > 1 ? ` (${files.length} görüntü)` : ''}`}
        </button>
      </form>
    </div>
  )
}
