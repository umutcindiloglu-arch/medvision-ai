'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'

export default function LandingClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { T, lang, setLang } = useTranslation()
  const L = T.landing
  const P = T.pricing
  const N = T.nav

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
            <a href="#pricing" className="hidden sm:block text-sm text-slate-500 hover:text-slate-800 transition">
              {N.pricing}
            </a>
            {/* Dil Seçici */}
            <button
              onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-600"
              title={lang === 'tr' ? 'Switch to English' : "Türkçe'ye geç"}
            >
              {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
            </button>
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                {L.cta_dashboard}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  {N.login}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  {N.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-4 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-semibold mb-5">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            {L.badge}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-slate-900 mb-4">
            {L.hero_title_1}<br />
            <span className="text-blue-600">{L.hero_title_2},</span><br />
            {L.hero_title_3}
          </h1>
          <p className="text-base text-slate-500 leading-relaxed mb-7 max-w-md">
            {L.hero_desc}
          </p>
          <div className="flex flex-wrap gap-3 mb-5">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition"
              >
                {L.go_to_panel}
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-5 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition"
                >
                  {L.cta_start}
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-3 text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition"
                >
                  {L.cta_login}
                </Link>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400">{L.trust}</p>
        </div>

        {/* Sağ — Scanner Animasyonu */}
        <div className="relative rounded-2xl overflow-hidden" style={{ background: '#0f172a', padding: '20px' }}>
          {/* macOS başlık */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-slate-400 font-mono">{L.scanner_title}</span>
          </div>

          {/* X-Ray alanı */}
          <div className="relative rounded-xl overflow-hidden" style={{ background: '#1e293b', aspectRatio: '4/3' }}>
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'linear-gradient(#475569 1px,transparent 1px),linear-gradient(90deg,#475569 1px,transparent 1px)', backgroundSize: '20px 20px' }} />
            {/* Akciğer SVG silüeti */}
            <svg viewBox="0 0 200 160" className="absolute inset-0 w-full h-full opacity-30" fill="none">
              <path d="M70 140 C50 130 30 110 25 80 C20 50 35 30 55 35 C65 37 70 45 70 60 L70 140Z" fill="#94a3b8"/>
              <path d="M130 140 C150 130 170 110 175 80 C180 50 165 30 145 35 C135 37 130 45 130 60 L130 140Z" fill="#94a3b8"/>
              <path d="M70 60 C80 50 90 45 100 45 C110 45 120 50 130 60" stroke="#94a3b8" strokeWidth="3"/>
            </svg>
            {/* Köşe çerçeve imleri */}
            {[['top-2 left-2','border-t-2 border-l-2'],['top-2 right-2','border-t-2 border-r-2'],
              ['bottom-2 left-2','border-b-2 border-l-2'],['bottom-2 right-2','border-b-2 border-r-2']].map(([pos,bdr],i) => (
              <div key={i} className={`absolute ${pos} w-5 h-5 ${bdr} border-blue-400 opacity-60`} />
            ))}
            {/* Tarama çizgisi */}
            <div className="animate-scan-beam w-full h-0.5 left-0"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.8), transparent)' }} />
            {/* Anomali noktaları */}
            <div className="animate-anomaly-pulse absolute w-4 h-4 rounded-full border-2 border-red-500 bg-red-500/20"
              style={{ top: '35%', left: '38%', '--anim-delay': '0s' } as React.CSSProperties} />
            <div className="animate-anomaly-pulse absolute w-3 h-3 rounded-full border-2 border-red-400 bg-red-400/20"
              style={{ top: '55%', left: '55%', '--anim-delay': '0.4s' } as React.CSSProperties} />
          </div>

          {/* İstatistik blokları */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: L.scanner_normal, val: 73, color: '#22c55e', delay: '0.2s' },
              { label: L.scanner_anomaly, val: 27, color: '#ef4444', delay: '0.5s' },
            ].map(({ label, val, color, delay }) => (
              <div key={label} className="rounded-lg p-3" style={{ background: '#1e293b' }}>
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: '#334155' }}>
                  <div
                    className="animate-bar-grow absolute inset-y-0 left-0 rounded-full"
                    style={{ '--bar-w': `${val}%`, '--anim-delay': delay, background: color } as React.CSSProperties}
                  />
                </div>
                <p className="text-xs font-bold mt-1" style={{ color }}>{val}%</p>
              </div>
            ))}
          </div>

          {/* Bulgular listesi */}
          <div className="mt-3 space-y-1">
            {[
              { key: 'pnömoni_riski', val: lang === 'tr' ? 'ORTA' : 'MODERATE', color: '#f59e0b', delay: '0.6s' },
              { key: 'kardiyomegali', val: lang === 'tr' ? 'DÜŞÜK' : 'LOW', color: '#22c55e', delay: '0.9s' },
              { key: 'plevral_efüzyon', val: lang === 'tr' ? 'YOK' : 'NONE', color: '#94a3b8', delay: '1.2s' },
            ].map(({ key, val, color, delay }) => (
              <div key={key} className="animate-slide-in flex justify-between items-center text-xs font-mono px-2 py-1 rounded"
                style={{ background: '#1e293b', '--anim-delay': delay } as React.CSSProperties}>
                <span className="text-slate-400">{key}</span>
                <span style={{ color }}>→ {val}</span>
              </div>
            ))}
          </div>

          {/* Rapor hazır */}
          <div className="flex items-center justify-between mt-3 px-2">
            <div className="flex items-center gap-1.5">
              <span className="animate-dot-pulse w-2 h-2 rounded-full bg-green-500 inline-block" />
              <span className="text-xs text-green-400 font-medium">{L.scanner_ready}</span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded font-semibold">🇹🇷 TR</span>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-semibold">🇬🇧 EN</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
            {L.how_badge}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-10">{L.how_title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {([
              { n: '1', icon: '🩻', title: L.step1_title, desc: L.step1_desc },
              { n: '2', icon: '🤖', title: L.step2_title, desc: L.step2_desc },
              { n: '3', icon: '📋', title: L.step3_title, desc: L.step3_desc },
            ]).map(({ n, icon, title, desc }, i) => (
              <div key={n} className="relative bg-white rounded-2xl p-6 border border-slate-200">
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
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
            {L.features_badge}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-10">{L.features_title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              { icon: '🌐', title: L.feat1_title, desc: L.feat1_desc },
              { icon: '⚡', title: L.feat2_title, desc: L.feat2_desc },
              { icon: '💬', title: L.feat3_title, desc: L.feat3_desc },
              { icon: '🗂️', title: L.feat4_title, desc: L.feat4_desc },
              { icon: '🔒', title: L.feat5_title, desc: L.feat5_desc },
              { icon: '📎', title: L.feat6_title, desc: L.feat6_desc },
            ]).map(({ icon, title, desc }) => (
              <div key={title} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl mb-3">{icon}</div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEDGEMMA NEDİR ── */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
                {L.medgemma_badge}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-4">{L.medgemma_title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">{L.medgemma_desc1}</p>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">{L.medgemma_desc2}</p>
              <div className="flex flex-wrap gap-2">
                {[L.medgemma_badge1, L.medgemma_badge2, L.medgemma_badge3, L.medgemma_badge4].map((b) => (
                  <span key={b} className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1">{b}</span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-6 font-mono text-xs" style={{ background: '#0f172a', color: '#94a3b8' }}>
              <p className="text-slate-500 mb-3">{'// medgemma-4b-it · benchmark'}</p>
              {[
                { key: 'radyoloji', val: 92 },
                { key: 'patoloji', val: 88 },
                { key: 'klinik_nlp', val: 85 },
                { key: lang === 'tr' ? 'çok_dil' : 'multilingual', val: 95 },
              ].map(({ key, val }) => (
                <div key={key} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span style={{ color: '#7dd3fc' }}>{key}</span>
                    <span style={{ color: '#86efac' }}>{val}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: '#1e293b' }}>
                    <div className="animate-bar-grow h-full rounded-full" style={{ '--bar-w': `${val}%`, background: '#3b82f6' } as React.CSSProperties} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FİYATLANDIRMA ── */}
      <section id="pricing" className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
            {P.badge}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{P.title}</h2>
          <p className="text-sm text-slate-500 mb-10">{P.subtitle}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Free */}
            <PricingCard
              name={P.plan_free_name}
              desc={P.plan_free_desc}
              price={P.free_label}
              analyses={P.plan_free_analyses}
              features={[...P.plan_free_features]}
              cta={P.cta_start}
              ctaHref="/register"
              popular={false}
              pricingSuffix=""
            />
            {/* Starter */}
            <PricingCard
              name={P.plan_starter_name}
              desc={P.plan_starter_desc}
              price="$20"
              analyses={`30 ${P.analyses}`}
              features={[...P.plan_starter_features]}
              cta={P.cta_choose}
              ctaHref="/register"
              popular={false}
              pricingSuffix={P.monthly}
            />
            {/* Pro */}
            <PricingCard
              name={P.plan_pro_name}
              desc={P.plan_pro_desc}
              price="$50"
              analyses={`100 ${P.analyses}`}
              features={[...P.plan_pro_features]}
              cta={P.cta_choose}
              ctaHref="/register"
              popular={true}
              popularLabel={P.popular}
              pricingSuffix={P.monthly}
            />
            {/* Enterprise */}
            <PricingCard
              name={P.plan_enterprise_name}
              desc={P.plan_enterprise_desc}
              price="$120"
              analyses={`300 ${P.analyses}`}
              features={[...P.plan_enterprise_features]}
              cta={P.cta_choose}
              ctaHref="/register"
              popular={false}
              pricingSuffix={P.monthly}
            />
            {/* Custom */}
            <PricingCard
              name={P.plan_custom_name}
              desc={P.plan_custom_desc}
              price={P.contact}
              analyses="300+"
              features={[...P.plan_custom_features]}
              cta={P.cta_contact}
              ctaHref="mailto:info@medvision.ai"
              popular={false}
              pricingSuffix=""
              isCustom
            />
          </div>
          <p className="text-xs text-slate-400 mt-6 text-center">{P.note}</p>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">{L.cta_banner_title}</h2>
          <p className="text-blue-200 mb-8 text-sm">{L.cta_banner_desc}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard"
                className="px-6 py-3 text-sm font-semibold text-blue-700 bg-white rounded-xl hover:bg-blue-50 shadow transition">
                {L.go_to_panel}
              </Link>
            ) : (
              <>
                <Link href="/register"
                  className="px-6 py-3 text-sm font-semibold text-blue-700 bg-white rounded-xl hover:bg-blue-50 shadow transition">
                  {L.cta_banner_btn1}
                </Link>
                <Link href="/login"
                  className="px-6 py-3 text-sm font-semibold text-white border border-white/40 rounded-xl hover:bg-white/10 transition">
                  {L.cta_banner_btn2}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-4" style={{ background: '#0f172a' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white">MedVision AI</span>
          </div>
          <p className="text-xs text-slate-500 text-center max-w-md">{L.footer_disclaimer}</p>
          <p className="text-xs text-slate-600">{L.footer_version}</p>
        </div>
      </footer>
    </div>
  )
}

function PricingCard({
  name, desc, price, analyses, features, cta, ctaHref, popular, popularLabel, pricingSuffix, isCustom,
}: {
  name: string; desc: string; price: string; analyses: string; features: string[];
  cta: string; ctaHref: string; popular: boolean; popularLabel?: string; pricingSuffix: string; isCustom?: boolean
}) {
  return (
    <div className={`relative rounded-2xl p-5 flex flex-col border ${popular ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-slate-200'}`}>
      {popular && popularLabel && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
          {popularLabel}
        </div>
      )}
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 text-sm">{name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
      <div className="mb-1">
        <span className="text-2xl font-extrabold text-slate-900">{price}</span>
        {pricingSuffix && <span className="text-xs text-slate-400 ml-1">{pricingSuffix}</span>}
      </div>
      <p className="text-xs text-blue-600 font-semibold mb-4">{analyses}</p>
      <ul className="space-y-1.5 flex-1 mb-5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
            <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`block text-center text-xs font-semibold py-2.5 rounded-xl transition ${
          isCustom
            ? 'bg-slate-900 text-white hover:bg-slate-700'
            : popular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}
