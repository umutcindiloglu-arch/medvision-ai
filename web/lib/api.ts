/**
 * API cevaplarını güvenli ayrıştırma yardımcıları.
 *
 * Neden gerekli: Vercel fonksiyonu `maxDuration` (60s) aşıldığında veya
 * Modal backend cold-start'ta yavaş kaldığında, route handler'ın döndürdüğü
 * JSON yerine platformun düz metin/HTML hata sayfası geri gelir
 * (örn. "An error occurred..."). Bu durumda `res.json()` doğrudan
 * "Unexpected token 'A'" fırlatır ve gerçek hatayı (timeout) maskeler.
 *
 * Bu yardımcılar önce gövdeyi metin olarak okur, JSON ise ayrıştırır,
 * değilse anlamlı bir Error fırlatır.
 */

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
 * Her zaman bir string döndürür; asla fırlatmaz — çağrı yerleri bunu
 * `throw new Error(...)` içinde kullanabilir.
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
 * JSON olmayan bir gövde için kullanıcı dostu mesaj üretir.
 *
 * Mantık:
 *   - 504/502/503 (veya 408/524) → büyük olasılıkla Modal cold-start ya da
 *     gateway timeout. Bu geçici bir durum; kullanıcıya tekrar denemesini
 *     söyleyen eyleme dönük bir mesaj veriyoruz.
 *   - Diğer tüm durumlarda ham gövdeyi (HTML/metin olabilir) kullanıcıya
 *     göstermeyip genel ama HTTP kodunu içeren bir mesaj döndürüyoruz.
 */
function describeNonJson(res: Response, _body: string): string {
  const timeoutCodes = [408, 502, 503, 504, 524]
  if (timeoutCodes.includes(res.status)) {
    return 'Model uyanıyor olabilir, bu işlem ilk seferde biraz uzun sürebilir. Lütfen ~30 saniye bekleyip tekrar deneyin.'
  }
  return `Sunucu beklenmedik bir cevap döndürdü (HTTP ${res.status}). Lütfen tekrar deneyin.`
}
