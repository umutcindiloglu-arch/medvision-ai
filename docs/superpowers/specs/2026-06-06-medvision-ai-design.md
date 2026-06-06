# MedVision AI — Tasarım Dokümanı

**Tarih:** 2026-06-06  
**Proje:** MedVision AI — Tıbbi Görüntü Analiz Platformu  
**Model:** MedGemma 4b-it (Google)  
**Durum:** Onaylandı ✅

---

## 1. Proje Özeti

Klinisyenlerin tıbbi görüntüleri (röntgen, CT, MRI, mikrobiyoloji vb.) yükleyip MedGemma yapay zeka modeli aracılığıyla analiz ettirebildiği, otomatik rapor alabileceği ve model ile Türkçe/İngilizce sohbet edebildiği bir web platformu.

---

## 2. Kullanıcı Profili

- **Hedef kitle:** Klinisyenler / Doktorlar
- **Kullanım amacı:** Klinik karar destek — görüntü analizi, ikinci görüş, diferansiyel tanı
- **Erişim:** Hesap oluşturma zorunlu (email + şifre)

---

## 3. Temel Özellikler

| Özellik | Detay |
|---|---|
| Görüntü türleri | Tüm tıbbi görüntüler (DICOM, PNG, JPG, TIFF) |
| Analiz çıktısı | Otomatik yapılandırılmış rapor + serbest chat |
| Dil | İkidilli — TR + EN (MedGemma'ya İngilizce prompt, rapor her iki dilde) |
| Geçmiş | Kullanıcı bazlı analiz geçmişi, tüm raporlar ve sohbetler kayıtlı |
| Kimlik doğrulama | Email/şifre (Supabase Auth) |

---

## 4. Sistem Mimarisi

```
Doktor (Tarayıcı)
      │
      ▼
┌─────────────────────┐
│   Next.js (Vercel)  │  ← Frontend + API Routes
│   - Giriş/Kayıt     │
│   - Görüntü yükleme │
│   - Rapor görüntüle │
│   - Chat arayüzü    │
│   - Analiz geçmişi  │
└──────────┬──────────┘
           │ HTTP (görüntü + prompt)
           ▼
┌──────────────────────────┐
│  FastAPI on Modal (GPU)  │  ← MedGemma 4b-it
│  POST /analyze           │     Görüntü → Rapor (TR+EN)
│  POST /chat              │     Sohbet → Yanıt
└──────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│       Supabase          │
│  - Auth (kullanıcılar)  │
│  - Storage (görüntüler) │
│  - PostgreSQL (raporlar,│
│    chat geçmişi)        │
└─────────────────────────┘
```

---

## 5. Sayfa Akışı

### Sayfa 1 — Giriş / Kayıt
- Email + şifre ile giriş
- Hesap oluşturma formu
- Giriş sonrası → Ana Sayfa

### Sayfa 2 — Ana Sayfa (Yeni Analiz)
- Sürükle-bırak görüntü yükleme alanı
- Desteklenen formatlar: DICOM, PNG, JPG, TIFF
- İsteğe bağlı klinisyen notu alanı
- "Analiz Et" butonu → Yükleme animasyonu (~15sn ilk istek)

### Sayfa 3 — Analiz Sonucu
- **Sol panel:** Yüklenen görüntü
- **Sağ panel — Rapor:**
  - TR / EN dil seçimi
  - Bulgular bölümü
  - Yorum bölümü
  - Öneri bölümü
  - PDF indir butonu
- **Alt panel — Chat:**
  - MedGemma ile serbest sohbet
  - Görüntü bağlamı korunur
  - Tüm mesajlar kayıtlı

### Sayfa 4 — Analiz Geçmişi
- Kullanıcının tüm analizleri listelenir
- Tarih, görüntü türü, soru sayısı gösterilir
- Tıklayınca Sayfa 3'e yönlendirir

---

## 6. Veritabanı Şeması (PostgreSQL — Supabase)

```sql
-- Kullanıcılar (Supabase Auth tarafından yönetilir)
-- users tablosu otomatik oluşur

-- Analizler
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,          -- Supabase Storage URL
  image_name TEXT,
  doctor_note TEXT,
  report_en TEXT,                   -- MedGemma İngilizce rapor
  report_tr TEXT,                   -- MedGemma Türkçe rapor
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat Mesajları
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. API Tasarımı (Modal FastAPI)

### POST /analyze
```json
// Request
{
  "image_base64": "...",
  "doctor_note": "Sol alt lob şüpheli..."
}

// Response
{
  "report_en": "Findings: ...\nImpression: ...\nRecommendation: ...",
  "report_tr": "Bulgular: ...\nYorum: ...\nÖneri: ..."
}
```

### POST /chat
```json
// Request
{
  "image_base64": "...",
  "messages": [
    {"role": "user", "content": "Diferansiyel tanı nedir?"}
  ]
}

// Response
{
  "reply": "Diferansiyel tanılar şunlar olabilir..."
}
```

---

## 8. MedGemma Prompt Stratejisi

```
System: You are a medical AI assistant helping clinicians analyze medical images.
        Provide structured reports with: Findings, Impression, Recommendation.
        Be concise, professional, and always recommend consulting a specialist.
        Respond in both English and Turkish.

User: [Doctor's note if provided]
      Please analyze this medical image and provide a structured report.

[IMAGE]
```

---

## 9. Teknoloji Stack

| Katman | Teknoloji | Platform |
|---|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS | Vercel |
| Backend | FastAPI + Python | Modal (Serverless GPU) |
| AI Model | MedGemma 4b-it | Modal (A10G GPU) |
| Auth | Supabase Auth | Supabase |
| Veritabanı | PostgreSQL | Supabase |
| Görüntü Depolama | Supabase Storage | Supabase |
| ORM | Prisma | Next.js |

---

## 10. Güvenlik & Gizlilik

- Tüm API istekleri JWT token ile doğrulanır
- Supabase Row Level Security (RLS) — kullanıcı yalnızca kendi verilerini görür
- Görüntüler Supabase Storage'da private bucket'ta saklanır
- Modal endpoint'i Supabase JWT ile korunur
- HTTPS zorunlu (Vercel + Modal otomatik sağlar)

---

## 11. Kısıtlamalar & Notlar

- **Cold start:** Modal'da MedGemma ilk açılışta ~10-15sn sürer. Kullanıcıya progress animasyonu gösterilir.
- **DICOM desteği:** Tarayıcıda DICOM render için `cornerstone.js` kullanılacak.
- **Tıbbi sorumluluk reddi:** Rapor sayfasında "Bu sistem klinik karar desteği amaçlıdır, tanı koymaz" uyarısı zorunlu.
- **Dosya boyutu limiti:** 20MB (Supabase Storage ücretsiz limit).
