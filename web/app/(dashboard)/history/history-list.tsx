'use client'

import { useState } from 'react'
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

  const filtered = analyses.filter((a) => {
    const q = search.toLowerCase()
    return (
      a.image_name?.toLowerCase().includes(q) ||
      a.doctor_note?.toLowerCase().includes(q) ||
      a.report_tr?.toLowerCase().includes(q)
    )
  })

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
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
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
              <Link href={`/analysis/${a.id}`} className="flex-1 min-w-0">
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

              {/* Aksiyon butonları */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/analysis/${a.id}`}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1
                    rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Görüntüle
                </Link>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId === a.id}
                  className="text-xs text-slate-400 hover:text-red-500 px-2 py-1
                    rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deletingId === a.id ? '...' : 'Sil'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
