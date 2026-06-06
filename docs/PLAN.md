# MedVision AI — Uygulama Planı

**Proje:** MedVision AI  
**Tarih:** 2026-06-06  
**Tahmini Süre:** 4-5 hafta (yarı zamanlı çalışma ile)

---

## Genel Bakış

```
Faz 1: Temel Altyapı       (Supabase + Next.js + Auth)   ✅ Tamamlandı
Faz 2: AI Backend           (Modal + FastAPI + MedGemma)  ✅ Tamamlandı
Faz 3: Çekirdek Özellikler  (Yükleme + Analiz + Rapor)   ✅ Tamamlandı
Faz 4: Chat + Geçmiş        (Sohbet + Analiz Geçmişi)    ✅ Tamamlandı
Faz 5: Canlıya Alma         (Deploy + Test + Polish)      ✅ Tamamlandı
Faz 6: Ücretlendirme        (Ücretsiz hak + Abonelik)    📋 Planlandı
```

> **🎉 Proje canlıda:** [yapayzekahekim.com](https://yapayzekahekim.com) (Vercel + Hostinger özel alan adı)

---

## Faz 1 — Temel Altyapı ✅

**Süre:** 1 gün (2026-06-06)  
**Amaç:** Proje iskeleti, kimlik doğrulama, veritabanı

### Adımlar

#### 1.1 Proje Oluşturma
- [x] `pnpm create next-app@latest web --typescript --tailwind --app` ile Next.js 16 projesi oluştur (`web/` alt klasöründe — monorepo yapısı)
- [x] Proje yapısını düzenle (`app/`, `components/`, `lib/`, `types/`)
- [x] `.env.local` dosyasını oluştur (Supabase anahtarları için)

> **Not:** Proje `medgemma-app/web/` altında kuruldu. `.superpowers/` klasörü yüzünden root'a kurulum yapılamadı.

#### 1.2 Supabase Kurulumu
- [x] [supabase.com](https://supabase.com) üzerinde yeni proje oluştur
- [x] PostgreSQL tablolarını oluştur (`analyses`, `messages`) — `web/supabase/schema.sql`
- [x] Row Level Security (RLS) politikalarını ayarla
- [x] Supabase Storage'da `medical-images` bucket'ı oluştur (private)
- [x] `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini al

#### 1.3 Kimlik Doğrulama
- [x] `@supabase/ssr` paketini kur
- [x] Giriş sayfası (`/login`) oluştur
- [x] Kayıt sayfası (`/register`) oluştur
- [x] `proxy.ts` ile korumalı route'ları ayarla (Next.js 16'da `middleware.ts` → `proxy.ts`)
- [x] Çıkış yapma fonksiyonu ekle (Navbar'da)

#### 1.4 Temel Layout
- [x] Navbar bileşeni (logo, Geçmiş linki, Çıkış butonu)
- [x] Loading skeleton bileşenleri (`components/ui/skeleton.tsx`)
- [x] Toast/bildirim sistemi (Sonner)

**Faz 1 Tamamlanma Kriteri:** ✅ Kullanıcı kayıt olup giriş yapabiliyor, korumalı sayfalara yönlendirme çalışıyor.

---

## Faz 2 — AI Backend (Modal + MedGemma) ✅

**Süre:** 1 gün (2026-06-06)  
**Amaç:** MedGemma modelini Modal'da çalıştırılabilir hale getir

### Adımlar

#### 2.1 Modal Kurulumu
- [x] Modal hesabı zaten bağlı
- [x] Modal secret oluştur: `huggingface-token` (HF_TOKEN)
- [x] Modal secret oluştur: `supabase-config` (SUPABASE_URL + SUPABASE_ANON_KEY)

#### 2.2 MedGemma Servisi
- [x] `backend/` klasörü oluştur
- [x] `backend/app.py` — Modal uygulaması yazıldı:
  - MedGemma 4b-it modelini yükle (`google/medgemma-4b-it`)
  - A10G GPU ile `@app.cls()` tanımlandı
  - Model cache'i `medgemma-cache` volume'una kaydet
- [x] `POST /analyze` endpoint'i:
  - Base64 görüntü alır
  - İngilizce structured prompt gönderir (Findings / Impression / Recommendation)
  - Türkçe çeviri için ikinci inference çağrısı
  - TR + EN rapor döner
- [x] `POST /chat` endpoint'i:
  - Görüntü + mesaj geçmişi alır
  - Bağlamlı yanıt üretir

#### 2.3 Güvenlik
- [x] Supabase JWT ile her endpoint korumalı (`/auth/v1/user` doğrulama)
- [x] CORS ayarları (allow_origins=*)
- [ ] Rate limiting — Faz 5'te eklenecek

#### 2.4 Test
- [x] `/health` endpoint çalışıyor: `{"status":"ok","model":"medgemma-4b-it"}`
- [x] `/analyze` endpoint JWT olmadan 401 döndürüyor ✅
- [x] Modal deploy başarılı

> **Deploy URL:** `https://umutcindiloglu--medvision-ai-medgemmabackend-api.modal.run`  
> **Modal Dashboard:** https://modal.com/apps/umutcindiloglu/main/deployed/medvision-ai

**Faz 2 Tamamlanma Kriteri:** ✅ Backend canlıda, JWT koruması aktif.

> **Not:** `container_idle_timeout` → `scaledown_window`, `allow_concurrent_inputs` → `@modal.concurrent()` olarak güncellendi (Modal API değişiklikleri).

---

## Faz 3 — Çekirdek Özellikler ✅

**Süre:** 1 gün (2026-06-06)  
**Amaç:** Görüntü yükleme, analiz ve rapor sayfası

### Adımlar

#### 3.1 Görüntü Yükleme
- [x] Sürükle-bırak yükleme bileşeni (`react-dropzone`) — `components/image-dropzone.tsx`
- [x] Görüntü önizleme (yüklemeden önce)
- [ ] DICOM desteği — Faz 5'e bırakıldı (karmaşık, cornerstone.js gerekiyor)
- [x] Supabase Storage'a yükleme fonksiyonu — `lib/supabase/storage.ts`
- [x] Dosya boyutu ve format validasyonu (max 20MB, JPG/PNG/WebP)

#### 3.2 Analiz Sayfası (`/analyze`)
- [x] Yükleme formu (görüntü + klinisyen notu)
- [x] "Analiz Et" butonuna basılınca:
  1. Görüntüyü Supabase Storage'a yükle
  2. Modal `/analyze` endpoint'ini `/api/analyze` proxy üzerinden çağır
  3. Yükleme animasyonu göster ("MedGemma analiz ediyor...")
  4. Sonucu veritabanına kaydet
  5. Sonuç sayfasına yönlendir
- [x] `app/api/analyze/route.ts` — Modal URL sunucu tarafında kalır (güvenli)

#### 3.3 Rapor Sayfası (`/analysis/[id]`)
- [x] Sol: Görüntü görüntüleyici (Supabase Storage imzalı URL)
- [x] Sağ: Rapor (TR/EN dil toggle)
- [x] Bulgular / Yorum / Öneri bölümleri (metin parsing)
- [x] PDF indirme (`jsPDF`)
- [x] Tıbbi sorumluluk reddi uyarısı

#### 3.4 Ana Sayfa Güncelleme
- [x] "Yeni Analiz Başlat" CTA butonu
- [x] Son 5 analiz listesi

**Faz 3 Tamamlanma Kriteri:** ✅ Görüntü yüklenip rapor görüntülenebilmeli.

> **Not:** Modal URL sunucu tarafında kalması için `app/api/analyze/route.ts` proxy eklendi.

---

## Faz 4 — Chat + Geçmiş ✅

**Süre:** 1 gün (2026-06-06)  
**Amaç:** MedGemma ile sohbet ve analiz geçmişi

### Adımlar

#### 4.1 Chat Arayüzü
- [x] Rapor sayfasının altına chat paneli ekle (`components/chat-panel.tsx`)
- [x] Mesaj gönderme formu
- [x] Modal `/chat` endpoint'ini çağır (`app/api/chat/route.ts`)
- [x] Mesajları veritabanına kaydet (`messages` tablosu)
- [x] Konuşma geçmişini ekranda göster (kullanıcı + MedGemma)
- [x] Yazıyor animasyonu (üç nokta)
- [x] **Sohbete ek dosya:** görüntü/PDF ekleme (ataç butonu, opsiyonel)

#### 4.2 Geçmiş Sayfası (`/history`)
- [x] Kullanıcının tüm analizleri listele
- [x] Tarih, görüntü adı göster
- [x] Arama/filtreleme (dosya adı, not, rapor içeriği)
- [x] Analize tıklayınca rapor sayfasına git
- [x] Analiz silme (Storage + DB, onay diyaloğu)
- [x] **Kayıt yeniden adlandırma:** satır içi inline rename (kalem ikonu)

#### 4.3 Çoklu Görüntü (Faz 4 sırasında eklendi)
- [x] Tek analizde 5 görüntüye kadar yükleme (`components/multi-image-dropzone.tsx`)
- [x] `image_url` alanı geriye dönük uyumlu: tek yol veya JSON array string
- [x] Rapor sayfasında küçük resim galerisi + navigasyon

**Faz 4 Tamamlanma Kriteri:** ✅ MedGemma ile sohbet edilebiliyor, geçmiş analizler görüntülenip yönetilebiliyor.

---

## Faz 5 — Canlıya Alma ✅

**Süre:** 1 gün (2026-06-06)  
**Amaç:** Deploy, test, son düzeltmeler

### Adımlar

#### 5.1 Modal Deploy
- [x] `modal deploy backend/app.py` ile production'a deploy edildi
- [x] Production secret'ları kontrol edildi (`huggingface-token`, `supabase-config`)

#### 5.2 Vercel Deploy
- [x] GitHub'a push edildi
- [x] Vercel'de proje oluşturuldu (GitHub ile bağlı, otomatik deploy)
- [x] **Monorepo ayarı:** Root Directory = `web` (kritik — yoksa 404)
- [x] Environment variable'lar Vercel'e eklendi:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `MODAL_API_URL`

#### 5.3 Özel Alan Adı
- [x] `yapayzekahekim.com` (Hostinger) Vercel'e bağlandı
- [x] DNS kayıtları: A (`@` → `216.198.79.1`), CNAME (`www` → `*.vercel-dns-017.com`)

#### 5.4 Test
- [x] End-to-end test: Kayıt → Giriş → Yükleme → Analiz → Chat → Geçmiş
- [x] Canlı ortamda doğrulandı (kullanıcı onayladı)

#### 5.5 Son Dokunuşlar
- [x] Rate limiting backend'e eklendi (10 analiz/saat, kullanıcı JWT ile sayım)
- [x] Hata mesajları Türkçe
- [x] Boş durum ekranları (henüz analiz yok)
- [x] Favicon (`app/icon.svg`) ve meta tag'ler (Open Graph, viewport, SEO)
- [x] 404 sayfaları (global + analiz)
- [x] Tıbbi sorumluluk reddi uyarıları
- [x] **PDF:** jsPDF → pdfmake (gömülü Roboto, tam Unicode/Türkçe desteği)

#### 5.6 Deploy Sonrası Düzeltmeler (canlı testlerden sonra)
- [x] Sohbette görüntü opsiyonel hale getirildi (multi-image JSON parse + boş string fallback)
- [x] Chat input/arama yazı renkleri düzeltildi (explicit `text-slate-800`)
- [x] Chat paneli kart stiline alındı (rapor bölümleriyle tutarlı)
- [x] **Cold-start düzeltmesi:** route'lara `maxDuration=60` + `/api/warmup` ön ısıtma (sayfa açılınca container uyandırılıyor)

**Faz 5 Tamamlanma Kriteri:** ✅ Uygulama canlıda ([yapayzekahekim.com](https://yapayzekahekim.com)), tüm özellikler çalışıyor.

---

## Faz 6 — Ücretlendirme / Abonelik 📋

**Durum:** Planlandı (detaylar daha sonra netleştirilecek)  
**Amaç:** Ücretsiz deneme hakkı + aylık abonelik ile gelir modeli

### Model

| Plan | Fiyat | Hak |
|---|---|---|
| **Ücretsiz** | $0 | Üyelik sırasında **1 ücretsiz analiz hakkı** |
| **Aylık Abonelik** | **$10 / ay** | (Detaylar sonra) — sınırsız veya yüksek kotalı analiz |

### Akış

1. Kullanıcı ücretsiz üye olur → **1 analiz hakkı** tanımlanır
2. İlk analizi yapar (hak kullanılır)
3. İkinci analizi denediğinde → analiz çalışır/sonuç hazırlanırken
   **"Ücretsiz hakkınız bitti — Abone Olun"** sayfası gösterilir
4. Kullanıcı $10/ay aboneliğe geçerse analiz hakları açılır

### Yapılacaklar (taslak — netleştirilecek)

- [ ] Kullanıcı başına kalan hak/kota takibi (Supabase'de `profiles` veya `usage` tablosu)
- [ ] Analiz akışında hak kontrolü (hak yoksa abonelik sayfasına yönlendir)
- [ ] **Abonelik sayfası** (`/subscribe` veya `/pricing`) — plan karşılaştırması + ödeme CTA
- [ ] Ödeme sağlayıcı entegrasyonu (örn. **Stripe** — abonelik, webhook ile durum senkronizasyonu)
- [ ] Abonelik durumu (aktif/iptal/süresi dolmuş) ile analiz erişimini eşitle
- [ ] Faturalandırma/abonelik yönetimi (iptal, yenileme)
- [ ] Webhook güvenliği ve abonelik durumunun backend rate-limit ile entegrasyonu

> **Not:** Ödeme sağlayıcı seçimi, kota detayları (sınırsız mı, X analiz/ay mı), deneme
> süresi ve KVKK/fatura gereksinimleri daha sonra konuşulacak.

**Faz 6 Tamamlanma Kriteri:** Kullanıcı ücretsiz hakkını kullanabilir, hak bitince abonelik sayfası gösterilir, $10/ay abonelik ile erişim açılır.

---

## Ortam Değişkenleri (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tzmzjudtbxifbiqwfkqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# Modal
MODAL_API_URL=https://umutcindiloglu--medvision-ai-medgemmabackend-api.modal.run
```

---

## Maliyet Tahmini (Aylık)

| Servis | Ücretsiz Limit | Aşım Maliyeti |
|---|---|---|
| Vercel | Sınırsız (hobi) | $20/ay (pro) |
| Supabase | 500MB DB, 1GB Storage | $25/ay (pro) |
| Modal | $30 kredi (ilk ay) | ~$0.76/saat (A10G GPU) |
| **Toplam** | **İlk ay ~ücretsiz** | **~$30-50/ay** |

---

## GitHub

**Repo:** https://github.com/umutcindiloglu-arch/medvision-ai
