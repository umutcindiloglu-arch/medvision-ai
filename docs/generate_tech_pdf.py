#!/usr/bin/env python3
"""MedVision AI — Teknoloji ve Servis özeti PDF üretici (Türkçe karakter destekli)."""

from fpdf import FPDF
from datetime import date

# Renkler (proje paleti)
BLUE = (37, 99, 235)      # #2563eb
DARK = (15, 23, 42)       # slate-900
GRAY = (100, 116, 139)    # slate-500
LIGHT = (241, 245, 249)   # slate-100
WHITE = (255, 255, 255)
AMBER_BG = (254, 243, 199)
AMBER_TX = (146, 64, 14)

FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_B = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


class PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Arial", "", 8)
        self.set_text_color(*GRAY)
        self.cell(0, 8, "MedVision AI — Teknoloji ve Servis Özeti", align="L")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "", 8)
        self.set_text_color(*GRAY)
        self.cell(0, 10, f"Sayfa {self.page_no()}", align="C")


def section_title(pdf, text):
    pdf.ln(3)
    pdf.set_font("Arial", "B", 13)
    pdf.set_text_color(*BLUE)
    pdf.cell(0, 9, text, new_x="LMARGIN", new_y="NEXT")
    pdf.set_draw_color(*BLUE)
    pdf.set_line_width(0.4)
    y = pdf.get_y()
    pdf.line(pdf.l_margin, y, pdf.l_margin + 50, y)
    pdf.ln(3)


def tech_table(pdf, rows, col_w):
    # Başlık satırı
    pdf.set_font("Arial", "B", 9)
    pdf.set_fill_color(*BLUE)
    pdf.set_text_color(*WHITE)
    headers = ["Teknoloji", "Açıklama / Kullanım"]
    for h, w in zip(headers, col_w):
        pdf.cell(w, 8, "  " + h, fill=True, border=0)
    pdf.ln(8)

    pdf.set_font("Arial", "", 9)
    fill = False
    for name, desc in rows:
        # Yükseklik hesabı (çok satırlı açıklama)
        pdf.set_font("Arial", "B", 9)
        n_lines = max(
            1,
            len(pdf.multi_cell(col_w[1] - 4, 5, desc, dry_run=True, output="LINES",
                               new_x="RIGHT", new_y="TOP")),
        )
        row_h = max(8, n_lines * 5 + 3)

        x0, y0 = pdf.get_x(), pdf.get_y()
        if y0 + row_h > pdf.h - pdf.b_margin:
            pdf.add_page()
            x0, y0 = pdf.get_x(), pdf.get_y()

        bg = LIGHT if fill else WHITE
        pdf.set_fill_color(*bg)
        pdf.rect(x0, y0, sum(col_w), row_h, style="F")

        # Sol kolon (isim, kalın, mavi)
        pdf.set_xy(x0 + 2, y0 + 1.5)
        pdf.set_font("Arial", "B", 9)
        pdf.set_text_color(*BLUE)
        pdf.multi_cell(col_w[0] - 4, 5, name, new_x="RIGHT", new_y="TOP")

        # Sağ kolon (açıklama)
        pdf.set_xy(x0 + col_w[0] + 2, y0 + 1.5)
        pdf.set_font("Arial", "", 9)
        pdf.set_text_color(*DARK)
        pdf.multi_cell(col_w[1] - 4, 5, desc, new_x="LMARGIN", new_y="TOP")

        pdf.set_xy(x0, y0 + row_h)
        fill = not fill
    pdf.ln(2)


def service_table(pdf, rows):
    col_w = [38, 70, 72]
    pdf.set_font("Arial", "B", 9)
    pdf.set_fill_color(*BLUE)
    pdf.set_text_color(*WHITE)
    for h, w in zip(["Servis", "Amaç", "Adres / URL"], col_w):
        pdf.cell(w, 8, "  " + h, fill=True)
    pdf.ln(8)

    fill = False
    for name, purpose, url in rows:
        pdf.set_font("Arial", "", 8.5)
        n_lines = max(
            len(pdf.multi_cell(col_w[1] - 4, 4.5, purpose, dry_run=True,
                               output="LINES", new_x="RIGHT", new_y="TOP")),
            len(pdf.multi_cell(col_w[2] - 4, 4.5, url, dry_run=True,
                               output="LINES", new_x="RIGHT", new_y="TOP")),
            1,
        )
        row_h = max(8, n_lines * 4.5 + 3)
        x0, y0 = pdf.get_x(), pdf.get_y()
        if y0 + row_h > pdf.h - pdf.b_margin:
            pdf.add_page()
            x0, y0 = pdf.get_x(), pdf.get_y()

        pdf.set_fill_color(*(LIGHT if fill else WHITE))
        pdf.rect(x0, y0, sum(col_w), row_h, style="F")

        pdf.set_xy(x0 + 2, y0 + 1.5)
        pdf.set_font("Arial", "B", 8.5)
        pdf.set_text_color(*DARK)
        pdf.multi_cell(col_w[0] - 4, 4.5, name, new_x="RIGHT", new_y="TOP")

        pdf.set_xy(x0 + col_w[0] + 2, y0 + 1.5)
        pdf.set_font("Arial", "", 8.5)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(col_w[1] - 4, 4.5, purpose, new_x="RIGHT", new_y="TOP")

        pdf.set_xy(x0 + col_w[0] + col_w[1] + 2, y0 + 1.5)
        pdf.set_font("Arial", "", 8.5)
        pdf.set_text_color(*BLUE)
        pdf.multi_cell(col_w[2] - 4, 4.5, url, new_x="LMARGIN", new_y="TOP")

        pdf.set_xy(x0, y0 + row_h)
        fill = not fill
    pdf.ln(2)


pdf = PDF()
pdf.add_font("Arial", "", FONT)
pdf.add_font("Arial", "B", FONT_B)
pdf.set_auto_page_break(auto=True, margin=18)
pdf.add_page()

# ---- Kapak başlığı ----
pdf.set_fill_color(*BLUE)
pdf.rect(0, 0, 210, 42, style="F")
pdf.set_xy(pdf.l_margin, 12)
pdf.set_font("Arial", "B", 22)
pdf.set_text_color(*WHITE)
pdf.cell(0, 10, "MedVision AI", new_x="LMARGIN", new_y="NEXT")
pdf.set_x(pdf.l_margin)
pdf.set_font("Arial", "", 12)
pdf.cell(0, 8, "Teknoloji ve Servis Özeti", new_x="LMARGIN", new_y="NEXT")
pdf.ln(14)
pdf.set_font("Arial", "", 9)
pdf.set_text_color(*GRAY)
pdf.cell(0, 6, f"Oluşturulma: {date.today().strftime('%d.%m.%Y')}   |   "
              f"Canlı: yapayzekahekim.com", new_x="LMARGIN", new_y="NEXT")
pdf.ln(4)

pdf.set_font("Arial", "", 10)
pdf.set_text_color(*DARK)
pdf.multi_cell(0, 5.5,
    "MedVision AI, MedGemma 4B yapay zeka modeli ile tıbbi görüntü analizi yapan, "
    "Türkçe/İngilizce raporlama ve klinisyen sohbeti sunan bir web platformudur. "
    "Aşağıda projede kullanılan tüm teknolojiler ve dış servisler özetlenmiştir.")
pdf.ln(2)

# ---- Frontend ----
section_title(pdf, "Frontend (Web Arayüzü)")
tech_table(pdf, [
    ("Next.js 16", "React tabanlı web çatısı (App Router). Sayfalar, API route'ları ve sunucu bileşenleri."),
    ("React", "Kullanıcı arayüzü bileşen kütüphanesi."),
    ("TypeScript", "Tip güvenli JavaScript; tüm uygulama TS ile yazıldı."),
    ("Tailwind CSS 4", "Yardımcı sınıf tabanlı (utility-first) stil çatısı."),
    ("Geist", "Vercel'in arayüz yazı tipi (next/font ile optimize)."),
    ("Sonner", "Bildirim (toast) kütüphanesi."),
    ("react-dropzone", "Sürükle-bırak dosya yükleme bileşeni."),
    ("pdfmake", "Tarayıcıda PDF rapor üretimi (gömülü Roboto, tam Türkçe desteği)."),
], col_w=[40, 140])

# ---- Backend ----
section_title(pdf, "Backend (Yapay Zeka Sunucusu)")
tech_table(pdf, [
    ("Python 3.11", "Backend uygulama dili."),
    ("Modal", "Serverless GPU platformu; modeli A10G GPU üzerinde çalıştırır."),
    ("FastAPI", "Python web API çatısı (/analyze, /chat, /health uçları)."),
    ("PyTorch", "Derin öğrenme çatısı; modeli çalıştırır (bfloat16)."),
    ("Transformers (Hugging Face)", "Model yükleme ve çıkarım (AutoProcessor, AutoModelForImageTextToText)."),
    ("Pillow", "Görüntü işleme (base64 çözme, RGB dönüşüm)."),
    ("httpx", "Asenkron HTTP istemcisi (Supabase JWT doğrulama, rate-limit sorgusu)."),
], col_w=[40, 140])

# ---- AI Model ----
section_title(pdf, "Yapay Zeka Modeli")
tech_table(pdf, [
    ("MedGemma 4B-it", "Google'ın açık tıbbi yapay zeka modeli (çok kipli: metin + görüntü). "
                       "Gemma 3 mimarisi üzerine kurulu, talimat-ayarlı sürüm."),
    ("MedSigLIP", "MedGemma'nın tıbbi görüntü kodlayıcısı (~400M parametre)."),
], col_w=[40, 140])

# ---- Servisler ----
section_title(pdf, "Servisler ve Platformlar")
service_table(pdf, [
    ("Vercel", "Frontend (Next.js) barındırma ve otomatik dağıtım", "vercel.com"),
    ("Modal", "Backend GPU sunucusu (MedGemma çalışıyor)", "modal.com"),
    ("Supabase", "Veritabanı (PostgreSQL), kimlik doğrulama, dosya depolama", "supabase.com"),
    ("Hugging Face", "MedGemma model ağırlıklarının kaynağı", "huggingface.co/google/medgemma-4b-it"),
    ("GitHub", "Kaynak kod deposu / sürüm kontrolü", "github.com/umutcindiloglu-arch/medvision-ai"),
    ("Hostinger", "Alan adı (domain) sağlayıcısı", "yapayzekahekim.com"),
    ("pnpm", "Paket yöneticisi (monorepo workspace)", "pnpm.io"),
])

# ---- Mimari özet ----
section_title(pdf, "Mimari Akış (Özet)")
pdf.set_font("Arial", "", 9.5)
pdf.set_text_color(*DARK)
pdf.multi_cell(0, 5.5,
    "1. Kullanıcı tarayıcıda yapayzekahekim.com (Vercel) üzerinden giriş yapar.\n"
    "2. Tıbbi görüntü Supabase Storage'a yüklenir; kimlik Supabase Auth ile doğrulanır.\n"
    "3. Next.js API route'u görüntüyü Modal'daki MedGemma sunucusuna iletir.\n"
    "4. MedGemma önce İngilizce yapılandırılmış rapor üretir, ardından Türkçeye çevirir.\n"
    "5. Rapor Supabase veritabanına kaydedilir ve kullanıcıya gösterilir; sohbet ile ek "
    "sorular sorulabilir.")
pdf.ln(2)

# ---- Planlanan ----
section_title(pdf, "Planlanan (Faz 6 — Ücretlendirme)")
tech_table(pdf, [
    ("Stripe (muhtemel)", "Aylık abonelik ve ödeme altyapısı. Ücretsiz üyelik 1 analiz hakkı; "
                          "hak bitince abonelik sayfası. Aylık $10. Detaylar netleştirilecek."),
], col_w=[40, 140])

# ---- Not ----
pdf.ln(2)
pdf.set_fill_color(*AMBER_BG)
y0 = pdf.get_y()
pdf.set_font("Arial", "", 8.5)
pdf.set_text_color(*AMBER_TX)
txt = ("Not: Bu platform ve MedGemma yalnızca araştırma ve klinik karar desteği amaçlıdır; "
       "kesin tıbbi teşhis yerine geçmez. Tüm klinik kararlar yetkili bir hekim tarafından verilmelidir.")
lines = pdf.multi_cell(0, 4.5, txt, dry_run=True, output="LINES")
box_h = len(lines) * 4.5 + 5
pdf.rect(pdf.l_margin, y0, pdf.w - 2 * pdf.l_margin, box_h, style="F")
pdf.set_xy(pdf.l_margin + 3, y0 + 2.5)
pdf.multi_cell(pdf.w - 2 * pdf.l_margin - 6, 4.5, txt)

out = "/Users/umutcindiloglu/Documents/medgemma-app/docs/MedVision-AI-Teknoloji-Ozeti.pdf"
pdf.output(out)
print("PDF oluşturuldu:", out)
