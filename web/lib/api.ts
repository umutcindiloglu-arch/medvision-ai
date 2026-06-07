const WARMUP_CODES = [408, 502, 503, 504, 524]

/** Başarılı (res.ok) bir cevabı güvenle JSON'a çevirir. */
export async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(describeNonJson(res, text))
  }
}

/**
 * Başarısız (!res.ok) bir cevaptan kullanıcıya gösterilecek hata mesajını çıkarır.
 * Her zaman bir string döndürür; asla fırlatmaz.
 */
export async function readError(res: Response, fallback: string): Promise<string> {
  const text = await res.text()
  try {
    const data = JSON.parse(text) as { error?: string }
    return data.error ?? fallback
  } catch {
    return describeNonJson(res, text)
  }
}

/**
 * Timeout/gateway hatalarını (502/503/504) otomatik olarak yeniden dener.
 *
 * Modal cold-start davranışı: Vercel 60s sonra bağlantıyı keser (504) ama
 * Modal container çalışmaya devam eder ve modeli yükler. İlk istek ~70s
 * sürdüyse 60s'de timeout alırız; model ~10s sonra hazır olur. 20s bekleyip
 * tekrar denenince sadece inference süresi (~15s) kalır → 60s limiti aşılmaz.
 *
 * @param onCountdown  Her saniye çağrılır (kalan saniye). null = bitti/retry gönderildi.
 */
export async function fetchWithWarmupRetry(
  url: string,
  options: RequestInit,
  onCountdown: (secondsLeft: number | null) => void,
  retryAfterSeconds = 20
): Promise<Response> {
  const res = await fetch(url, options)

  if (!res.ok && WARMUP_CODES.includes(res.status)) {
    for (let i = retryAfterSeconds; i > 0; i--) {
      onCountdown(i)
      await new Promise<void>((r) => setTimeout(r, 1000))
    }
    onCountdown(null)
    return fetch(url, options)
  }

  return res
}

function describeNonJson(res: Response, _body: string): string {
  if (WARMUP_CODES.includes(res.status)) {
    return 'Sunucu zaman aşımına uğradı. Otomatik olarak tekrar deneniyor...'
  }
  return `Sunucu beklenmedik bir cevap döndürdü (HTTP ${res.status}). Lütfen tekrar deneyin.`
}
