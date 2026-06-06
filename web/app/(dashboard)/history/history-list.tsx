'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface AnalysisSummary {
  id: string
  image_name: string | null
  doctor_note: string | null
  created_at: string
  report_tr: string | null
}

interface HistoryListProps {
  analyses: AnalysisSummary[]
}

export function HistoryList({ analyses: initial }: HistoryListProps) {
  const router = useRouter()
  const [analyses, setAnalyses] = useState(initial)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  const filtered = analyses.filter((a) => {
    const q = search.toLowerCase()
    return (
      a.image_name?.toLowerCase().includes(q) ||
      a.doctor_note?.toLowerCase().includes(q) ||
      a.report_tr?.toLowerCase().includes(q)
    )
  })

  function startEdit(a: AnalysisSummary) {
    setEditingId(a.id)
    setEditName(a.image_name ?? '')
    setTimeout(() => editInputRef.current?.focus(), 0)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
  }

  async function saveEdit(id: string) {
    const name = editName.trim()
    if (!name) { cancelEdit(); return }

    try {
      const res = await fetch(`/api/analysis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error()
      setAnalyses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, image_name: name } : a))
      )
      toast.success('İsim güncellendi.')
    } catch {
      toast.error('İsim güncellenemedi.')
    } finally {
      cancelEdit()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu analizi silmek istediğinizden emin misiniz?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/analysis/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silme başarısız.')
      setAnalyses((prev) => prev.filter((a) => a.id !== id))
      toast.success('Analiz silindi.')
      router.refresh()
    } catch {
      toast.error('Analiz silinemedi.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* Arama */}
      <div className="relative mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Dosya adı, not veya rapor içinde ara..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white
            text-sm text-slate-800 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 text-sm">
            {search ? 'Arama kriterine uyan analiz bulunamadı.' : 'Henüz analiz yapılmadı.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white
                hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              {/* Görüntü ikonu */}
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Bilgiler */}
              <div className="flex-1 min-w-0">
                {editingId === a.id ? (
                  /* Düzenleme modu */
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={editInputRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(a.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className="flex-1 text-sm font-medium text-slate-800 border border-blue-400 rounded-lg
                        px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                    />
                    <button
                      onClick={() => saveEdit(a.id)}
                      className="p-1 text-green-600 hover:text-green-800 flex-shrink-0"
                      title="Kaydet"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-slate-400 hover:text-slate-600 flex-shrink-0"
                      title="İptal"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  /* Normal görünüm */
                  <Link href={`/analysis/${a.id}`} className="block">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {a.image_name ?? 'Tıbbi Görüntü'}
                    </p>
                    {a.doctor_note && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{a.doctor_note}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(a.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </Link>
                )}
              </div>

              {/* Aksiyon butonları */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {editingId !== a.id && (
                  <button
                    onClick={() => startEdit(a)}
                    title="Yeniden adlandır"
                    className="text-slate-300 hover:text-slate-500 p-1.5 rounded-lg hover:bg-slate-50
                      transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {editingId !== a.id && (
                  <Link
                    href={`/analysis/${a.id}`}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1
                      rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Görüntüle
                  </Link>
                )}
                {editingId !== a.id && (
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="text-xs text-slate-400 hover:text-red-500 px-2 py-1
                      rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === a.id ? '...' : 'Sil'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
