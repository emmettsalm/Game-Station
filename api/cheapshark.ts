const BASE = 'https://www.cheapshark.com/api/1.0/'
const IMAGE_BASE = 'https://www.cheapshark.com'

interface SearchGame { gameID: string; external: string }
interface GameDeal { storeID: string; dealID: string; price: string; retailPrice: string }
interface GameLookup { info: { title: string }; deals: GameDeal[] }
interface Store { storeID: string; storeName: string; isActive: number; images?: { icon?: string } }
interface ListedDeal { gameID: string; title: string }
interface ApiOffer { id: string; storeId: string; storeName: string; storeIcon: string | null; sale: number; normal: number; rateDate: string }
interface PricedGameListing { games: { cheapsharkGameId: string; title: string; offers: ApiOffer[] }[]; hasMore: boolean }

const CACHE_MS = 60 * 60 * 1000
const CACHE_CONTROL = 'public, max-age=3600'

let storeCache: { expires: number; data: Store[] } | undefined
let storePromise: Promise<Store[]> | undefined
let rateCache: { expires: number; rate: number; date: string } | undefined
let ratePromise: Promise<{ rate: number; date: string }> | undefined
const listCache = new Map<string, { expires: number; data: PricedGameListing }>()
const listInFlight = new Map<string, Promise<PricedGameListing>>()
const offerCache = new Map<string, { expires: number; data: ApiOffer[] }>()
const offerInFlight = new Map<string, Promise<ApiOffer[]>>()
let blockedUntil = 0

class UpstreamError extends Error {
  readonly status: number
  readonly retryAfter: string | null
  constructor(status: number, retryAfter: string | null) {
    super('CheapShark upstream error')
    this.status = status
    this.retryAfter = retryAfter
  }
}

const error = (message: string, status: number, headers: Record<string, string> = {}) => Response.json({ message }, {
  status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
})

const normalize = (title: string) => title.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US')
const money = (value: string) => {
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}

async function upstream<T>(path: string, params: Record<string, string>): Promise<T> {
  const remaining = Math.ceil((blockedUntil - Date.now()) / 1000)
  if (remaining > 0) throw new UpstreamError(429, String(remaining))
  const url = new URL(path, BASE)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'GameStation/1.0 (CS319 university game price comparison project)' },
    redirect: 'error',
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) {
    const retryAfter = response.headers.get('Retry-After')
    if (response.status === 429) {
      const seconds = Number(retryAfter)
      const retrySeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 60
      blockedUntil = Math.max(blockedUntil, Date.now() + retrySeconds * 1000)
    }
    throw new UpstreamError(response.status, retryAfter)
  }
  return response.json() as Promise<T>
}

async function stores(): Promise<Store[]> {
  if (storeCache && storeCache.expires > Date.now()) return storeCache.data
  storePromise ??= upstream<Store[]>('stores', {}).then((data) => {
    storeCache = { data, expires: Date.now() + 24 * 60 * 60 * 1000 }
    return data
  }).finally(() => { storePromise = undefined })
  return storePromise
}

async function usdToThb(): Promise<{ rate: number; date: string }> {
  if (rateCache && rateCache.expires > Date.now()) return rateCache
  ratePromise ??= (async () => {
    const response = await fetch('https://api.frankfurter.dev/v2/rate/usd/thb', {
      headers: { Accept: 'application/json', 'User-Agent': 'GameStation/1.0 (CS319 university game price comparison project)' },
      redirect: 'error',
      signal: AbortSignal.timeout(8_000),
    })
    if (!response.ok) throw new Error('Exchange rate unavailable')
    const data: unknown = await response.json()
    if (!data || typeof data !== 'object' || !('rate' in data) || !('date' in data)
      || typeof data.rate !== 'number' || !Number.isFinite(data.rate) || data.rate <= 0
      || typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      throw new Error('Invalid exchange rate')
    }
    rateCache = { rate: data.rate, date: data.date, expires: Date.now() + 12 * 60 * 60 * 1000 }
    return rateCache
  })().catch((error) => {
    if (rateCache) return rateCache
    throw error
  }).finally(() => { ratePromise = undefined })
  return ratePromise
}

function toOffers(deals: GameDeal[], allStores: Store[], fx: { rate: number; date: string }): ApiOffer[] {
  const byStore = new Map<string, ApiOffer>()
  for (const deal of deals) {
    const sale = money(deal.price)
    const normal = money(deal.retailPrice)
    const store = allStores.find((item) => item.storeID === deal.storeID && item.isActive === 1)
    if (sale === undefined || normal === undefined || !store || !deal.dealID) continue
    const iconPath = store.images?.icon
    const icon = iconPath?.startsWith('/img/stores/') ? new URL(iconPath, IMAGE_BASE).toString() : null
    const convertedSale = Math.round(sale * fx.rate * 100) / 100
    const current = byStore.get(deal.storeID)
    if (!current || convertedSale < current.sale) byStore.set(deal.storeID, {
      id: deal.dealID, storeId: deal.storeID, storeName: store.storeName,
      storeIcon: icon, sale: convertedSale, normal: Math.round(normal * fx.rate * 100) / 100,
      rateDate: fx.date,
    })
  }
  return [...byStore.values()].sort((a, b) => a.sale - b.sale)
}

async function buildPricedGames(page: number, title: string, onSale: boolean): Promise<PricedGameListing> {
  const params: Record<string, string> = {
    pageNumber: String(page), pageSize: '30', sortBy: 'DealRating',
  }
  if (title) params.title = title
  if (onSale) params.onSale = '1'
  const listed = await upstream<ListedDeal[]>('deals', params)
  const unique = [...new Map(listed.filter((deal) => /^\d+$/.test(deal.gameID))
    .map((deal) => [deal.gameID, deal])).values()]
  const ids = unique.map((deal) => deal.gameID)
  if (ids.length === 0) return { games: [], hasMore: listed.length === 30 }
  const chunks: string[][] = []
  for (let index = 0; index < ids.length; index += 25) chunks.push(ids.slice(index, index + 25))
  const [allStores, fx, ...lookups] = await Promise.all([
    stores(), usdToThb(),
    ...chunks.map((chunk) => upstream<Record<string, GameLookup>>('games', { ids: chunk.join(',') })),
  ])
  const byId = Object.assign({}, ...lookups) as Record<string, GameLookup>
  const games = unique.flatMap((item) => {
    const lookup = byId[item.gameID]
    if (!lookup) return []
    const offers = toOffers(lookup.deals ?? [], allStores, fx)
    return offers.length ? [{ cheapsharkGameId: item.gameID, title: item.title, offers }] : []
  })
  const expires = Date.now() + CACHE_MS
  for (const game of games) offerCache.set(normalize(game.title), { expires, data: game.offers })
  return { games, hasMore: listed.length === 30 }
}

async function listPricedGames(page: number, title: string, onSale: boolean): Promise<Response> {
  const cacheKey = `${page}|${title}|${onSale}`
  const cached = listCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return Response.json(cached.data, { headers: { 'Cache-Control': CACHE_CONTROL,
      'X-Content-Type-Options': 'nosniff' } })
  }
  let pending = listInFlight.get(cacheKey)
  if (!pending) {
    pending = buildPricedGames(page, title, onSale).then((data) => {
      listCache.set(cacheKey, { expires: Date.now() + CACHE_MS, data })
      return data
    }).finally(() => { listInFlight.delete(cacheKey) })
    listInFlight.set(cacheKey, pending)
  }
  const data = await pending
  return Response.json(data, { headers: { 'Cache-Control': CACHE_CONTROL,
    'X-Content-Type-Options': 'nosniff' } })
}

async function offersForTitle(title: string): Promise<ApiOffer[]> {
  const key = normalize(title)
  const cached = offerCache.get(key)
  if (cached && cached.expires > Date.now()) return cached.data
  let pending = offerInFlight.get(key)
  if (!pending) {
    pending = (async () => {
      const matches = await upstream<SearchGame[]>('games', { title, exact: '1', limit: '10' })
      const match = matches.find((game) => normalize(game.external) === key)
      if (!match || !/^\d+$/.test(match.gameID)) return []
      const [game, allStores, fx] = await Promise.all([
        upstream<GameLookup>('games', { id: match.gameID }),
        stores(),
        usdToThb(),
      ])
      return normalize(game.info.title) === key ? toOffers(game.deals ?? [], allStores, fx) : []
    })().then((data) => {
      offerCache.set(key, { expires: Date.now() + CACHE_MS, data })
      return data
    }).finally(() => { offerInFlight.delete(key) })
    offerInFlight.set(key, pending)
  }
  return pending
}

export async function handleCheapSharkRequest(request: Request): Promise<Response> {
  if (request.method !== 'GET') return error('รองรับเฉพาะ GET', 405)
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  if ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return error('ไม่อนุญาตให้เรียกจากเว็บไซต์อื่น', 403)
  }
  const isList = url.searchParams.has('page')
  const allowed = isList ? new Set(['page', 'title', 'onSale']) : new Set(['title'])
  if ([...url.searchParams.keys()].some((key) => !allowed.has(key) || url.searchParams.getAll(key).length !== 1)) {
    return error('พารามิเตอร์ไม่ถูกต้อง', 400)
  }
  const title = url.searchParams.get('title')?.trim() ?? ''
  if (title.length > 120 || (!isList && !title)) return error('ชื่อเกมไม่ถูกต้อง', 400)
  const pageText = url.searchParams.get('page') ?? ''
  if (isList && (!/^[0-9]$/.test(pageText) || (url.searchParams.has('onSale') && !['0', '1'].includes(url.searchParams.get('onSale')!)))) {
    return error('หน้าหรือเงื่อนไขดีลไม่ถูกต้อง', 400)
  }
  try {
    if (isList) return await listPricedGames(Number(pageText), title, url.searchParams.get('onSale') === '1')
    return Response.json(await offersForTitle(title), {
      headers: { 'Cache-Control': CACHE_CONTROL, 'X-Content-Type-Options': 'nosniff' },
    })
  } catch (cause) {
    if (cause instanceof UpstreamError && cause.status === 429) {
      const retryAfter = cause.retryAfter ?? String(Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000)))
      return error('CheapShark จำกัดการเรียกชั่วคราว กรุณารอสักครู่แล้วลองใหม่', 429,
        { 'Retry-After': retryAfter })
    }
    return error('เชื่อมต่อ CheapShark ไม่สำเร็จ กรุณาลองใหม่', 502)
  }
}

export default { fetch: handleCheapSharkRequest }
