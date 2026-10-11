import { env } from 'node:process'

const RAWG_BASE = 'https://api.rawg.io/api/'
const ALLOWED_PATH = /^(games|genres|games\/[1-9]\d{0,14}(\/screenshots)?)$/
const ALLOWED_PARAMS = new Set(['path', 'page', 'page_size', 'genres', 'search', 'ordering'])
const rateWindows = new Map<string, { start: number; count: number }>()

function jsonError(message: string, status: number, headers: Record<string, string> = {}) {
  return Response.json({ message }, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
  })
}

// A small per-instance limit. A shared Vercel Firewall rule is needed for a global limit.
function withinRateLimit(request: Request) {
  const now = Date.now()
  for (const [ip, entry] of rateWindows) {
    if (now - entry.start >= 60_000) rateWindows.delete(ip)
  }
  const ip = (request.headers.get('x-vercel-forwarded-for')
    ?? request.headers.get('x-forwarded-for') ?? 'local').split(',')[0].trim().slice(0, 100)
  const entry = rateWindows.get(ip)
  if (!entry) {
    if (rateWindows.size >= 2_000) return false
    rateWindows.set(ip, { start: now, count: 1 })
    return true
  }
  entry.count += 1
  return entry.count <= 120
}

// RAWG pagination links may contain the API key. Never send those URLs to the browser.
function sanitize(value: unknown, apiKey: string): unknown {
  if (typeof value === 'string') {
    let result = value
    try {
      const url = new URL(value)
      if (url.origin === 'https://api.rawg.io' && url.pathname.startsWith('/api/')) {
        const path = url.pathname.slice('/api/'.length).replace(/\/$/, '')
        if (ALLOWED_PATH.test(path)) {
          const params = new URLSearchParams({ path })
          for (const [key, item] of url.searchParams) {
            if (key !== 'path' && ALLOWED_PARAMS.has(key)) params.set(key, item)
          }
          result = `/api/rawg?${params}`
        }
      }
    } catch { /* Normal text and image URLs can remain unchanged. */ }
    return result.replaceAll(apiKey, '[redacted]').replaceAll(encodeURIComponent(apiKey), '[redacted]')
  }
  if (Array.isArray(value)) return value.map((item: unknown) => sanitize(item, apiKey))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'key')
      .map(([key, item]) => [key, sanitize(item, apiKey)]))
  }
  return value
}

export async function handleRawgRequest(request: Request, apiKey: string): Promise<Response> {
  if (request.method !== 'GET') return jsonError('รองรับเฉพาะ GET', 405, { Allow: 'GET' })
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  if ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return jsonError('ไม่อนุญาตให้เรียกจากเว็บไซต์อื่น', 403)
  }
  const path = url.searchParams.get('path') ?? ''
  if (!ALLOWED_PATH.test(path)) return jsonError('เส้นทาง RAWG ไม่ถูกต้อง', 400)
  for (const key of url.searchParams.keys()) {
    if (!ALLOWED_PARAMS.has(key) || url.searchParams.getAll(key).length !== 1) {
      return jsonError('พารามิเตอร์ RAWG ไม่ถูกต้อง', 400)
    }
  }
  const page = url.searchParams.get('page')
  const size = url.searchParams.get('page_size')
  if ((page !== null && (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > 1_000))
    || (size !== null && (!/^\d+$/.test(size) || Number(size) < 1 || Number(size) > 40))) {
    return jsonError('จำนวนหรือหน้าของเกมไม่ถูกต้อง', 400)
  }
  const search = url.searchParams.get('search')
  const genres = url.searchParams.get('genres')
  const ordering = url.searchParams.get('ordering')
  if ((search !== null && search.length > 100)
    || (genres !== null && (genres.length > 200 || !/^[a-zA-Z0-9_,-]+$/.test(genres)))
    || (ordering !== null && !/^-?(name|released|added|created|updated|rating|metacritic)$/.test(ordering))) {
    return jsonError('เงื่อนไขค้นหาไม่ถูกต้อง', 400)
  }
  const key = apiKey.trim()
  if (!key) return jsonError('ยังไม่ได้ตั้ง RAWG_API_KEY ที่หลังบ้าน', 503)
  if (!withinRateLimit(request)) {
    return jsonError('เรียก API บ่อยเกินไป กรุณารอแล้วลองใหม่', 429, { 'Retry-After': '60' })
  }

  const upstream = new URL(path, RAWG_BASE)
  for (const [name, value] of url.searchParams) {
    if (name !== 'path') upstream.searchParams.set(name, value)
  }
  if (path === 'games') {
    if (!upstream.searchParams.has('page')) upstream.searchParams.set('page', '1')
    if (!upstream.searchParams.has('page_size')) upstream.searchParams.set('page_size', '30')
  }
  upstream.searchParams.set('key', key)
  try {
    const response = await fetch(upstream, {
      headers: { Accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      const status = response.status === 404 || response.status === 429 ? response.status : 502
      return jsonError('เรียก RAWG ไม่สำเร็จ กรุณาลองใหม่', status)
    }
    const data: unknown = await response.json()
    return Response.json(sanitize(data, key), {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    // Never return an upstream URL, response body, or exception containing the key.
    return jsonError('เชื่อมต่อ RAWG ไม่สำเร็จ กรุณาลองใหม่', 502)
  }
}

export default {
  fetch(request: Request) {
    return handleRawgRequest(request, env.RAWG_API_KEY ?? '')
  },
}
