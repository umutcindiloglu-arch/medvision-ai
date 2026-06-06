# MedVision AI — Uygulama Planı

**Proje:** MedVision AI  
**Tarih:** 2026-06-06  
**Tahmini Süre:** 4-5 hafta (yarı zamanlı çalışma ile)

---

## Genel Bakış

```
Faz 1: Temel Altyapı       (Supabase + Next.js + Auth)
Faz 2: AI Backend           (Modal + FastAPI + MedGemma)
Faz 3: Çekirdek Özellikler  (Yükleme + Analiz + Rapor)
Faz 4: Chat + Geçmiş        (Sohbet + Analiz Geçmişi)
Faz 5: Canlıya Alma         (Deploy + Test + Polish)
```

---

## Faz 1 — Temel Altyapı

**Süre:** ~1 hafta  
**Amaç:** Proje iskeleti, kimlik doğrulama, veritabanı

### Adımlar

#### 1.1 Proje Oluşturma
- [ ] `pnpm create next-app@latest medvision-ai --typescript --tailwind --app` komutu ile Next.js projesi oluştur
- [ ] Proje yapısını düzenle (`app/`, `components/`, `lib/`, `types/`)
- [ ] `.env.local` dosyasını oluştur (Supabase anahtarları için)

#### 1.2 Supabase Kurulumu
- [ ] [supabase.com](https://supabase.com) üzerinde yeni proje oluştur
- [ ] PostgreSQL tablolarını oluştur (`analyses`, `messages`)
- [ ] Row Level Security (RLS) politikalarını ayarla
- [ ] Supabase Storage'da `medical-images` bucket'ı oluştur (private)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini al

#### 1.3 Kimlik Doğrulama
- [ ] `@supabase/ssr` paketini kur
- [ ] Giriş sayfası (`/login`) oluştur
- [ ] Kayıt sayfası (`/register`) oluştur
- [ ] Middleware ile korumalı route'ları ayarla (login olmadan ana sayfa görünmesin)
- [ ] Çıkış yapma fonksiyonu ekle

#### 1.4 Temel Layout
- [ ] Navbar bileşeni (logo, navigasyon, kullanıcı menüsü)
- [ ] Sayfa geçiş animasyonları
- [ ] Loading skeleton bileşenleri
- [ ] Toast/bildirim sistemi

**Faz 1 Tamamlanma Kriteri:** Kullanıcı kayıt olup giriş yapabilmeli, korumalı sayfalara yönlendirme çalışmalı.

---

## Faz 2 — AI Backend (Modal + MedGemma)

**Süre:** ~1 hafta  
**Amaç:** MedGemma modelini Modal'da çalıştırılabilir hale getir

### Adımlar

#### 2.1 Modal Kurulumu
- [ ] `modal setup` ile hesabı bağla (terminal)
- [ ] `pip install modal` (zaten kurulu)
- [ ] Modal secret oluştur: Hugging Face token ekle

#### 2.2 MedGemma Servisi
- [ ] `backend/` klasörü oluştur
- [ ] `backend/app.py` — Modal uygulaması yaz:
  - MedGemma 4b-it modelini yükle (`google/medgemma-4b-it`)
  - A10G GPU ile image tanımla
  - Model cache'i volume'a kaydet (her seferinde indirmesin)
- [ ] `POST /analyze` endpoint'i:
  - Base64 görüntü al
  - İngilizce structured prompt gönder
  - TR + EN rapor üret
- [ ] `POST /chat` endpoint'i:
  - Görüntü + mesaj geçmişi al
  - Bağlamlı yanıt üret

#### 2.3 Güvenlik
- [ ] Modal endpoint'ini Supabase JWT ile koru
- [ ] Rate limiting ekle (kullanıcı başına günlük limit)
- [ ] CORS ayarları

#### 2.4 Test
- [ ] `modal run backend/app.py` ile lokal test
- [ ] Test görüntüsü ile `/analyze` endpoint'ini dene
- [ ] Yanıt formatını doğrula

**Faz 2 Tamamlanma Kriteri:** `curl` ile görüntü gönderildiğinde TR+EN rapor dönmeli.

---

## Faz 3 — Çekirdek Özellikler

**Süre:** ~1 hafta  
**Amaç:** Görüntü yükleme, analiz ve rapor sayfası

### Adımlar

#### 3.1 Görüntü Yükleme
- [ ] Sürükle-bırak yükleme bileşeni (`react-dropzone`)
- [ ] Görüntü önizleme (yüklemeden önce)
- [ ] DICOM desteği (`cornerstone.js` entegrasyonu)
- [ ] Supabase Storage'a yükleme fonksiyonu
- [ ] Dosya boyutu ve format validasyonu

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
- [ ] PDF indirme (`react-pdf` veya `jsPDF`)
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
- [ ] Yazıyor animasyonu (streaming için `EventSource`)

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
- [ ] `modal deploy backend/app.py` ile production'a deploy et
- [ ] Modal dashboard'dan endpoint URL'ini al
- [ ] Production secret'larını ayarla

#### 5.2 Vercel Deploy
- [ ] GitHub'a push et
- [ ] Vercel'de yeni proje oluştur (GitHub ile bağla)
- [ ] Environment variable'ları Vercel'e ekle:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `MODAL_API_URL`
- [ ] Domain ayarla (isteğe bağlı)

#### 5.3 Test
- [ ] End-to-end test: Kayıt → Giriş → Yükleme → Analiz → Chat → Geçmiş
- [ ] Farklı görüntü türleriyle test (X-ray, MRI, mikrobiyoloji)
- [ ] Cold start süresini ölç ve kullanıcıya bildir
- [ ] Mobil uyumluluk kontrolü

#### 5.4 Son Dokunuşlar
- [ ] Hata mesajları Türkçe
- [ ] Boş durum ekranları (henüz analiz yok)
- [ ] Favicon ve meta tag'ler
- [ ] Tıbbi sorumluluk reddi sayfası

**Faz 5 Tamamlanma Kriteri:** Uygulama canlıda, tüm özellikler çalışıyor.

---

## Ortam Değişkenleri (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Modal
MODAL_API_URL=https://xxxx.modal.run

# Hugging Face (Modal secret olarak eklenir, burada gerekmez)
```

---

## Maliyet Tahmini (Aylık)

| Servis | Ücretsiz Limit | Aşım Maliyeti |
|---|---|---|
| Vercel | Sınırsız (hobi) | $20/ay (pro) |
| Supabase | 500MB DB, 1GB Storage | $25/ay (pro) |
| Modal | $30 kredi (ilk ay) | ~$0.50-2/saat (GPU) |
| **Toplam** | **İlk ay ~ücretsiz** | **~$30-50/ay** |

---

## Başlangıç Komutu

```bash
cd ~/Documents/medgemma-app
pnpm create next-app@latest . --typescript --tailwind --app --no-git
```
