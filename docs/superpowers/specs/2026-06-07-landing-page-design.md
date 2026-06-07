# Landing Page — Tasarım Spesifikasyonu

**Tarih:** 2026-06-07  
**Durum:** Onaylandı  
**Konu:** Herkese açık tanıtım sayfası (Landing Page)

---

## Sorun

Mevcut durumda `/` rotası doğrudan `(dashboard)/page.tsx`'e düşüyor ve giriş yapmamış kullanıcıyı anında `/login`'e yönlendiriyor. Kullanıcı uygulamanın ne olduğunu görmeden giriş yapmak zorunda kalıyor. `app/page.tsx` dosyası hiç yok.

## Hedef

Giriş yapmamış kullanıcılara uygulamayı tanıtan, güven oluşturan ve kayıt/giriş aksiyonu alan herkese açık bir landing sayfası.

---

## Onaylanan Tasarım

### Genel Yaklaşım
**Klasik SaaS akışı (A):** Hero'da metin solda + animasyon sağda, CTA butonları hemen üstte. Aşağı kaydırınca bilgi bölümleri.

### Animasyon Tonu
**Tarama & Analiz (B):** Koyu arka plan kart içinde X-ray tarama animasyonu. Tarama çizgisi, anomali noktaları, canlı bulgular ve progress barlar. "Rapor hazır" göstergesi.

---

## Sayfa Yapısı (Yukarıdan Aşağıya)

### 1. Navbar
- Solda: Logo (ikon + "MedVision AI" yazısı) — mevcut proje logosundan alınır
- Sağda: `Giriş Yap` (ghost buton, `/login`) + `Ücretsiz Kayıt Ol →` (primary mavi, `/register`)
- `position: sticky`, `backdrop-filter: blur`, beyaz arka plan

### 2. Hero (İki Sütun Grid)
**Sol sütun:**
- Badge: "Google MedGemma destekli" (mavi pill)
- H1: "Tıbbi görüntüde **akıllı analiz**, saniyeler içinde." (`em` vurgusu mavi)
- Açıklama metni: X-ray/MRI/CT desteği, Türkçe+İngilizce rapor, doktorlar için
- CTA: `Ücretsiz Başla` (primary, shadow) + `Giriş Yap` (bordered ghost)
- Trust satırı: "Kredi kartı gerekmez · Tanı aracı değildir"

**Sağ sütun — Scanner Animasyonu:**
- Koyu kart (`#0f172a`, `border-radius: 20px`)
- macOS-style traffic light header + monospace başlık
- X-ray görüntü alanı: akciğer SVG silüeti, grid overlay, tarama çizgisi (CSS animation), kırmızı anomali noktaları (pulse), köşe çerçeve imleri
- İki stat blok: "Normal Doku" progress bar + "Anomali" progress bar
- Bulgular listesi: `pnömoni_riski → ORTA`, `kardiyomegali → DÜŞÜK`, `plevral_efüzyon → YOK`
- "Rapor hazır" satırı: yeşil pulse dot + 🇹🇷 TR / 🇬🇧 EN dil chip'leri
- Tüm animasyonlar CSS-only (`@keyframes`), JS yok

### 3. "Nasıl Çalışır?" Bölümü
- Beyaz arka plan, 3 kartlık grid
- **1 – Görüntü Yükle:** JPEG/PNG/DICOM, drag & drop
- **2 – AI Analiz Eder:** MedGemma, saniyeler içinde
- **3 – Raporu Al:** Türkçe + İngilizce, geçmiş erişimi
- Kartlar arası ok imleri

### 4. Özellikler Grid
- `#f8fafc` arka plan, 3×2 kart grid
- 6 kart: Türkçe+İngilizce Rapor, Hızlı Analiz, Sohbet ile Sorgula, Analiz Geçmişi, Güvenli Altyapı, Çoklu Görüntü

### 5. "MedGemma Nedir?" Bölümü
- İki sütun: sol metin + sağda koyu model stats kartı (monospace JSON görünümü)
- Stats: radyoloji 92%, patoloji 88%, klinik_nlp 85%, çok_dil 95%
- Rozetler: Google DeepMind, Radyoloji, Patoloji, Klinik NLP

### 6. CTA Banner
- Koyu mavi gradient arka plan
- "Hemen başlayın, ücretsiz." başlığı
- `Ücretsiz Kayıt Ol` (beyaz) + `Giriş Yap` (outlined beyaz)

### 7. Footer
- Koyu (`#0f172a`)
- Logo + sorumluluk reddi metni + versiyon

---

## Routing Değişikliği

Next.js App Router'da `(dashboard)` route group URL'e segment eklemez. Bu nedenle `app/(dashboard)/page.tsx` ile `app/page.tsx` ikisi de `/`'ye map olur — çakışır. Çözüm: dashboard anasayfasını `/dashboard` rotasına taşımak.

| Rota | Mevcut | Yeni |
|------|--------|------|
| `/` | `(dashboard)/page.tsx` → giriş yoksa `/login`'e redirect | `app/page.tsx` → herkese açık landing (session varsa `/dashboard`'a redirect) |
| `/dashboard` | Yok | `(dashboard)/dashboard/page.tsx` → eski `(dashboard)/page.tsx` buraya taşınır |
| `/login` | `(auth)/login/page.tsx` | Değişmez; başarılı girişte `/dashboard`'a yönlendirir |
| `/register` | `(auth)/register/page.tsx` | Değişmez |
| `/analyze`, `/history`, vb. | Değişmez | Değişmez |

**Giriş yapılmış kullanıcı `/`'ya gelirse:** `app/page.tsx` içinde session kontrolü yapılır, oturum varsa `redirect('/dashboard')`.

**Navbar "Anasayfa" sekmesi:** Dashboard layout navbar'ına `/` linkli "Anasayfa" menü öğesi eklenir. Giriş yapmış kullanıcılar landing'i bu şekilde görebilir.

---

## Yeni Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `web/app/page.tsx` | Herkese açık landing page (server component) |
| `web/app/(dashboard)/dashboard/page.tsx` | Eski `(dashboard)/page.tsx` buraya taşınır |

## Değiştirilen Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `web/app/(dashboard)/page.tsx` | **Silinir** — içeriği `dashboard/page.tsx`'e taşınır |
| `web/app/(auth)/login/page.tsx` | `router.push('/')` → `router.push('/dashboard')` |
| `web/components/navbar.tsx` | "Anasayfa" (`/`) menü sekmesi eklenir |

---

## Tasarım Sistemi Uyumu

- Renkler: `blue-600` (#2563eb) ana, slate nötrler — mevcut sistemle aynı
- Rounded: `rounded-2xl` / `rounded-xl` — mevcut ile tutarlı
- Animasyonlar: `@keyframes` CSS-only, `prefers-reduced-motion` dikkate alınacak
- Tüm bileşenler Tailwind CSS ile yazılacak (inline style yok)
- Sorumluluk reddi: "Bu sistem klinik karar desteği amaçlıdır. Tanı koymaz." — footer'da korunur

---

## Kapsam Dışı

- `i18n` / çoklu dil desteği (sayfa Türkçe)
- Analytics / event tracking
- A/B test altyapısı
- Animasyon için harici kütüphane (Framer Motion vb.) — CSS-only yeterli
