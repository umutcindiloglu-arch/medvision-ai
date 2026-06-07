# MedVision AI — Web (Frontend)

MedGemma 4b-it tabanlı tıbbi görüntü analiz platformunun Next.js 16 web uygulaması.

**Canlı:** [yapayzekahekim.com](https://yapayzekahekim.com)

## Teknolojiler

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4**
- **Supabase** — Auth, PostgreSQL, Storage (`medical-images` private bucket)
- **Modal** — MedGemma 4b-it için serverless GPU backend (`../backend/app.py`)

## Geliştirme

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) adresinde açılır.

## Ortam Değişkenleri (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<proje>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
MODAL_API_URL=https://<...>.modal.run   # server-side only, NEXT_PUBLIC_ öneki YOK
```

## Özellikler

- Email/şifre kimlik doğrulama (`middleware.ts` ile route koruması)
- **Landing sayfası** — animasyonlu tanıtım, TR/EN dil desteği, fiyatlandırma bölümü
- Çoklu görüntü yükleme (5'e kadar), DICOM (.dcm) desteği, MedGemma analizi
- TR/EN rapor görüntüleme + PDF indirme (pdfmake, tam Türkçe desteği)
- **Serbest asistan sohbeti** (`/chat`) — görüntü, DICOM, PDF eki ile
- Rapor bağlamında MedGemma ile sohbet (opsiyonel ek görüntü/PDF)
- **Analiz geçmişi + sohbet geçmişi** (`/history`) — arama, yeniden adlandırma, silme
- **Kullanıcı başına 3 ücretsiz analiz** — kota aşıldığında bilgilendirme mesajı
- Rate limiting (10 analiz/saat), cold-start ön ısıtma (`/api/warmup`)
- PDF metin çıkartma (`/api/extract-pdf` — server-side, `pdf-parse`)

## Veritabanı Şeması

```
analyses       — Analizler (image_url, report_en, report_tr, ...)
messages       — Rapor sohbet mesajları (analysis_id FK)
chat_sessions  — Bağımsız asistan sohbet oturumları (user_id FK)
chat_messages  — Oturum mesajları (session_id FK)
```

Şema için: `supabase/schema.sql`  
Chat oturumları migrasyonu için: `supabase/migrations/002_chat_sessions.sql`

> **Önemli:** `chat_sessions` ve `chat_messages` tablolarını oluşturmak için
> Supabase SQL Editor'de `supabase/migrations/002_chat_sessions.sql` dosyasını çalıştırın.

## Dağıtım (Vercel)

- GitHub'a push → otomatik deploy
- **Root Directory = `web`** (monorepo — bu ayar yapılmazsa 404 alınır)
- Build: `pnpm build` · Install: `pnpm install` · Output: `.next`

## Proje Yapısı

```
web/
├── app/
│   ├── (auth)/            # login, register — anasayfaya dönüş linki ile
│   ├── (dashboard)/       # analyze, analysis/[id], chat, history, dashboard
│   └── api/               # analyze, chat, assistant, analysis/[id], chat-session/[id], extract-pdf, warmup
├── components/            # landing-client, dashboard-client, chat-panel, multi-image-dropzone, navbar ...
├── lib/
│   ├── supabase/          # client, server, storage yardımcıları
│   └── i18n/              # translations.ts, context.tsx — TR/EN dil desteği
├── supabase/
│   ├── schema.sql         # Tam veritabanı şeması
│   └── migrations/        # 002_chat_sessions.sql
└── middleware.ts           # Auth proxy (Next.js 16)
```

Detaylı plan ve oturum geçmişi için `../docs/PLAN.md` ve `../docs/SESSION-OZET.md`.
