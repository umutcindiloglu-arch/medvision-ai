'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MultiImageDropzone } from '@/components/multi-image-dropzone'
import { uploadMedicalImage } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import { readJson, readError } from '@/lib/api'

type Step = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'saving'

const STEP_LABELS: Record<Step, string> = {
  idle: '',
  uploading: 'Görüntüler yükleniyor...',
  extracting: 'PDF metni okunuyor...',
  analyzing: 'MedGemma analiz ediyor... (15-20 saniye sürebilir)',
  saving: 'Rapor kaydediliyor...',
}

interface PdfDoc {
  name: string
  text: string
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
  const [pdfDocs, setPdfDocs] = useState<PdfDoc[]>([])
  const [doctorNote, setDoctorNote] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [pdfLoading, setPdfLoading] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const isLoading = step !== 'idle'
  const hasContent = files.length > 0 || pdfDocs.length > 0 || doctorNote.trim().length > 0

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

  async function handlePdfSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (selected.length === 0) return

    setPdfLoading(true)
    for (const file of selected) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/extract-pdf', { method: 'POST', body: formData })
        if (!res.ok) {
          const { error } = await res.json()
          toast.error(error ?? 'PDF okunamadı.')
          continue
        }
        const { text } = await res.json()
        setPdfDocs((prev) => [...prev, { name: file.name, text }])
      } catch {
        toast.error(`${file.name} okunamadı.`)
      }
    }
    setPdfLoading(false)
  }

  function removePdf(index: number) {
    setPdfDocs((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hasContent) {
      toast.error('Görüntü, PDF veya not ekleyin.')
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

      // 1. Görüntüleri Storage'a yükle (varsa)
      let paths: string[] = []
      if (files.length > 0) {
        setStep('uploading')
        for (const file of files) {
          const { path, error } = await uploadMedicalImage(file, user.id)
          if (error) throw new Error(`Yükleme hatası: ${error}`)
          paths.push(path)
        }
      }

      // 2. PDF metinlerini doctor_note'a ekle
      const pdfText = pdfDocs.map((d) => `[${d.name}]\n${d.text}`).join('\n\n---\n\n')
      const combinedNote = [pdfText, doctorNote.trim()].filter(Boolean).join('\n\n')

      // 3. Modal'a gönder
      setStep('analyzing')
      const imagesB64 = await Promise.all(files.map(toBase64))

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images_b64: imagesB64,
          doctor_note: combinedNote || undefined,
        }),
      })

      if (!res.ok) throw new Error(await readError(res, 'Analiz başarısız.'))

      const { report_en, report_tr } = await readJson<{ report_en: string; report_tr: string }>(res)

      // 4. DB'ye kaydet
      setStep('saving')
      const imageUrl = paths.length > 1 ? JSON.stringify(paths) : (paths[0] ?? '')
      const imageName = files.length > 0
        ? files.map((f) => f.name).join(', ')
        : pdfDocs.length > 0
          ? pdfDocs.map((d) => d.name).join(', ')
          : 'Metin analizi'

      const { data: analysis, error: dbError } = await supabase
        .from('analyses')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          image_name: imageName,
          doctor_note: combinedNote || null,
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
          Tıbbi görüntü, PDF belge veya laboratuvar sonuçlarınızı yükleyin — MedGemma analiz etsin.
          JPEG, PNG, DICOM (.dcm) ve PDF desteklenir.
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

        {/* Görüntüler — opsiyonel */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tıbbi Görüntüler
            <span className="ml-1 text-slate-400 font-normal">(opsiyonel)</span>
          </label>
          <p className="text-xs text-slate-400 mb-2">X-ray, MRI, CT — JPG, PNG, DICOM. En fazla 5 görüntü.</p>
          <MultiImageDropzone
            files={files}
            previews={previews}
            onAdd={handleAdd}
            onRemove={handleRemove}
            disabled={isLoading}
          />
        </div>

        {/* PDF Belgeler — opsiyonel */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            PDF Belgeler
            <span className="ml-1 text-slate-400 font-normal">(opsiyonel)</span>
          </label>
          <p className="text-xs text-slate-400 mb-2">Kan tahlili, doktor raporu, epikriz vb. PDF dosyaları.</p>

          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handlePdfSelect}
          />

          {pdfDocs.length > 0 && (
            <div className="mb-2 space-y-1.5">
              {pdfDocs.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-slate-700 flex-1 truncate">{doc.name}</span>
                  <span className="text-xs text-slate-400">{(doc.text.length / 1000).toFixed(1)}k karakter</span>
                  <button
                    type="button"
                    onClick={() => removePdf(i)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            disabled={isLoading || pdfLoading}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-xl
              text-sm text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pdfLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                PDF okunuyor...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF Ekle
              </>
            )}
          </button>
        </div>

        {/* Klinisyen Notu */}
        <div>
          <label htmlFor="doctorNote" className="block text-sm font-medium text-slate-700 mb-1">
            Klinisyen Notu veya Laboratuvar Sonuçları
            <span className="ml-1 text-slate-400 font-normal">(opsiyonel)</span>
          </label>
          <textarea
            id="doctorNote"
            value={doctorNote}
            onChange={(e) => setDoctorNote(e.target.value)}
            disabled={isLoading}
            rows={4}
            placeholder="Örn: 65 yaşında erkek hasta, öksürük şikayetiyle başvurdu...
Veya doğrudan laboratuvar sonuçlarını yapıştırın: HGB: 9.2 g/dL, WBC: 14.3 ×10³/μL..."
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
          disabled={isLoading || pdfLoading || !hasContent}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed
            text-white font-medium rounded-xl transition-colors text-sm"
        >
          {isLoading
            ? 'Analiz ediliyor...'
            : files.length > 1
              ? `Analiz Et (${files.length} görüntü)`
              : 'Analiz Et'}
        </button>
      </form>
    </div>
  )
}
