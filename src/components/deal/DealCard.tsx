import { Link } from 'react-router'
import type { Deal } from '../../types/deal'
import { baht } from '../../utils/format'

/** การ์ดโปรโมชัน — กดแล้วไปหน้ารายละเอียดเกม /game/:id เหมือนการ์ดหน้า Store */
export default function DealCard({ deal }: { deal: Deal }) {
  return (
    <Link to={`/game/${deal.gameId}`} title={deal.title} className="group/deal block space-y-2">
      <div className="relative aspect-[460/215] overflow-hidden rounded-xl bg-base-300">
        {deal.image && (
          <img
            src={deal.image}
            alt={deal.title}
            loading="lazy"
            className="w-full h-full object-cover brightness-90 group-hover/deal:brightness-115 transition duration-300"
          />
        )}
        {deal.discount > 0 && (
          <span className="absolute top-2 left-2 rounded-sm bg-green-500 text-green-950
                           text-[11px] leading-none font-bold px-1.5 py-1 shadow">
            SALE {deal.discount}%
          </span>
        )}
      </div>

      {/* ชื่อเกม (ซ้าย) + ราคา (ขวา) */}
      <div className="flex items-center justify-between gap-3 px-1 text-sm">
        <span className="font-medium line-clamp-1 group-hover/deal:text-primary transition-colors">{deal.title}</span>
        <span className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="text-xs opacity-50 line-through">{baht(deal.normalPrice)}</span>
          <span className="font-bold text-green-400">{baht(deal.salePrice)}</span>
        </span>
      </div>
    </Link>
  )
}
