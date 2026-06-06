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

- Email/şifre kimlik doğrulama (`proxy.ts` ile route koruması)
- Çoklu görüntü yükleme (5'e kadar) ve MedGemma analizi
- TR/EN rapor görüntüleme + PDF indirme (pdfmake, tam Türkçe desteği)
- Rapor bağlamında MedGemma ile sohbet (opsiyonel ek görüntü/PDF)
- Analiz geçmişi: arama, yeniden adlandırma, silme
- Rate limiting (10 analiz/saat), cold-start ön ısıtma (`/api/warmup`)

## Dağıtım (Vercel)

- GitHub'a push → otomatik deploy
- **Root Directory = `web`** (monorepo — bu ayar yapılmazsa 404 alınır)
- Build: `pnpm build` · Install: `pnpm install` · Output: `.next`

## Proje Yapısı

```
web/
├── app/
│   ├── (auth)/            # login, register
│   ├── (dashboard)/       # analyze, analysis/[id], history, ana sayfa
│   └── api/               # analyze, chat, analysis/[id], warmup proxy route'ları
├── components/            # chat-panel, multi-image-dropzone, navbar ...
├── lib/supabase/          # client, server, storage yardımcıları
├── types/                 # Analysis, Message tipleri
└── proxy.ts               # Auth proxy (Next.js 16'da middleware yerine)
```

Detaylı plan ve oturum geçmişi için `../docs/PLAN.md` ve `../docs/SESSION-OZET.md`.
