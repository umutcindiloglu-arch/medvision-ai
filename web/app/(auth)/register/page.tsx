'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { T } = useTranslation()
  const A = T.auth

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) { setError(A.error_password_mismatch); return }
    if (password.length < 8) { setError(A.error_password_short); return }

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message === 'User already registered' ? A.error_already_registered : A.error_register_generic)
      setLoading(false)
      return
    }

    if (data.session) { router.push('/dashboard'); router.refresh(); return }
    router.push('/login?registered=1')
    router.refresh()
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-800 mb-6">{A.register_title}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">{A.email}</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder={A.email_placeholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">{A.password}</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder={A.password_placeholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">{A.password_confirm}</label>
          <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
          {loading ? A.register_loading : A.register_btn}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        {A.has_account}{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">{A.login_link}</Link>
      </p>
    </>
  )
}
