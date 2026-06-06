import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MedGemma Nedir?',
  description:
    'MedGemma: Google tarafından geliştirilen açık tıbbi yapay zeka modeli. Mimarisi, eğitimi, kullanım alanları ve yetenekleri.',
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h2 className="flex items-center gap-2.5 text-lg font-semibold text-slate-800 mb-4">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </span>
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  )
}

export default function MedGemmaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Başlık */}
      <header className="text-center py-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">MedGemma Nedir?</h1>
        <p className="text-slate-500 mt-2 max-w-xl mx-auto">
          Google tarafından geliştirilen, sağlık ve tıp alanına özel açık (open-weight)
          yapay zeka modeli ailesi.
        </p>
      </header>

      {/* Genel Bakış */}
      <Section
        title="Genel Bakış"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <p>
          <strong className="text-slate-800">MedGemma</strong>, Google&apos;ın açık{' '}
          <strong className="text-slate-800">Gemma 3</strong> model mimarisi üzerine kurulmuş,
          tıbbi metin ve görüntüleri anlamak için özelleştirilmiş bir yapay zeka modeli
          koleksiyonudur. Google&apos;ın{' '}
          <strong className="text-slate-800">Health AI Developer Foundations (HAI-DEF)</strong>{' '}
          girişiminin bir parçası olarak, sağlık alanında uygulama geliştiren araştırmacı ve
          geliştiriciler için bir <em>başlangıç temeli</em> olarak yayınlanmıştır.
        </p>
        <p>
          Model <strong className="text-slate-800">açık ağırlıklıdır</strong> (open-weight) —
          yani ağırlıkları Hugging Face üzerinden indirilebilir, kendi sunucunuzda
          çalıştırabilir ve kendi verilerinizle ince ayar (fine-tuning) yapabilirsiniz. Bu,
          hasta verilerinin kurum dışına çıkmadan işlenebilmesi açısından önemli bir
          avantajdır.
        </p>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-blue-900">
          <p className="text-sm">
            <strong>Özetle:</strong> MedGemma, genel amaçlı bir dil modeli değil; radyoloji,
            patoloji, dermatoloji gibi tıbbi alanların verileriyle güçlendirilmiş, sağlık
            odaklı bir temel modeldir.
          </p>
        </div>
      </Section>

      {/* Model Ailesi */}
      <Section
        title="Model Ailesi ve Boyutları"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        }
      >
        <p>MedGemma birkaç farklı boyut ve yetenekte sunulur:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left">
                <th className="py-2 pr-4 font-medium">Model</th>
                <th className="py-2 pr-4 font-medium">Parametre</th>
                <th className="py-2 pr-4 font-medium">Tür</th>
                <th className="py-2 font-medium">Öne Çıkan</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">MedGemma 4B</td>
                <td className="py-2.5 pr-4">~4 milyar</td>
                <td className="py-2.5 pr-4">Çok kipli<br />(metin + görüntü)</td>
                <td className="py-2.5">Tıbbi görüntü analizi, görsel soru-cevap; daha hafif, hızlı</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2.5 pr-4 font-semibold text-slate-800">MedGemma 27B</td>
                <td className="py-2.5 pr-4">~27 milyar</td>
                <td className="py-2.5 pr-4">Metin (ve çok kipli sürüm)</td>
                <td className="py-2.5">Derin klinik akıl yürütme, tıbbi metin anlama</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 font-semibold text-slate-800">MedSigLIP</td>
                <td className="py-2.5 pr-4">~400 milyon</td>
                <td className="py-2.5 pr-4">Görüntü kodlayıcı</td>
                <td className="py-2.5">Tıbbi görüntüleri sayısal temsile çeviren bileşen</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400">
          <strong>-it</strong> son eki (örn. <code className="text-slate-600">medgemma-4b-it</code>),
          modelin talimat-ayarlı (instruction-tuned) sürümü olduğunu belirtir; yani sohbet ve
          komut takip etme için optimize edilmiştir.
        </p>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-sm text-slate-600">
            <strong className="text-slate-800">MedVision AI</strong> bu platformda{' '}
            <strong className="text-blue-700">MedGemma 4B-it</strong> modelini kullanır —
            çünkü hem görüntü hem metni birlikte işleyebilen (çok kipli) ve makul donanımda
            hızlı çalışabilen sürüm budur.
          </p>
        </div>
      </Section>

      {/* Nasıl Eğitildi */}
      <Section
        title="Nasıl Eğitildi?"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
      >
        <p>
          MedGemma, temel Gemma modelinin üzerine{' '}
          <strong className="text-slate-800">geniş bir tıbbi veri kümesiyle</strong> yeniden
          eğitilerek (continued pre-training + fine-tuning) oluşturulmuştur. Eğitim verileri
          çeşitli tıbbi görüntüleme alanlarını ve tıbbi metni kapsar:
        </p>
        <ul className="space-y-2 list-none">
          {[
            ['Radyoloji', 'Göğüs röntgeni (X-ray), BT (CT) ve MR görüntüleri ile bunlara ait raporlar'],
            ['Histopatoloji', 'Doku örneklerinin mikroskobik (patoloji slayt) görüntüleri'],
            ['Dermatoloji', 'Cilt lezyonu ve hastalık görüntüleri'],
            ['Oftalmoloji', 'Göz dibi (fundus) görüntüleri'],
            ['Tıbbi metin', 'Klinik notlar, tıbbi literatür, soru-cevap veri kümeleri'],
          ].map(([k, v]) => (
            <li key={k} className="flex gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
              <span>
                <strong className="text-slate-800">{k}:</strong> {v}
              </span>
            </li>
          ))}
        </ul>
        <p>
          Görüntü tarafında, tıbbi görüntülerle özel olarak eğitilmiş{' '}
          <strong className="text-slate-800">MedSigLIP</strong> görüntü kodlayıcısı kullanılır.
          Bu kodlayıcı, bir tıbbi görüntüyü modelin &quot;anlayabileceği&quot; sayısal bir
          temsile dönüştürür; ardından dil modeli bu temsili metinle birlikte yorumlar.
        </p>
      </Section>

      {/* Kullanım Alanları */}
      <Section
        title="Kullanım Alanları"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        }
      >
        <p>MedGemma, sağlık alanında pek çok uygulamanın temelini oluşturabilir:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ['Tıbbi görüntü yorumlama', 'Röntgen, BT, MR gibi görüntüleri analiz edip bulguları açıklama'],
            ['Otomatik rapor taslağı', 'Görüntüden yapılandırılmış radyoloji raporu taslağı üretme'],
            ['Görsel soru-cevap (VQA)', 'Bir görüntü hakkında doğal dilde soru sorup yanıt alma'],
            ['Klinik metin anlama', 'Hasta notlarını özetleme, sınıflandırma, bilgi çıkarımı'],
            ['Triyaj desteği', 'Aciliyet gerektiren bulguların önceliklendirilmesine yardım'],
            ['Eğitim ve araştırma', 'Tıp eğitimi, model geliştirme ve klinik araştırma altyapısı'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-xl border border-slate-200 p-4">
              <p className="font-medium text-slate-800 text-sm mb-1">{title}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Yetenekler & Sınırlamalar */}
      <Section
        title="Yetenekler ve Sınırlamalar"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-green-50 border border-green-100 p-4">
            <p className="font-semibold text-green-800 text-sm mb-2">Güçlü Yönleri</p>
            <ul className="space-y-1.5 text-xs text-green-900">
              <li>• Tıbbi terminolojiye ve bağlama hâkim</li>
              <li>• Metin ve görüntüyü birlikte yorumlayabilir</li>
              <li>• Açık kaynak — yerelde, gizlilikle çalıştırılabilir</li>
              <li>• İnce ayara (fine-tuning) uygun</li>
              <li>• Doğal dilde açıklanabilir çıktı üretir</li>
            </ul>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
            <p className="font-semibold text-amber-800 text-sm mb-2">Sınırlamaları</p>
            <ul className="space-y-1.5 text-xs text-amber-900">
              <li>• Klinik kullanım için onaylı bir tıbbi cihaz <em>değildir</em></li>
              <li>• Hata yapabilir (&quot;halüsinasyon&quot; üretebilir)</li>
              <li>• Yerleşik nesne tespiti/segmentasyon yapmaz</li>
              <li>• Çıktısı uzman doğrulaması gerektirir</li>
              <li>• Eğitim verisindeki kısıtlar/önyargıları taşıyabilir</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* MedVision AI'da */}
      <Section
        title="MedVision AI'da Nasıl Kullanılıyor?"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      >
        <p>
          Bu platform, MedGemma 4B-it modelini bir GPU sunucusunda (Modal) çalıştırır.
          Yüklediğiniz tıbbi görüntü ve isteğe bağlı klinisyen notu modele iletilir; model
          önce İngilizce yapılandırılmış bir rapor (Bulgular / Yorum / Öneri) üretir, ardından
          bu rapor Türkçeye çevrilir. Rapor sayfasındaki sohbet bölümünde ise aynı görüntü
          bağlamında modele ek sorular sorabilirsiniz.
        </p>
      </Section>

      {/* Kaynaklar */}
      <Section
        title="Daha Fazla Bilgi"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        }
      >
        <ul className="space-y-2">
          <li>
            <a href="https://deepmind.google/models/gemma/medgemma/" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline">
              Google DeepMind — MedGemma resmi sayfası ↗
            </a>
          </li>
          <li>
            <a href="https://huggingface.co/google/medgemma-4b-it" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline">
              Hugging Face — google/medgemma-4b-it ↗
            </a>
          </li>
          <li>
            <a href="https://developers.google.com/health-ai-developer-foundations" target="_blank" rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline">
              Health AI Developer Foundations (HAI-DEF) ↗
            </a>
          </li>
        </ul>
      </Section>

      {/* Sorumluluk reddi */}
      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Tıbbi Sorumluluk Reddi:</strong> MedGemma ve bu platform yalnızca araştırma
          ve klinik karar <em>desteği</em> amaçlıdır. Üretilen çıktılar kesin tıbbi teşhis,
          tedavi veya uzman hekim değerlendirmesi yerine geçmez. Tüm klinik kararlar yetkili
          bir sağlık profesyoneli tarafından verilmelidir.
        </p>
      </div>
    </div>
  )
}
