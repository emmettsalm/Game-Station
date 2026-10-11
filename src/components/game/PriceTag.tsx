import type { PriceInfo } from '../../types/game'

const baht = (n: number) => `฿${Math.round(n).toLocaleString('th-TH')}`

/** ราคาแบบตัวหนังสือ: "ฟรี" / "฿599" / "฿399 → ฿239" */
export default function PriceTag({ price }: { price: PriceInfo }) {
  if (price.type === 'free') {
    return <span className="font-bold text-white">FREE</span>
  }
  if (price.discount === 0) {
    return <span className="font-semibold">{baht(price.normal)}</span>
  }
  const sale = price.normal * (1 - price.discount / 100)
  return (
    <span className="flex items-baseline gap-1.5 whitespace-nowrap">
      <span className="text-xs opacity-50 line-through">{baht(price.normal)}</span>
      <span className="font-bold text-green-400">{baht(sale)}</span>
    </span>
  )
}

/** ป้ายส่วนลดมุมซ้ายบนของรูป */
export function DiscountBadge({ price }: { price: PriceInfo }) {
  if (price.type !== 'paid' || price.discount === 0) return null
  return (
    <span className="absolute top-2 left-2 rounded-sm bg-green-500 text-green-950
                     text-[11px] leading-none font-bold px-1.5 py-1 shadow">
      SALE {price.discount}%
    </span>
  )
}
