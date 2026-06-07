'use client'

import { useState, useMemo } from 'react'

interface UserStat {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  analyses: number
  chats: number
}

interface Summary {
  totalUsers: number
  totalAnalyses: number
  totalChats: number
}

function fmt(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export function AdminClient({ users: initialUsers, summary }: { users: UserStat[]; summary: Summary }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'analyses' | 'chats'>('newest')

  const filtered = useMemo(() => {
    let list = initialUsers.filter((u) =>
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'analyses') list = [...list].sort((a, b) => b.analyses - a.analyses)
    if (sort === 'chats') list = [...list].sort((a, b) => b.chats - a.chats)
    return list
  }, [initialUsers, search, sort])

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Toplam Kullanıcı"
          value={summary.totalUsers}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <SummaryCard
          label="Toplam Analiz"
          value={summary.totalAnalyses}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <SummaryCard
          label="Toplam Sohbet"
          value={summary.totalChats}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="E-posta ile ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800
            placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          {(['newest', 'analyses', 'chats'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                sort === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {s === 'newest' ? 'En Yeni' : s === 'analyses' ? 'Analiz ↓' : 'Sohbet ↓'}
            </button>
          ))}
        </div>
      </div>

      {/* User table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">E-posta</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kayıt</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Son Giriş</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Analiz</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sohbet</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-sm">
                    Kullanıcı bulunamadı.
                  </td>
                </tr>
              )}
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 truncate max-w-[200px]">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmt(u.created_at)}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmt(u.last_sign_in_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-slate-700 font-semibold">{u.analyses}</span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${u.analyses >= 3 ? 'bg-red-400' : u.analyses >= 2 ? 'bg-amber-400' : 'bg-blue-400'}`}
                          style={{ width: `${Math.min((u.analyses / 3) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400">{u.analyses}/3</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 font-semibold">{u.chats}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      Ücretsiz
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} kullanıcı gösteriliyor
          </div>
        )}
      </div>
    </div>
  )
}
