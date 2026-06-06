export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
        <svg className="w-9 h-9 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">MedVision AI</h2>
      <p className="text-slate-500 max-w-sm">
        Görüntü yükleme özelliği Faz 3&apos;te eklenecek. Altyapı hazır.
      </p>
      <div className="mt-8 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
        ✓ Faz 1 tamamlandı — Auth sistemi çalışıyor
      </div>
    </div>
  )
}
