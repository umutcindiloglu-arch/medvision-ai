import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: {
    default: 'MedVision AI — Tıbbi Görüntü Analiz Platformu',
    template: '%s | MedVision AI',
  },
  description:
    'MedGemma yapay zeka modeli ile tıbbi görüntü analizi, Türkçe/İngilizce raporlama ve klinisyen sohbeti.',
  keywords: ['tıbbi görüntü analizi', 'MedGemma', 'radyoloji AI', 'yapay zeka', 'X-ray analiz'],
  authors: [{ name: 'MedVision AI' }],
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'MedVision AI',
    title: 'MedVision AI — Tıbbi Görüntü Analiz Platformu',
    description: 'MedGemma ile tıbbi görüntü analizi ve raporlama.',
  },
}

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
