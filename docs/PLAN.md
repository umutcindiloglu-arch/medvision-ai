# MedVision AI — Uygulama Planı

**Proje:** MedVision AI  
**Güncelleme:** 2026-06-07  
**Tahmini Süre:** 4-5 hafta (yarı zamanlı çalışma ile)

---

## Genel Bakış

```
Faz 1: Temel Altyapı       (Supabase + Next.js + Auth)   ✅ Tamamlandı
Faz 2: AI Backend           (Modal + FastAPI + MedGemma)  ✅ Tamamlandı
Faz 3: Çekirdek Özellikler  (Yükleme + Analiz + Rapor)   ✅ Tamamlandı
Faz 4: Chat + Geçmiş        (Sohbet + Analiz Geçmişi)    ✅ Tamamlandı
Faz 5: Canlıya Alma         (Deploy + Test + Polish)      ✅ Tamamlandı
Faz 6: UI/UX + i18n         (Landing + TR/EN + Fiyatlar) ✅ Tamamlandı
Faz 7: Ücretlendirme        (Ücretsiz hak + Abonelik)    🔄 Kısmen uygulandı
Faz 8: Admin Paneli         (Kullanıcı istatistikleri)    🔄 Kodlandı, env eksik
Faz 9: Multi-Model Consensus (MedGemma+Claude+LLaVA+BioViL) ⏳ Planlandı
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
- [x] `middleware.ts` ile korumalı route'ları ayarla
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
- [x] Rate limiting — Backend'de 10 analiz/saat

#### 2.4 Test
- [x] `/health` endpoint çalışıyor: `{"status":"ok","model":"medgemma-4b-it"}`
- [x] `/analyze` endpoint JWT olmadan 401 döndürüyor ✅
- [x] Modal deploy başarılı

> **Deploy URL:** `https://umutcindiloglu--medvision-ai-medgemmabackend-api.modal.run`  
> **Modal Dashboard:** https://modal.com/apps/umutcindiloglu/main/deployed/medvision-ai

**Faz 2 Tamamlanma Kriteri:** ✅ Backend canlıda, JWT koruması aktif.

---

## Faz 3 — Çekirdek Özellikler ✅

**Süre:** 1 gün (2026-06-06)  
**Amaç:** Görüntü yükleme, analiz ve rapor sayfası

### Adımlar

#### 3.1 Görüntü Yükleme
- [x] Sürükle-bırak yükleme bileşeni — `components/multi-image-dropzone.tsx`
- [x] Görüntü önizleme (yüklemeden önce)
- [x] DICOM desteği (`dicom-parser`, client-side PNG dönüşümü)
- [x] Supabase Storage'a yükleme fonksiyonu — `lib/supabase/storage.ts`
- [x] Dosya boyutu ve format validasyonu (max 200MB, JPG/PNG/WebP/DICOM)

#### 3.2 Analiz Sayfası (`/analyze`)
- [x] Yükleme formu (görüntü + PDF + klinisyen notu)
- [x] Modal `/analyze` endpoint'ini `/api/analyze` proxy üzerinden çağır
- [x] Yükleme animasyonu göster
- [x] Sonucu veritabanına kaydet
- [x] Sonuç sayfasına yönlendir

#### 3.3 Rapor Sayfası (`/analysis/[id]`)
- [x] Sol: Görüntü görüntüleyici (Supabase Storage imzalı URL)
- [x] Sağ: Rapor (TR/EN dil toggle)
- [x] Bulgular / Yorum / Öneri bölümleri (metin parsing)
- [x] PDF indirme (pdfmake + tam Türkçe/Unicode)
- [x] Tıbbi sorumluluk reddi uyarısı

**Faz 3 Tamamlanma Kriteri:** ✅ Görüntü yüklenip rapor görüntülenebilmeli.

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

#### 4.3 Çoklu Görüntü
- [x] Tek analizde 5 görüntüye kadar yükleme
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
- [x] Production secret'ları kontrol edildi

#### 5.2 Vercel Deploy
- [x] GitHub'a push edildi
- [x] Vercel'de proje oluşturuldu (GitHub ile bağlı, otomatik deploy)
- [x] **Monorepo ayarı:** Root Directory = `web`
- [x] Environment variable'lar Vercel'e eklendi

#### 5.3 Özel Alan Adı
- [x] `yapayzekahekim.com` (Hostinger) Vercel'e bağlandı
- [x] DNS kayıtları: A (`@` → `216.198.79.1`), CNAME (`www` → `*.vercel-dns-017.com`)

#### 5.4 Son Dokunuşlar
- [x] Rate limiting backend'e eklendi
- [x] Hata mesajları Türkçe
- [x] Boş durum ekranları
- [x] Favicon (`app/icon.svg`), meta tag'ler (Open Graph, viewport, SEO)
- [x] 404 sayfaları (global + analiz)
- [x] Tıbbi sorumluluk reddi uyarıları
- [x] **PDF:** jsPDF → pdfmake (gömülü Roboto, tam Unicode/Türkçe desteği)
- [x] **Cold-start:** `maxDuration=60` + `/api/warmup` ön ısıtma

**Faz 5 Tamamlanma Kriteri:** ✅ Uygulama canlıda, tüm özellikler çalışıyor.

---

## Faz 6 — UI/UX + TR/EN i18n + Fiyatlandırma ✅

**Süre:** 2026-06-07  
**Amaç:** Landing sayfası, iki dil desteği, fiyatlandırma, navigasyon düzeltmeleri

### Tamamlananlar

- [x] **Landing sayfası** (`/`) — animasyonlu tanıtım, scanner efekti, nasıl çalışır, özellikler, MedGemma, fiyatlandırma, CTA
- [x] **TR/EN dil desteği** — `lib/i18n/` (translations.ts + context.tsx), tüm sayfalarda `useTranslation()`
- [x] **Fiyatlandırma bölümü** — 5 plan: Ücretsiz / $20 / $50 / $120 / Kurumsal (yalnızca frontend)
- [x] **Navigasyon düzeltmesi** — "Anasayfa" sekmesi `/` yönlendirir; giriş yapanlar için "Panele Git" butonu
- [x] **Auth sayfaları** — Anasayfaya dönüş linki + logo tıklanabilir
- [x] **Input text renkleri** — `text-slate-900 bg-white` auth formlarda
- [x] **Landing virgül düzeltmesi** — hero başlığındaki çift virgül giderildi
- [x] **DICOM desteği** — `dicom-parser` ile client-side dönüşüm
- [x] **PDF metin çıkartma** — server-side `pdf-parse` ile `/api/extract-pdf`
- [x] **Serbest asistan sohbeti** — `/chat` sayfası (görüntü/PDF/DICOM eki destekli)
- [x] **Sohbet geçmişi** — `chat_sessions` + `chat_messages` tabloları, `/history` sayfasında sekme

**Faz 6 Tamamlanma Kriteri:** ✅ İki dilli landing sayfası + fiyatlandırma + sohbet geçmişi canlıda.

---

## Faz 7 — Ücretlendirme / Abonelik 🔄

**Durum:** Kısmen uygulandı — frontend hazır, ödeme backend'i yapılacak  
**Amaç:** Ücretsiz deneme hakkı + aylık abonelik ile gelir modeli

### Tamamlananlar

- [x] **Ücretsiz tier: 3 analiz** — `/api/analyze` server-side kota kontrolü, hak bitince kullanıcıya bilgilendirme
- [x] **Fiyatlandırma sayfası** — Landing sayfasında 5 plan (yalnızca frontend, ödeme yok)
- [x] **Analiz sayacı** — Supabase'den `count` sorgusu ile anlık kontrol

### Yapılacaklar

| Öncelik | Görev |
|---|---|
| 🔴 Yüksek | Kullanıcı başına `profiles` tablosu (plan, kullanım sayacı) |
| 🔴 Yüksek | **Stripe entegrasyonu** — abonelik oluşturma, webhook ile durum senkronizasyonu |
| 🔴 Yüksek | Analiz akışında plan bazlı kota kontrolü (Free=3, Starter=30, Pro=100, Enterprise=300) |
| 🟡 Orta | `/subscribe` sayfası — plan seçimi + Stripe Checkout |
| 🟡 Orta | Kullanıcı panelinde kota durumu göstergesi (kaç hak kaldı) |
| 🟡 Orta | Abonelik yönetimi (iptal, yenileme, fatura) |
| 🟢 Düşük | KVKK / fatura gereksinimleri |
| 🟢 Düşük | Webhook güvenliği (Stripe imzası doğrulama) |

### Abonelik Planları

| Plan | Fiyat | Analiz/Ay |
|---|---|---|
| **Ücretsiz** | $0 | 3 (toplam, sınır kalıcı) |
| **Starter** | $20/ay | 30 |
| **Professional** | $50/ay | 100 |
| **Enterprise** | $120/ay | 300 |
| **Kurumsal** | İletişim | 300+ |

> **Mevcut durum:** İlk 3 analiz ücretsiz, 4. analizde "Hakkınız doldu" mesajı. Abonelik sayfası görsel olarak hazır ama ödeme akışı yok.

**Faz 7 Tamamlanma Kriteri:** Kullanıcı Stripe üzerinden plan seçip ödeme yapabilir, kota otomatik güncellenir.

---

## Faz 8 — Admin Paneli 🔄

**Durum:** Altyapı + API + UI kodlandı, env değişkenleri ve navbar linki eksik  
**Amaç:** Kayıtlı kullanıcıları, kullanımları ve geliri tek ekranda görmek

### Tamamlananlar (kod yazıldı, deploy edilmedi)

- [x] `web/lib/supabase/admin.ts` — service role client (RLS bypass)
- [x] `web/app/api/admin/stats/route.ts` — kullanıcı istatistikleri API'si (sadece admin email)
- [x] `web/app/(dashboard)/admin/page.tsx` — server component (auth check + data fetch)
- [x] `web/app/(dashboard)/admin/admin-client.tsx` — interaktif tablo (arama, sıralama, quota bar)

### Yapılacaklar (aktif etmek için)

| Adım | Açıklama |
|---|---|
| 1 | Supabase Dashboard → Settings → API → **service_role key** al |
| 2 | `.env.local`'e `SUPABASE_SERVICE_ROLE_KEY=<key>` ekle |
| 3 | `.env.local`'e `ADMIN_EMAIL=ucindiloglu@gmail.com` ekle |
| 4 | Vercel → Environment Variables'a da aynı iki değeri ekle |
| 5 | `components/navbar.tsx` → admin linki ekle (opsiyonel, `/admin` URL'i de çalışır) |

### Admin panel özellikleri

- Toplam kullanıcı / analiz / sohbet özet kartları
- E-posta ile kullanıcı arama
- Sıralama: en yeni / en çok analiz / en çok sohbet
- Her kullanıcıda analiz kotası progress bar (X/3)
- Plan bilgisi (şimdilik hepsi "Ücretsiz")
- Gelir sütunu → Stripe entegrasyonu sonrası eklenecek

> **Güvenlik:** `/admin` sayfası ve `/api/admin/stats` endpoint'i server-side `ADMIN_EMAIL` kontrolü ile korunuyor. Yanlış kullanıcı `/dashboard`'a yönlendiriliyor.

---

## Faz 9 — Multi-Model Consensus (MedGemma + Claude + LLaVA-Med + BioViL-T) ⏳

**Durum:** Planlandı  
**Amaç:** Aynı görüntüyü birden fazla modele paralel göndermek, her modelin differential diagnosis çıktısını birleştirerek daha güvenilir bir ortak karar üretmek

---

### Mimari Genel Bakış

```
Görüntü (Next.js API)
    │
    ├──► MedGemma 4b-it   (Modal A10G GPU)     → JSON: [{diagnosis, probability, evidence}]
    ├──► LLaVA-Med 7B     (Modal A10G GPU)     → JSON: [{diagnosis, probability, evidence}]
    ├──► BioViL-T          (Modal A10G GPU)     → JSON: [{diagnosis, probability, evidence}]
    └──► Claude Sonnet 4.6 (Anthropic API)      → JSON: [{diagnosis, probability, evidence}]
                │
                ▼
        Consensus Engine (Node.js)
        - Tanıları eşleştir (fuzzy match)
        - Ağırlıklı ortalama hesapla
        - Anlaşma skoru hesapla (kaç model hemfikir?)
                │
                ▼
        Frontend: model bazlı bar + consensus bar + anlaşma rozeti
```

---

### 9.1 — Model Bilgileri

#### MedGemma 4b-it (mevcut)
- **HuggingFace:** `google/medgemma-4b-it`
- **Güç:** Genel tıbbi görüntü (radyoloji, patoloji, dermatoloji)
- **Çıktı:** Serbest metin → yapılandırılmış JSON'a çevrilecek
- **Ağırlık:** `1.0` (referans model)

#### LLaVA-Med 1.5 Mistral 7B
- **HuggingFace:** `microsoft/llava-med-v1.5-mistral-7b`
- **Güç:** Genel tıbbi VQA + görüntü açıklama, PubMed tıbbi literatürüyle eğitildi
- **Çıktı:** Serbest metin → JSON'a çevrilecek
- **Ağırlık:** `0.9`
- **GPU ihtiyacı:** A10G (24GB VRAM) — MedGemma ile aynı tier

#### BioViL-T
- **HuggingFace:** `microsoft/BioViL-T`
- **Güç:** Radyoloji raporlarından temporal değişim tespiti, chest X-ray odaklı
- **Çıktı:** Classification logits → olasılıklara dönüştürülecek
- **Ağırlık:** `0.8` (sadece akciğer grafisinde aktif, diğer modalitelerde devre dışı)
- **Kısıt:** Radyoloji (chest X-ray) dışında kullanım önerilmez

#### Claude Sonnet 4.6 (Anthropic API)
- **Erişim:** `@anthropic-ai/sdk` via Anthropic API
- **Güç:** Geniş tıp bilgisi, güçlü akıl yürütme, hızlı (soğuk start yok)
- **Çıktı:** Yapılandırılmış JSON (prompt ile zorunlu kılınacak)
- **Ağırlık:** `0.95`
- **Maliyet:** ~$0.003/görüntü (input + output token)

---

### 9.2 — Backend Değişiklikleri (`backend/app.py`)

#### Yeni Modal Container'lar

```python
# Her model kendi container'ında — bağımsız ölçeklenir
@app.cls(image=image, gpu="A10G", ...)
class LLaVAMedBackend:
    @modal.enter()
    def load_model(self):
        # microsoft/llava-med-v1.5-mistral-7b

@app.cls(image=image, gpu="A10G", ...)
class BioViLBackend:
    @modal.enter()
    def load_model(self):
        # microsoft/BioViL-T (chest X-ray sınıflandırma)
```

#### Structured Output — Her Model JSON Döndürecek

```json
{
  "differentials": [
    {"diagnosis": "Pneumonia", "probability": 65, "evidence": "..."},
    {"diagnosis": "Atelectasis", "probability": 20, "evidence": "..."}
  ],
  "modality": "chest_xray",
  "confidence": 0.82
}
```

#### `/analyze-ensemble` Endpoint (yeni)

```python
@web.post("/analyze-ensemble")
async def analyze_ensemble(req):
    # Tüm modelleri PARALEL çalıştır
    results = await asyncio.gather(
        medgemma.analyze(req),
        llava_med.analyze(req),
        biovil.analyze(req),   # sadece chest X-ray
    )
    # Claude API çağrısı ayrıca (Anthropic SDK)
    claude_result = await call_claude_api(req)

    return consensus_engine(results + [claude_result])
```

---

### 9.3 — Consensus Engine (Node.js / Next.js)

**Dosya:** `web/lib/consensus.ts`

#### Algoritma

```
1. Her modelden [{diagnosis, probability}] listesi alınır
2. Tanılar normalize edilir (fuzzy match: "Pneumonia" = "Pnömoni" = "pneumonia")
3. Her tanı için ağırlıklı ortalama:
   weighted_prob = Σ(model_weight × probability) / Σ(model_weight)
4. Anlaşma skoru: kaç model bu tanıyı top-3'e koydu?
5. Final liste olasılığa göre sıralanır
```

#### Anlaşma Rozetleri

| Skor | Rozet | Anlam |
|---|---|---|
| 4/4 model hemfikir | 🟢 Güçlü Konsensüs | Tüm modeller aynı tanıya yüksek olasılık veriyor |
| 3/4 | 🟡 Orta Konsensüs | Çoğunluk hemfikir |
| 2/4 | 🟠 Zayıf Konsensüs | Modeller ayrışıyor |
| 1/4 | 🔴 Düşük Güven | Sadece bir model bu tanıyı öne çıkarıyor |

---

### 9.4 — Frontend Değişiklikleri

#### Rapor Yorum Bölümü (yeni görünüm)

```
┌─ YORUM (Multi-Model Consensus) ──────────────────────┐
│                                                        │
│  Pnömoni                        %66 ■■■■■■■■■░░  🟢 4/4 │
│  MedGemma: 65% │ Claude: 72% │ LLaVA-Med: 68% │ BioViL: 60%  │
│                                                        │
│  Atelektazi                     %19 ■■░░░░░░░░  🟡 3/4 │
│  ...                                                   │
└────────────────────────────────────────────────────────┘
```

- Her tanı için consensus bar (birleşik) + expandable model breakdown
- Anlaşma rozeti (🟢/🟡/🟠/🔴)
- "4 modelin 3'ü bu tanıda hemfikir" gibi açıklayıcı metin
- Hangi model hangi olasılığı verdi (küçük detay satırı)

---

### 9.5 — Maliyet Analizi

| Senaryo | GPU Süresi | API Maliyeti | Toplam/Analiz |
|---|---|---|---|
| Sadece MedGemma (mevcut) | ~25s A10G | $0 | ~$0.005 |
| + Claude API | ~25s A10G | ~$0.003 | ~$0.008 |
| + LLaVA-Med | ~50s 2×A10G (paralel) | $0 | ~$0.012 |
| Tam ensemble (4 model) | ~50s 3×A10G (paralel) | ~$0.003 | ~$0.020 |

> Paralel çalışma sayesinde 4 model süre olarak 1 model kadar uzun sürer — toplam latency artmaz, sadece maliyet artar.

---

### 9.6 — Yapılacaklar Listesi

| Öncelik | Görev |
|---|---|
| 🔴 | `backend/llava_med.py` — LLaVA-Med Modal container |
| 🔴 | `backend/biovil.py` — BioViL-T Modal container (chest X-ray) |
| 🔴 | Claude API entegrasyonu — `@anthropic-ai/sdk` Next.js API route'ta |
| 🔴 | Structured output prompt engineering — her model için JSON formatı |
| 🔴 | `web/lib/consensus.ts` — ağırlıklı ortalama + anlaşma skoru |
| 🔴 | `/api/analyze-ensemble` Next.js route — 4 modeli paralel çağır |
| 🟡 | `report-view.tsx` — consensus UI (model breakdown expandable) |
| 🟡 | Modality detection — BioViL-T'yi sadece chest X-ray'de etkinleştir |
| 🟡 | Yeni env değişkenleri: `ANTHROPIC_API_KEY`, `LLAVA_MED_URL`, `BIOVIL_URL` |
| 🟢 | Admin panelinde hangi modelin en çok kullanıldığı istatistiği |
| 🟢 | Kullanıcıya "Analiz modları" seçeneği (Hızlı: 1 model / Kapsamlı: 4 model) |

---

### 9.7 — Yeni Ortam Değişkenleri

```env
# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Modal — yeni container URL'leri (deploy sonrası alınacak)
LLAVA_MED_URL=https://...modal.run
BIOVIL_URL=https://...modal.run
```

---

**Faz 9 Tamamlanma Kriteri:** Kullanıcı analiz yaptığında 4 modelin ortak kararı, anlaşma skoruyla birlikte gösterilir. Her modelin ayrı olasılıkları expandable panel ile görülebilir.

---

## Ortam Değişkenleri (`.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tzmzjudtbxifbiqwfkqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=<Supabase Dashboard → Settings → API → service_role>  # Admin paneli için

# Modal
MODAL_API_URL=https://umutcindiloglu--medvision-ai-medgemmabackend-api.modal.run

# Admin
ADMIN_EMAIL=ucindiloglu@gmail.com  # Admin paneline erişebilecek e-posta
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
