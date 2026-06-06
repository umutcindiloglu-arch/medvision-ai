'use client'

import { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'

const MAX_FILES = 5
const MAX_SIZE = 20 * 1024 * 1024
const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

interface MultiImageDropzoneProps {
  files: File[]
  previews: string[]
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
  disabled?: boolean
}

export function MultiImageDropzone({
  files, previews, onAdd, onRemove, disabled,
}: MultiImageDropzoneProps) {
  const remaining = MAX_FILES - files.length

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) return
      onAdd(accepted.slice(0, remaining))
    },
    [onAdd, remaining]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: true,
    maxFiles: remaining,
    disabled: disabled || remaining === 0,
  })

  return (
    <div className="space-y-3">
      {/* Önizleme grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((file, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previews[i]}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white
                    rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1">
                <p className="text-white text-[10px] truncate">{file.name}</p>
              </div>
            </div>
          ))}

          {/* Ek görüntü ekle alanı */}
          {remaining > 0 && !disabled && (
            <div
              {...getRootProps()}
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-300 hover:bg-blue-50/50'}`}
            >
              <input {...getInputProps()} />
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-[10px] text-slate-400 mt-1">Ekle</p>
            </div>
          )}
        </div>
      )}

      {/* İlk görüntü ekleme alanı */}
      {files.length === 0 && (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed min-h-52 cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'}
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
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
                {isDragActive ? 'Görüntüleri bırakın' : 'Görüntüleri sürükleyin veya tıklayın'}
              </p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — Maks. 20MB — En fazla {MAX_FILES} görüntü</p>
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <p className="text-xs text-slate-400">{files.length} görüntü seçildi{remaining > 0 ? ` — ${remaining} daha ekleyebilirsiniz` : ' (maksimum)'}</p>
      )}
    </div>
  )
}
