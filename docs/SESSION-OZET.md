# Oturum Özeti — MedVision AI Projesi

**Son Güncelleme:** 2026-06-07  
**Durum:** 🎉 **Faz 1–6 tamamlandı, Faz 7 kısmen uygulandı** — uygulama canlıda  
**Canlı URL:** [yapayzekahekim.com](https://yapayzekahekim.com)

---

## 1. Sistem Kurulumları

### Python 3.12 — Kurulu Kütüphaneler

| Kategori | Paketler |
|---|---|
| Core | NumPy 2.4.6, Pandas 2.3.3, SciPy 1.17.1 |
| Görüntü İşleme | OpenCV 4.13.0, Pillow 12.2.0 |
| Derin Öğrenme | PyTorch 2.12.0 (M1 MPS), TensorFlow 2.21.0 |
| NLP | Transformers 5.10.2, HF Datasets 5.0.0 |
| API / Servis | FastAPI 0.136.3, Modal 1.4.3 |

### Web Geliştirme Araçları
- Node.js v26.0.0, pnpm 11.5.2
- TypeScript 6.0.3

### Önemli Notlar
- Apple M1 — PyTorch MPS aktif
- Hugging Face girişi yapıldı, MedGemma 4b-it erişimi mevcut
- Modal hesabı kuruldu ve bağlandı

---

## 2. Proje Yapısı (Güncel)

```
medgemma-app/
├── docs/
│   ├── PLAN.md                    ← Güncel plan (Faz 1–7)
│   └── SESSION-OZET.md            ← Bu dosya
├── backend/
│   └── app.py                     ← Modal + FastAPI + MedGemma 4b-it
└── web/
    ├── middleware.ts               ← Auth proxy (Next.js 16)
    ├── supabase/
    │   ├── schema.sql              ← SQL şeması + RLS politikaları
    │   └── migrations/
    │       └── 002_chat_sessions.sql ← Chat oturumları için migration
    ├── .env.local                  ← Ortam değişkenleri (git'e girmez)
    ├── lib/
    │   ├── supabase/               ← client.ts, server.ts, storage.ts
    │   └── i18n/                   ← translations.ts, context.tsx
    ├── types/index.ts              ← Analysis, Message tipleri
    ├── components/
    │   ├── landing-client.tsx      ← Landing sayfası
    │   ├── dashboard-client.tsx    ← Dashboard ana sayfa
    │   ├── navbar.tsx              ← Dashboard navbar
    │   ├── chat-panel.tsx          ← Rapor sayfası sohbet paneli
    │   └── multi-image-dropzone.tsx
    └── app/
        ├── page.tsx                ← Landing (server component)
        ├── (auth)/login/           ← Giriş sayfası
        ├── (auth)/register/        ← Kayıt sayfası
        └── (dashboard)/
            ├── dashboard/          ← Ana panel
            ├── analyze/            ← Yeni analiz
            ├── analysis/[id]/      ← Rapor sayfası
            ├── chat/               ← Serbest asistan sohbeti
            └── history/            ← Geçmiş (analizler + sohbetler)
```

---

## 3. Faz 1–5 Özeti

Temel altyapı, AI backend, analiz/rapor sistemi, sohbet paneli ve geçmiş sayfası tamamlandı. Deploy: Vercel + Modal + özel alan adı `yapayzekahekim.com`. Detaylar için geçmiş oturum notlarına bakınız.

---

## 4. Faz 6 — UI/UX + TR/EN i18n (2026-06-07)

### Yapılanlar

#### Landing Sayfası
- Animasyonlu landing sayfası (`components/landing-client.tsx`):
  - Scanner/analiz CSS animasyonu (CSS-only, `@keyframes`)
  - Nasıl çalışır, özellikler, MedGemma tanıtım, fiyatlandırma, CTA banner, footer
  - Giriş yapmış kullanıcılar için "Panele Git" butonu (yönlendirme yerine)
- Navbar "Anasayfa" sekmesi `/` adresine bağlandı
- Auth sayfalarında logo tıklanabilir + "← Anasayfa" geri linki eklendi

#### TR/EN Dil Desteği
- `lib/i18n/translations.ts` — tüm UI metinleri (tr + en)
- `lib/i18n/context.tsx` — `LanguageProvider` (localStorage kalıcılığı)
- Tüm sayfalarda `useTranslation()` ile dil anahtarları
- Navbar ve auth layout'ta dil toggle butonu

#### Fiyatlandırma
- Landing sayfasında 5 plan: Ücretsiz / $20 / $50 / $120 / Kurumsal
- `#pricing` anchor, navbar'dan tıklanabilir

#### Düzeltmeler
- Landing hero başlığındaki çift virgül giderildi (`hero_title_3` düzeltildi)
- Auth formlardaki input rengi: `text-slate-900 bg-white`

### Kritik Notlar
- Server component + i18n: server component veriyi prop olarak client component'a geçirir
- TypeScript: `t[lang] as Translations` ile tip uyumsuzluğu çözüldü

---

## 5. Faz 7 — Ücretlendirme (Kısmi, 2026-06-07)

### Tamamlananlar

#### 3 Ücretsiz Analiz Limiti
- `/api/analyze/route.ts`'de server-side kota kontrolü:
  ```ts
  const { count } = await supabase.from('analyses')
    .select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  if ((count ?? 0) >= 3) return 403 + bilgilendirme mesajı
  ```
- Hata mesajı: "Ücretsiz 3 analiz hakkınız doldu. Abonelik sistemi yakında eklenecek."

#### Sohbet Geçmişi
- `chat_sessions` + `chat_messages` tabloları (`supabase/migrations/002_chat_sessions.sql`)
  > **⚠️ Supabase SQL Editor'de migrasyonu çalıştırın!**
- `/api/assistant/route.ts` — her sohbette oturum oluşturur/günceller, mesajları kaydeder
- `/chat` sayfası — `session_id` state ile oturumu takip eder
- `/history` sayfası — "Analizler" ve "Asistan Sohbetleri" sekmeleri
- `/api/chat-session/[id]` — sohbet oturumu silme endpoint'i

### Yapılacaklar
- Stripe entegrasyonu
- Plan bazlı kota (şu an sabit 3)
- Kullanıcı panelinde kota göstergesi
- Bkz. `PLAN.md` Faz 7 yapılacaklar tablosu

---

## 6. Veritabanı Yapısı (Güncel)

| Tablo | Açıklama |
|---|---|
| `analyses` | Tıbbi görüntü analizleri |
| `messages` | Rapor sohbet mesajları (analysis_id FK) |
| `chat_sessions` | Bağımsız asistan sohbet oturumları ⚠️ migration gerekli |
| `chat_messages` | Oturum mesajları ⚠️ migration gerekli |

---

## 7. API Route'ları (Güncel)

| Route | Yöntem | Açıklama |
|---|---|---|
| `/api/analyze` | POST | Görüntü/PDF analizi (kota kontrolü ile) |
| `/api/chat` | POST | Rapor bağlamlı sohbet |
| `/api/assistant` | POST | Serbest asistan sohbeti (session_id ile) |
| `/api/extract-pdf` | POST | PDF metin çıkartma |
| `/api/analysis/[id]` | GET/PATCH/DELETE | Analiz yönetimi |
| `/api/chat-session/[id]` | DELETE | Sohbet oturumu silme |
| `/api/warmup` | GET | Modal container ön ısıtma |

---

## 8. Hatırlatmalar

- `.env.local` git'e girmez — `MODAL_API_URL` de buraya eklendi
- Modal cold start: container 5 dk boştan sonra kapanır; `/api/warmup` ile sayfa açılınca önceden uyandırılıyor
- Supabase ücretsiz tier: 500MB DB, 1GB Storage (başlangıç için yeterli)
- **⚠️ Chat geçmişi için:** Supabase SQL Editor'de `supabase/migrations/002_chat_sessions.sql` çalıştırılmalı
- **⚠️ Vercel'de Root Directory = `web`** (monorepo)
