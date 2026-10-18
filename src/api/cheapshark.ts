import type { PriceOffer } from '../types/game'

const BASE_URL = '/api/cheapshark'
const COOLDOWN_KEY = 'gamestation-cheapshark-retry-until'
let cooldownUntil = 0

export function cheapSharkCooldownSeconds(): number {
  if (typeof window !== 'undefined') {
    try {
      cooldownUntil = Math.max(cooldownUntil, Number(window.localStorage.getItem(COOLDOWN_KEY)) || 0)
    } catch { /* Storage may be unavailable; the in-memory cooldown still applies. */ }
  }
  return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
}

function setCooldown(seconds: number): void {
  cooldownUntil = Math.max(cooldownUntil, Date.now() + seconds * 1000)
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(COOLDOWN_KEY, String(cooldownUntil)) } catch { /* Keep in memory. */ }
  }
}

interface ApiOffer {
  id: string
  storeId: string
  storeName: string
  storeIcon: string | null
  rateDate: string
  sale: number
  normal: number
}

export interface ListedGame {
  cheapsharkGameId: string
  title: string
  offers: ApiOffer[]
}

export interface PricedGamePage {
  games: ListedGame[]
  hasMore: boolean
}

export class CheapSharkApiError extends Error {
  readonly status: number
  readonly retryAfter: number | null
  constructor(message: string, status: number, retryAfter: number | null) {
    super(message)
    this.status = status
    this.retryAfter = retryAfter
  }
}

export function priceErrorMessage(error: unknown): string {
  if (error instanceof CheapSharkApiError && error.status === 429) {
    const minutes = error.retryAfter ? Math.ceil(error.retryAfter / 60) : null
    return minutes ? `CheapShark จำกัดการเรียก API ชั่วคราว ลองใหม่ในประมาณ ${minutes} นาที` : error.message
  }
  return error instanceof Error ? error.message : 'โหลดราคาไม่สำเร็จ กรุณาลองใหม่'
}

async function request<T>(params: URLSearchParams, signal?: AbortSignal): Promise<T> {
  const remaining = cheapSharkCooldownSeconds()
  if (remaining > 0) {
    throw new CheapSharkApiError('CheapShark จำกัดการเรียก API ชั่วคราว', 429, remaining)
  }
  const response = await fetch(`${BASE_URL}?${params}`, { signal })
  if (!response.ok) {
    const error: unknown = await response.json().catch(() => null)
    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message : 'โหลดราคาจาก CheapShark ไม่สำเร็จ'
    const retry = Number(response.headers.get('Retry-After'))
    if (response.status === 429) setCooldown(Number.isFinite(retry) && retry > 0 ? retry : 60)
    throw new CheapSharkApiError(message, response.status, Number.isFinite(retry) && retry > 0 ? retry : null)
  }
  return response.json() as Promise<T>
}

export function mapApiOffers(gameId: number, data: ApiOffer[]): PriceOffer[] {
  return data.map((item) => ({
    id: item.id,
    gameId,
    storeId: item.storeId,
    storeName: item.storeName,
    storeIcon: item.storeIcon,
    rateDate: item.rateDate,
    price: item.sale === 0
      ? { type: 'free' as const }
      : { type: 'paid' as const, normal: item.normal, sale: item.sale,
          discount: item.normal > 0 ? Math.round((1 - item.sale / item.normal) * 100) : 0 },
  })).sort((a, b) => finalPrice(a.price) - finalPrice(b.price))
}

export async function getGameOffers(gameId: number, title: string, signal?: AbortSignal): Promise<PriceOffer[]> {
  const data = await request<ApiOffer[]>(new URLSearchParams({ title }), signal)
  if (!Array.isArray(data)) throw new Error('ข้อมูลราคาจาก CheapShark ไม่ถูกต้อง')
  return mapApiOffers(gameId, data)
}

export async function getPricedGamePage(page: number, signal?: AbortSignal): Promise<PricedGamePage> {
  const params = new URLSearchParams({ page: String(page) })
  const data = await request<PricedGamePage>(params, signal)
  if (!data || !Array.isArray(data.games) || typeof data.hasMore !== 'boolean') {
    throw new Error('ข้อมูลรายการเกมจาก CheapShark ไม่ถูกต้อง')
  }
  return data
}

export const finalPrice = (price: PriceOffer['price']): number =>
  price.type === 'free' ? 0 : price.sale

export const getCheapestOffer = (offers: PriceOffer[]): PriceOffer | undefined => offers[0]
export const getOfferByStoreId = (offers: PriceOffer[], storeId?: string): PriceOffer | undefined =>
  offers.find((offer) => offer.storeId === storeId || `${offer.gameId}-${offer.storeId}` === storeId)
export const getDealForOffers = (offers: PriceOffer[]) => {
  const offer = offers.find((item) => item.price.type === 'paid' && item.price.discount > 0)
  if (!offer || offer.price.type !== 'paid' || offer.price.discount <= 0) return undefined
  return { normalPrice: offer.price.normal, salePrice: offer.price.sale,
    discount: offer.price.discount, storeName: offer.storeName }
}
