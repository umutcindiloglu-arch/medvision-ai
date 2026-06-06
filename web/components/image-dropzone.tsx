'use client'

import { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'

interface ImageDropzoneProps {
  onFileSelect: (file: File) => void
  preview: string | null
  disabled?: boolean
}

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export function ImageDropzone({ onFileSelect, preview, disabled }: ImageDropzoneProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setError(null)
      if (rejected.length > 0) {
        const code = rejected[0].errors[0].code
        if (code === 'file-too-large') setError('Dosya 20MB\'den büyük olamaz.')
        else if (code === 'file-invalid-type') setError('Sadece JPG, PNG veya WebP formatı destekleniyor.')
        else setError('Geçersiz dosya.')
        return
      }
      if (accepted[0]) onFileSelect(accepted[0])
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled,
  })

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-blue-200 bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Önizleme" className="w-full max-h-80 object-contain" />
        {!disabled && (
          <button
            type="button"
            onClick={() => onFileSelect(null as unknown as File)}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-600 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm border border-slate-200 transition-colors"
          >
            Değiştir
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed
          min-h-52 cursor-pointer transition-colors
          ${isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {isDragActive ? 'Görüntüyü bırakın' : 'Görüntüyü sürükleyin veya tıklayın'}
            </p>
            <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — Maks. 20MB</p>
          </div>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
