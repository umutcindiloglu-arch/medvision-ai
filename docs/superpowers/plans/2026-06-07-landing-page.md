# Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giriş yapmamış kullanıcılara MedVision AI'yı tanıtan, animasyonlu, herkese açık bir landing sayfası eklemek; aynı zamanda mevcut dashboard rotasını `/dashboard`'a taşımak ve navbar'a "Anasayfa" sekmesi eklemek.

**Architecture:** `app/page.tsx` herkese açık landing page olur (oturum varsa `/dashboard`'a yönlendirir). Mevcut `(dashboard)/page.tsx` içeriği `(dashboard)/dashboard/page.tsx`'e taşınır, URL `/dashboard` olur. Scanner animasyonu CSS-only `@keyframes` ile `globals.css`'e eklenir; harici kütüphane kullanılmaz.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS v4, Supabase SSR, TypeScript

---

## Dosya Haritası

| Dosya | Değişiklik |
|-------|-----------|
| `web/app/globals.css` | Scanner animasyon keyframe'leri + utility sınıfları eklenir |
| `web/app/(dashboard)/dashboard/page.tsx` | YENİ — mevcut `(dashboard)/page.tsx` buraya taşınır |
| `web/app/(dashboard)/page.tsx` | SİLİNİR |
| `web/app/page.tsx` | YENİ — herkese açık landing page |
| `web/app/(auth)/login/page.tsx` | `router.push('/')` → `router.push('/dashboard')` |
| `web/app/(auth)/register/page.tsx` | `router.push('/')` → `router.push('/dashboard')` |
| `web/components/navbar.tsx` | "Anasayfa" linki (`/dashboard`) + logo linki `/dashboard`'a güncellenir |

---

## Task 1: Scanner animasyonlarını globals.css'e ekle

**Files:**
- Modify: `web/app/globals.css`

- [ ] **Step 1: globals.css sonuna animasyon bloğunu ekle**

`web/app/globals.css` dosyasının sonuna şunu ekle:

```css
/* ── Landing page scanner animations ── */
@keyframes scan-beam {
  0%   { top: 5%;  opacity: 0; }
  5%   { opacity: 1; }
  95%  { opacity: 1; }
  100% { top: 95%; opacity: 0; }
}
.animate-scan-beam {
  animation: scan-beam 2.2s linear infinite;
  position: absolute;
}

@keyframes anomaly-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2); }
  50%       { box-shadow: 0 0 0 7px rgba(239, 68, 68, 0.1), 0 0 16px rgba(239, 68, 68, 0.4); }
}
.animate-anomaly-pulse {
  animation: anomaly-pulse 1.5s ease-in-out infinite;
}

@keyframes bar-grow {
  from { width: 0; }
  to   { width: var(--bar-w); }
}
.animate-bar-grow {
  animation: bar-grow 1.8s ease forwards;
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}
.animate-slide-in {
  animation: slide-in-left 0.35s ease both;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fade-up 0.4s ease both;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
.animate-dot-pulse {
  animation: dot-pulse 1s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-scan-beam,
  .animate-anomaly-pulse,
  .animate-bar-grow,
  .animate-slide-in,
  .animate-fade-up,
  .animate-dot-pulse { animation: none; }
  .animate-bar-grow { width: var(--bar-w); }
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/globals.css
git commit -m "feat: landing page scanner animation keyframes"
```

---

## Task 2: Dashboard anasayfasını /dashboard rotasına taşı

**Files:**
- Create: `web/app/(dashboard)/dashboard/page.tsx`
- Delete: `web/app/(dashboard)/page.tsx`

- [ ] **Step 1: `(dashboard)/dashboard/` klasörünü oluştur ve page.tsx'i yaz**

`web/app/(dashboard)/dashboard/page.tsx` dosyasını oluştur — içeriği mevcut `web/app/(dashboard)/page.tsx` ile **birebir aynı**:

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Analysis } from '@/types'

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: analyses } = await supabase
    .from('analyses')
    .select('id, image_name, created_at, report_tr')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const hasAnalyses = analyses && analyses.length > 0

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-5">
          <svg className="w-9 h-9 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-2">MedVision AI</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Tıbbi görüntülerinizi MedGemma yapay zekasıyla analiz edin. Saniyeler içinde Türkçe ve İngilizce rapor alın.
        </p>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700
            text-white font-medium rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Analiz Başlat
        </Link>
      </div>

      {/* Son Analizler */}
      {hasAnalyses ? (
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
            Son Analizler
          </h2>
          <div className="space-y-3">
            {(analyses as Pick<Analysis, 'id' | 'image_name' | 'created_at' | 'report_tr'>[]).map((a) => (
              <Link
                key={a.id}
                href={`/analysis/${a.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white
                  hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {a.image_name ?? 'Tıbbi Görüntü'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(a.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors flex-shrink-0"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-400 text-sm">Henüz analiz yapılmadı.</p>
          <p className="text-slate-400 text-xs mt-1">Yukarıdaki butona tıklayarak ilk analizinizi başlatın.</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Eski `(dashboard)/page.tsx`'i sil**

```bash
rm web/app/\(dashboard\)/page.tsx
```

- [ ] **Step 3: Dev server'ı başlatıp `/dashboard` rotasının çalıştığını doğrula**

```bash
cd web && npm run dev
```

Tarayıcıda `http://localhost:3000/dashboard` aç. Giriş yapmamışsan `/login`'e, yapmışsan eski dashboard içeriğini görmelisin.

- [ ] **Step 4: Commit**

```bash
git add web/app/\(dashboard\)/dashboard/page.tsx
git rm web/app/\(dashboard\)/page.tsx
git commit -m "feat: dashboard home rotası / → /dashboard"
```

---

## Task 3: Auth yönlendirmelerini /dashboard'a güncelle

**Files:**
- Modify: `web/app/(auth)/login/page.tsx:35`
- Modify: `web/app/(auth)/register/page.tsx:46`

- [ ] **Step 1: Login sayfasındaki yönlendirmeyi güncelle**

`web/app/(auth)/login/page.tsx` içinde `router.push('/')` satırını bul ve değiştir:

```tsx
// ÖNCE:
router.push('/')

// SONRA:
router.push('/dashboard')
```

- [ ] **Step 2: Register sayfasındaki yönlendirmeyi güncelle**

`web/app/(auth)/register/page.tsx` içinde `router.push('/')` satırını bul ve değiştir:

```tsx
// ÖNCE (satır ~46):
router.push('/')

// SONRA:
router.push('/dashboard')
```

- [ ] **Step 3: Doğrula**

Dev server'da giriş yap. Başarılı girişten sonra `/dashboard`'a yönlendirdiğini teyit et (adres çubuğunda `/dashboard` görünmeli).

- [ ] **Step 4: Commit**

```bash
git add web/app/\(auth\)/login/page.tsx web/app/\(auth\)/register/page.tsx
git commit -m "fix: başarılı giriş/kayıt sonrası /dashboard'a yönlendir"
```

---

## Task 4: Landing page oluştur

**Files:**
- Create: `web/app/page.tsx`

- [ ] **Step 1: `web/app/page.tsx` dosyasını oluştur**

```tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-slate-900">MedVision AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Ücretsiz Kayıt Ol →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Sol — Metin */}
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-semibold mb-5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Google MedGemma destekli
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-slate-900 mb-4">
            Tıbbi görüntüde<br />
            <span className="text-blue-600">akıllı analiz,</span><br />
            saniyeler içinde.
          </h1>
          <p className="text-base text-slate-500 leading-relaxed mb-7 max-w-md">
            X-ray, MRI, CT ve daha fazlasını yükleyin. MedGemma yapay zekası anında analiz eder,
            Türkçe ve İngilizce rapor üretir. Doktorlar için tasarlandı.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(37,99,235,.35)] hover:bg-blue-700 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 4v16m8-8H4" />
              </svg>
              Ücretsiz Başla
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition"
            >
              Giriş Yap
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            ● Kredi kartı gerekmez &nbsp;·&nbsp; Tanı aracı değildir, karar destek sistemidir
          </p>
        </div>

        {/* Sağ — Scanner Animasyonu */}
        <div className="bg-slate-900 rounded-2xl p-5 shadow-2xl border border-white/5">
          {/* macOS window chrome */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-red-500 block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 block" />
            <span className="w-3 h-3 rounded-full bg-green-500 block" />
            <span className="ml-2 text-xs text-slate-500 font-mono">medvision-ai — analiz.exe</span>
          </div>

          {/* X-ray frame */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 h-40 mb-3">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg,transparent,transparent 12px,rgba(30,64,175,.08) 12px,rgba(30,64,175,.08) 13px),' +
                  'repeating-linear-gradient(90deg,transparent,transparent 12px,rgba(30,64,175,.08) 12px,rgba(30,64,175,.08) 13px)',
              }}
            />
            {/* Akciğer silüeti */}
            <svg
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"
              width="120" height="110" viewBox="0 0 120 110" fill="none"
            >
              <path
                d="M55 10 C55 10 42 12 36 22 C28 35 26 52 27 68 C28 80 33 95 42 98 C52 101 58 88 58 88 L60 88 C60 88 66 101 76 98 C85 95 90 80 91 68 C92 52 90 35 82 22 C76 12 63 10 63 10 Z"
                stroke="#3b82f6" strokeWidth="1.5" fill="rgba(59,130,246,.08)"
              />
              <path d="M45 28 C40 35 38 50 39 62" stroke="#3b82f6" strokeWidth="1" opacity=".5" />
              <path d="M73 28 C78 35 80 50 79 62" stroke="#3b82f6" strokeWidth="1" opacity=".5" />
            </svg>
            {/* Tarama çizgisi */}
            <div
              className="animate-scan-beam left-0 right-0 h-0.5"
              style={{
                background: 'linear-gradient(90deg,transparent,#38bdf8 30%,#60a5fa 50%,#38bdf8 70%,transparent)',
                boxShadow: '0 0 12px #38bdf8, 0 0 24px rgba(56,189,248,.4)',
              }}
            />
            {/* Anomali noktaları */}
            <div className="animate-anomaly-pulse absolute w-3 h-3 rounded-full bg-red-500" style={{ top: '40%', left: '38%' }} />
            <div className="animate-anomaly-pulse absolute w-2 h-2 rounded-full bg-red-500" style={{ top: '55%', left: '58%', animationDelay: '.4s' }} />
            {/* Köşe çerçeveleri */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-blue-500 opacity-60" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-blue-500 opacity-60" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-blue-500 opacity-60" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-blue-500 opacity-60" />
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
              <p className="text-[10px] text-slate-500 font-mono mb-1">// NORMAL DOKU</p>
              <div className="h-1 bg-slate-950 rounded overflow-hidden mb-1">
                <div
                  className="animate-bar-grow h-full rounded bg-gradient-to-r from-blue-700 to-sky-400"
                  style={{ '--bar-w': '87%' } as React.CSSProperties}
                />
              </div>
              <p className="text-sm font-bold text-green-400">%87 normal</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-2 border border-slate-700">
              <p className="text-[10px] text-slate-500 font-mono mb-1">// ANOMALİ</p>
              <div className="h-1 bg-slate-950 rounded overflow-hidden mb-1">
                <div
                  className="animate-bar-grow h-full rounded bg-gradient-to-r from-red-600 to-orange-400"
                  style={{ '--bar-w': '12%', animationDelay: '.3s' } as React.CSSProperties}
                />
              </div>
              <p className="text-sm font-bold text-red-400">%12 dikkat</p>
            </div>
          </div>

          {/* Bulgular */}
          <div className="flex flex-col gap-1.5 mb-3">
            {([
              { label: 'pnömoni_riski',     level: 'ORTA',  color: 'text-amber-400 bg-amber-900/30', delay: '.6s'  },
              { label: 'kardiyomegali',     level: 'DÜŞÜK', color: 'text-green-400 bg-green-900/30', delay: '.9s'  },
              { label: 'plevral_efüzyon',   level: 'YOK',   color: 'text-green-400 bg-green-900/30', delay: '1.2s' },
            ] as const).map(({ label, level, color, delay }) => (
              <div
                key={label}
                className="animate-slide-in flex items-center justify-between px-2 py-1.5 bg-slate-800 rounded-md"
                style={{ animationDelay: delay }}
              >
                <span className="text-[11px] text-slate-400 font-mono">{label}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${color}`}>{level}</span>
              </div>
            ))}
          </div>

          {/* Rapor hazır */}
          <div
            className="animate-fade-up flex items-center gap-2 bg-blue-950/40 border border-sky-900/40 rounded-lg px-3 py-2"
            style={{ animationDelay: '1.6s' }}
          >
            <span
              className="animate-dot-pulse w-2 h-2 rounded-full bg-green-400 flex-shrink-0"
              style={{ boxShadow: '0 0 6px #4ade80' }}
            />
            <span className="text-xs text-sky-300">Rapor hazırlandı</span>
            <div className="ml-auto flex gap-1.5">
              <span className="text-[10px] bg-white/10 text-slate-300 rounded px-1.5 py-0.5">🇹🇷 TR</span>
              <span className="text-[10px] bg-white/10 text-slate-300 rounded px-1.5 py-0.5">🇬🇧 EN</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
            Nasıl Çalışır?
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-10">3 adımda tıbbi görüntü analizi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { n: '1', icon: '🩻', title: 'Görüntü Yükle',   desc: 'X-ray, MRI veya CT görüntülerinizi sürükleyip bırakın. JPEG, PNG, DICOM desteklenir.' },
              { n: '2', icon: '🤖', title: 'AI Analiz Eder',  desc: 'MedGemma modeli görüntüyü saniyeler içinde tarar, anomalileri ve bulguları tespit eder.' },
              { n: '3', icon: '📋', title: 'Raporu Al',       desc: 'Türkçe ve İngilizce detaylı rapor anında hazırlanır. Geçmiş analizlerinize her zaman erişin.' },
            ] as const).map(({ n, icon, title, desc }, i) => (
              <div key={n} className="relative bg-slate-50 rounded-2xl p-6">
                <div className="w-9 h-9 bg-blue-50 text-blue-700 font-extrabold text-base rounded-lg flex items-center justify-center mb-3">{n}</div>
                <div className="text-3xl mb-2">{icon}</div>
                <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                {i < 2 && (
                  <span className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 text-xl z-10">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÖZELLİKLER ── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
            Özellikler
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-10">Klinik iş akışına uygun tasarım</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              { icon: '🌐', title: 'Türkçe + İngilizce Rapor', desc: 'Her analiz otomatik olarak iki dilde raporlanır. Uluslararası ekiplerle paylaşım kolaylaşır.' },
              { icon: '⚡', title: 'Hızlı Analiz',             desc: 'MedGemma altyapısı sayesinde görüntü analizi genellikle 30 saniyenin altında tamamlanır.' },
              { icon: '💬', title: 'Sohbet ile Sorgula',       desc: 'Rapor hakkında sorularınızı yapay zekaya sorun. "Bu bulgu ne anlama geliyor?" gibi.' },
              { icon: '🗂️', title: 'Analiz Geçmişi',          desc: 'Tüm analizleriniz güvenli şekilde saklanır. Geçmiş raporlarınıza istediğiniz zaman ulaşın.' },
              { icon: '🔒', title: 'Güvenli Altyapı',          desc: 'Supabase + RLS ile verileriniz yalnızca size görünür. HTTPS şifrelemesi zorunludur.' },
              { icon: '📎', title: 'Çoklu Görüntü',            desc: 'Tek seferde birden fazla görüntü yükleyin ve karşılaştırmalı analiz yapın.' },
            ] as const).map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl mb-3">{icon}</div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEDGEMMA NEDİR ── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
                Teknoloji
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">MedGemma nedir?</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">
                MedGemma, Google DeepMind tarafından geliştirilen, tıbbi görüntü analizi için özel
                olarak eğitilmiş bir yapay zeka modelidir. Milyonlarca tıbbi veri üzerinde eğitilen
                model; radyoloji, patoloji ve klinik metin yorumlama konularında uzmandır.
              </p>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                MedVision AI, MedGemma&apos;nın güçlü altyapısını Türk sağlık profesyonellerine
                erişilebilir, kullanımı kolay bir arayüz üzerinden sunar.
              </p>
              <div className="flex flex-wrap gap-2">
                {(['Google DeepMind', 'Radyoloji', 'Patoloji', 'Klinik NLP'] as const).map((tag) => (
                  <span key={tag} className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <p className="text-xs text-slate-500 font-mono mb-4">// model_stats.json</p>
              <div className="flex flex-col gap-3">
                {([
                  { label: 'radyoloji',  value: '92%', w: '92%' },
                  { label: 'patoloji',   value: '88%', w: '88%' },
                  { label: 'klinik_nlp', value: '85%', w: '85%' },
                  { label: 'çok_dil',    value: '95%', w: '95%' },
                ] as const).map(({ label, value, w }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 font-mono w-24 shrink-0">{label}</span>
                    <div className="flex-1 bg-slate-800 rounded h-1 overflow-hidden">
                      <div className="h-full rounded bg-gradient-to-r from-blue-700 to-sky-400" style={{ width: w }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-700 to-blue-600 py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Hemen başlayın, ücretsiz.</h2>
          <p className="text-blue-200 text-base mb-8">Kredi kartı gerekmez. İlk analizinizi dakikalar içinde yapın.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register" className="px-6 py-3 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition">
              Ücretsiz Kayıt Ol
            </Link>
            <Link href="/login" className="px-6 py-3 border-2 border-white/40 text-white font-semibold text-sm rounded-xl hover:bg-white/10 transition">
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 px-4 py-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-200">⬡ MedVision AI</span>
        <span className="text-xs text-slate-500 max-w-md">
          Bu sistem klinik karar desteği amaçlıdır. Tanı koymaz, koyamaz. Tüm bulgular bir sağlık profesyoneli tarafından değerlendirilmelidir.
        </span>
        <span className="text-xs text-slate-700">v1.0 · 2026</span>
      </footer>

    </div>
  )
}
```

- [ ] **Step 2: Dev server'da `http://localhost:3000/` (giriş yapılmamış) açarak sayfanın render ettiğini doğrula**

Giriş yapılmamış hâlde `/` açıldığında landing sayfası görünmeli, `/login`'e yönlenmemeli.

- [ ] **Step 3: Giriş yapılmış hâlde `/` açarak `/dashboard`'a yönlediğini doğrula**

- [ ] **Step 4: Commit**

```bash
git add web/app/page.tsx
git commit -m "feat: herkese açık landing page"
```

---

## Task 5: Navbar'a "Anasayfa" sekmesi ekle

**Files:**
- Modify: `web/components/navbar.tsx`

- [ ] **Step 1: navbar.tsx'i güncelle**

`web/components/navbar.tsx` dosyasını tamamen şununla değiştir:

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 max-w-5xl h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-slate-800 hover:text-blue-600 transition">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          MedVision AI
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-800 transition"
          >
            Anasayfa
          </Link>
          <Link
            href="/medgemma"
            className="text-sm text-slate-500 hover:text-slate-800 transition"
          >
            MedGemma Nedir?
          </Link>
          <Link
            href="/history"
            className="text-sm text-slate-500 hover:text-slate-800 transition"
          >
            Geçmiş
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-500 hover:text-red-600 transition"
          >
            Çıkış
          </button>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Dashboard'da navbar'ın "Anasayfa" linkini gösterdiğini doğrula**

Giriş yapılmış hâlde navbar'da soldan sağa: Logo, Anasayfa, MedGemma Nedir?, Geçmiş, Çıkış görünmeli.

- [ ] **Step 3: Commit**

```bash
git add web/components/navbar.tsx
git commit -m "feat: navbar'a Anasayfa sekmesi eklendi"
```

---

## Smoke Test Kontrol Listesi

Tüm tasklar bittikten sonra şu senaryoları elle doğrula:

- [ ] Giriş yapılmamış → `/` → Landing sayfası görünüyor (yönlendirme yok)
- [ ] Giriş yapılmamış → `/dashboard` → `/login`'e yönleniyor
- [ ] Giriş yap → `/dashboard`'a yönleniyor (landing değil)
- [ ] Dashboard'da navbar: Anasayfa, MedGemma Nedir?, Geçmiş, Çıkış görünüyor
- [ ] Navbar "Anasayfa" → `/dashboard`'a gidiyor
- [ ] Landing'deki "Ücretsiz Başla" → `/register`
- [ ] Landing'deki "Giriş Yap" → `/login`
- [ ] Scanner animasyonu çalışıyor (tarama çizgisi, bulgular, "Rapor hazır")
- [ ] TypeScript hatası yok: `cd web && npx tsc --noEmit`
