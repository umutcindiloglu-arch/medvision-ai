'use client'

import { useRef, useState } from 'react'
import { Analysis } from '@/types'

interface ReportViewProps {
  analysis: Analysis
  imageUrl: string | null
}

function parseReportSections(text: string) {
  const sections: { title: string; content: string }[] = []
  const patterns = [
    { key: 'findings', titles: ['Findings:', 'Bulgular:'] },
    { key: 'impression', titles: ['Impression:', 'Yorum:', 'Sonuç:'] },
    { key: 'recommendation', titles: ['Recommendation:', 'Öneri:'] },
  ]

  let remaining = text
  for (const { titles } of patterns) {
    for (const title of titles) {
      const idx = remaining.indexOf(title)
      if (idx !== -1) {
        const afterTitle = remaining.slice(idx + title.length)
        const nextSectionIdx = patterns
          .flatMap((p) => p.titles)
          .filter((t) => t !== title)
          .reduce((min, t) => {
            const i = afterTitle.indexOf(t)
            return i !== -1 && i < min ? i : min
          }, afterTitle.length)
        sections.push({
          title: title.replace(':', ''),
          content: afterTitle.slice(0, nextSectionIdx).trim(),
        })
        break
      }
    }
  }

  return sections.length > 0 ? sections : [{ title: 'Rapor', content: text.trim() }]
}

export function ReportView({ analysis, imageUrl }: ReportViewProps) {
  const [lang, setLang] = useState<'tr' | 'en'>('tr')
  const reportRef = useRef<HTMLDivElement>(null)

  const reportText = lang === 'tr' ? analysis.report_tr : analysis.report_en
  const sections = reportText ? parseReportSections(reportText) : []

  const formattedDate = new Date(analysis.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  async function handleDownloadPdf() {
    if (!reportRef.current) return

    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 10
    const imgWidth = pageWidth - margin * 2
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let y = margin
    let remainingHeight = imgHeight

    // Görüntü birden fazla sayfaya sığmıyorsa böl
    while (remainingHeight > 0) {
      doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight)
      remainingHeight -= pageHeight - margin * 2
      if (remainingHeight > 0) {
        doc.addPage()
        y = margin - (imgHeight - remainingHeight)
      }
    }

    doc.save(`medvision-rapor-${analysis.id.slice(0, 8)}.pdf`)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* Sol: Görüntü */}
      <div className="lg:w-2/5 flex flex-col gap-4">
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={analysis.image_name ?? 'Tıbbi görüntü'}
              className="w-full object-contain max-h-[500px]"
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
              Görüntü yüklenemedi
            </div>
          )}
        </div>

        {/* Meta bilgi */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Tarih</span>
            <span className="text-slate-800 font-medium">{formattedDate}</span>
          </div>
          {analysis.image_name && (
            <div className="flex justify-between text-slate-500">
              <span>Dosya</span>
              <span className="text-slate-800 font-medium truncate max-w-[180px]">{analysis.image_name}</span>
            </div>
          )}
          {analysis.doctor_note && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-slate-500 text-xs mb-1">Klinisyen Notu</p>
              <p className="text-slate-700">{analysis.doctor_note}</p>
            </div>
          )}
        </div>

        {/* Tıbbi Sorumluluk Reddi */}
        <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            Bu rapor yalnızca araştırma amaçlıdır ve tıbbi teşhis yerine geçmez.
            Kesin tanı için uzman hekime danışın.
          </p>
        </div>
      </div>

      {/* Sağ: Rapor */}
      <div className="lg:w-3/5 flex flex-col gap-4">
        {/* Başlık + Aksiyonlar */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Analiz Raporu</h2>
          <div className="flex items-center gap-2">
            {/* TR/EN Toggle */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
              <button
                onClick={() => setLang('tr')}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  lang === 'tr' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                TR
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                EN
              </button>
            </div>

            {/* PDF İndir */}
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-800
                border border-slate-200 hover:border-slate-300 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              PDF İndir
            </button>
          </div>
        </div>

        {/* Rapor Bölümleri */}
        {sections.length > 0 ? (
          <div ref={reportRef} className="space-y-4">
            {sections.map((section) => (
              <div key={section.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">
                  {section.title}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Rapor henüz oluşturulmadı.</p>
          </div>
        )}
      </div>
    </div>
  )
}
