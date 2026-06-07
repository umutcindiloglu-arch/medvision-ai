'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MultiImageDropzone } from '@/components/multi-image-dropzone'
import { uploadMedicalImage } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import { readJson, readError, fetchWithWarmupRetry } from '@/lib/api'
import { useTranslation } from '@/lib/i18n/context'

type Step = 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'saving'

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
  const { T } = useTranslation()
  const AZ = T.analyze
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [pdfDocs, setPdfDocs] = useState<PdfDoc[]>([])
  const [doctorNote, setDoctorNote] = useState('')
  const [step, setStep] = useState<Step>('idle')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [warming, setWarming] = useState(true)
  const [retryMsg, setRetryMsg] = useState<string | null>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const isLoading = step !== 'idle'
  const hasContent = files.length > 0 || pdfDocs.length > 0 || doctorNote.trim().length > 0

  const stepLabel: Record<Step, string> = {
    idle: '',
    uploading: AZ.uploading,
    extracting: AZ.extracting,
    analyzing: AZ.analyzing,
    saving: AZ.saving,
  }

  useEffect(() => {
    fetch('/api/warmup').finally(() => setWarming(false))
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
          toast.error(error ?? AZ.err_no_content)
          continue
        }
        const { text } = await res.json()
        setPdfDocs((prev) => [...prev, { name: file.name, text }])
      } catch {
        toast.error(`${file.name}`)
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
      toast.error(AZ.err_no_content)
      return
    }

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error(AZ.err_session)
        router.push('/login')
        return
      }

      let paths: string[] = []
      if (files.length > 0) {
        setStep('uploading')
        for (const file of files) {
          const { path, error } = await uploadMedicalImage(file, user.id)
          if (error) throw new Error(`${AZ.uploading}: ${error}`)
          paths.push(path)
        }
      }

      const pdfText = pdfDocs.map((d) => `[${d.name}]\n${d.text}`).join('\n\n---\n\n')
      const combinedNote = [pdfText, doctorNote.trim()].filter(Boolean).join('\n\n')

      setStep('analyzing')
      const imagesB64 = await Promise.all(files.map(toBase64))

      const res = await fetchWithWarmupRetry(
        '/api/analyze',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images_b64: imagesB64,
            doctor_note: combinedNote || undefined,
          }),
        },
        (s) => setRetryMsg(s === null ? null : `Model ısınıyor, ${s}s içinde otomatik tekrar deniyor...`),
      )

      setRetryMsg(null)
      if (!res.ok) throw new Error(await readError(res, T.common.error))

      const { report_en, report_tr } = await readJson<{ report_en: string; report_tr: string }>(res)

      setStep('saving')
      const imageUrl = paths.length > 1 ? JSON.stringify(paths) : (paths[0] ?? '')
      const imageName = files.length > 0
        ? files.map((f) => f.name).join(', ')
        : pdfDocs.length > 0
          ? pdfDocs.map((d) => d.name).join(', ')
          : AZ.title

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

      if (dbError) throw new Error(dbError.message)

      toast.success(AZ.success)
      router.push(`/analysis/${analysis.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : T.common.error)
      setRetryMsg(null)
      setStep('idle')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">{AZ.title}</h1>
        <p className="text-slate-500 mt-1 text-sm">{AZ.desc}</p>
      </div>

      {warming && (
        <div className="mb-4 flex items-center gap-2.5 px-4 py-2.5 bg-sky-50 border border-sky-200 rounded-xl">
          <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-xs text-sky-700">{AZ.warming}</p>
        </div>
      )}

      <div className="mb-6 flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>{AZ.disclaimer_title}</strong> {AZ.disclaimer_text}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {AZ.images_label}
            <span className="ml-1 text-slate-400 font-normal">{AZ.images_optional}</span>
          </label>
          <p className="text-xs text-slate-400 mb-2">{AZ.images_hint}</p>
          <MultiImageDropzone
            files={files}
            previews={previews}
            onAdd={handleAdd}
            onRemove={handleRemove}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {AZ.pdf_label}
            <span className="ml-1 text-slate-400 font-normal">{AZ.images_optional}</span>
          </label>
          <p className="text-xs text-slate-400 mb-2">{AZ.pdf_hint}</p>

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
                  <span className="text-xs text-slate-400">{(doc.text.length / 1000).toFixed(1)}k</span>
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
                {AZ.pdf_reading}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {AZ.pdf_add}
              </>
            )}
          </button>
        </div>

        <div>
          <label htmlFor="doctorNote" className="block text-sm font-medium text-slate-700 mb-1">
            {AZ.note_label}
            <span className="ml-1 text-slate-400 font-normal">{AZ.images_optional}</span>
          </label>
          <textarea
            id="doctorNote"
            value={doctorNote}
            onChange={(e) => setDoctorNote(e.target.value)}
            disabled={isLoading}
            rows={4}
            placeholder={AZ.note_placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:opacity-60 disabled:cursor-not-allowed resize-none transition"
          />
        </div>

        {isLoading && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${retryMsg ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0 ${retryMsg ? 'border-amber-400' : 'border-blue-400'}`} />
            <p className={`text-sm font-medium ${retryMsg ? 'text-amber-700' : 'text-blue-700'}`}>
              {retryMsg ?? stepLabel[step]}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || pdfLoading || !hasContent}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed
            text-white font-medium rounded-xl transition-colors text-sm"
        >
          {isLoading
            ? AZ.submitting
            : files.length > 1
              ? AZ.submit_multi.replace('{n}', String(files.length))
              : AZ.submit}
        </button>
      </form>
    </div>
  )
}
