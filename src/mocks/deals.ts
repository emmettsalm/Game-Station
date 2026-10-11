/**
 * ข้อมูลโปรโมชันจำลอง (mock) — ราคาเป็นเงินบาท ไม่ได้ดึงจาก API ภายนอก
 * สร้างจากรายชื่อเกมใน mockGames เพื่อให้กดไปหน้ารายละเอียดเกมได้
 */
import type { Deal } from '../types/deal'
import { mockGames } from './games'

const prices = [299, 399, 499, 590, 790, 990, 1290, 1590, 1890]
const ratings = ['Overwhelmingly Positive', 'Very Positive', 'Mostly Positive']

export const mockDeals: Deal[] = mockGames.slice(0, 12).map((g, i) => {
  const normalPrice = prices[i % prices.length]
  const discount = 85 - i * 6
  const endsAt = new Date(Date.UTC(2026, 9, 31 + (i % 5) * 3)).toISOString()
  return {
    id: `deal-${g.id}`,
    gameId: g.id,
    title: g.name,
    image: g.background_image,
    normalPrice,
    salePrice: Math.round(normalPrice * (1 - discount / 100)),
    discount,
    ratingText: ratings[i % ratings.length],
    ratingPercent: 95 - i,
    endsAt,
  }
})

/** วันสิ้นสุดแคมเปญ Hot Deals — 31 ต.ค. 2569 เวลา 23:59:59 (เวลาไทย) */
export const SALE_ENDS_AT = '2026-10-31T23:59:59+07:00'
