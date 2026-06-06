# MedVision AI — Uygulama Planı

**Proje:** MedVision AI  
**Tarih:** 2026-06-06  
**Tahmini Süre:** 4-5 hafta (yarı zamanlı çalışma ile)

---

## Genel Bakış

```
Faz 1: Temel Altyapı       (Supabase + Next.js + Auth)   ✅ Tamamlandı
Faz 2: AI Backend           (Modal + FastAPI + MedGemma)  ✅ Tamamlandı
Faz 3: Çekirdek Özellikler  (Yükleme + Analiz + Rapor)   🔄 Sıradaki
Faz 4: Chat + Geçmiş        (Sohbet + Analiz Geçmişi)
Faz 5: Canlıya Alma         (Deploy + Test + Polish)
```

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

## Faz 3 — Çekirdek Özellikler 🔄

**Süre:** ~1 hafta  
**Amaç:** Görüntü yükleme, analiz ve rapor sayfası

### Adımlar

#### 3.1 Görüntü Yükleme
- [ ] Sürükle-bırak yükleme bileşeni (`react-dropzone`)
- [ ] Görüntü önizleme (yüklemeden önce)
- [ ] DICOM desteği (`cornerstone.js` entegrasyonu)
- [ ] Supabase Storage'a yükleme fonksiyonu
- [ ] Dosya boyutu ve format validasyonu (max 20MB)

#### 3.2 Analiz Sayfası (`/analyze`)
- [ ] Yükleme formu (görüntü + klinisyen notu)
- [ ] "Analiz Et" butonuna basılınca:
  1. Görüntüyü Supabase Storage'a yükle
  2. Modal `/analyze` endpoint'ini çağır
  3. Yükleme animasyonu göster ("MedGemma analiz ediyor...")
  4. Sonucu veritabanına kaydet
  5. Sonuç sayfasına yönlendir

#### 3.3 Rapor Sayfası (`/analysis/[id]`)
- [ ] Sol: Görüntü görüntüleyici
- [ ] Sağ: Rapor (TR/EN dil toggle)
- [ ] Bulgular / Yorum / Öneri bölümleri
- [ ] PDF indirme (`jsPDF`)
- [ ] Tıbbi sorumluluk reddi uyarısı

**Faz 3 Tamamlanma Kriteri:** Görüntü yüklenip rapor görüntülenebilmeli.

---

## Faz 4 — Chat + Geçmiş

**Süre:** ~1 hafta  
**Amaç:** MedGemma ile sohbet ve analiz geçmişi

### Adımlar

#### 4.1 Chat Arayüzü
- [ ] Rapor sayfasının altına chat paneli ekle
- [ ] Mesaj gönderme formu
- [ ] Modal `/chat` endpoint'ini çağır
- [ ] Mesajları veritabanına kaydet
- [ ] Konuşma geçmişini ekranda göster (kullanıcı + MedGemma)
- [ ] Yazıyor animasyonu

#### 4.2 Geçmiş Sayfası (`/history`)
- [ ] Kullanıcının tüm analizleri listele
- [ ] Tarih, görüntü adı, soru sayısı göster
- [ ] Arama/filtreleme
- [ ] Analize tıklayınca rapor sayfasına git
- [ ] Analiz silme

**Faz 4 Tamamlanma Kriteri:** MedGemma ile sohbet edilebilmeli, geçmiş analizler görüntülenebilmeli.

---

## Faz 5 — Canlıya Alma

**Süre:** ~3-5 gün  
**Amaç:** Deploy, test, son düzeltmeler

### Adımlar

#### 5.1 Modal Deploy
- [ ] `modal deploy backend/app.py` ile production'a deploy et *(Faz 2'de yapıldı)*
- [ ] Production secret'larını kontrol et

#### 5.2 Vercel Deploy
- [ ] GitHub'a push et *(zaten yapılıyor)*
- [ ] Vercel'de yeni proje oluştur (GitHub ile bağla)
- [ ] Environment variable'ları Vercel'e ekle:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `MODAL_API_URL`

#### 5.3 Test
- [ ] End-to-end test: Kayıt → Giriş → Yükleme → Analiz → Chat → Geçmiş
- [ ] Farklı görüntü türleriyle test (X-ray, MRI, mikrobiyoloji)
- [ ] Mobil uyumluluk kontrolü

#### 5.4 Son Dokunuşlar
- [ ] Rate limiting backend'e ekle
- [ ] Hata mesajları Türkçe
- [ ] Boş durum ekranları (henüz analiz yok)
- [ ] Favicon ve meta tag'ler
- [ ] Tıbbi sorumluluk reddi sayfası

**Faz 5 Tamamlanma Kriteri:** Uygulama canlıda, tüm özellikler çalışıyor.

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
