import { Link } from 'react-router'
import type { Game, PriceInfo } from '../../types/game'
import PriceTag, { DiscountBadge } from './PriceTag'
import BookmarkIcon from '../common/BookmarkIcon'

interface GameCapsuleProps {
  game: Game
  saved: boolean
  onToggleSave: (id: number) => void
  price?: PriceInfo            // ไม่ส่ง = แสดง rating แทนราคา
}

/** การ์ดแนวนอน: รูปเกม + ชื่อและราคาด้านล่าง */
export default function GameCapsule({ game, saved, onToggleSave, price }: GameCapsuleProps) {
  return (
    <Link to={`/game/${game.id}`} title={game.name} className="group/cap block space-y-2">
      <div className="relative aspect-[460/215] overflow-hidden rounded-xl bg-base-300">
        {game.background_image && (
          <img
            src={game.background_image}
            alt={game.name}
            loading="lazy"
            className="w-full h-full object-cover brightness-90 group-hover/cap:brightness-115 transition duration-300"
          />
        )}

        {price && <DiscountBadge price={price} />}

        {/* ปุ่มบุ๊กมาร์ก — โผล่ตอน hover หรือเมื่อบันทึกแล้ว */}
        <button
          type="button"
          aria-label={saved ? 'นำออกจาก Library' : 'เพิ่มเข้า Library'}
          aria-pressed={saved}
          onClick={(e) => {
            e.preventDefault()
            onToggleSave(game.id)
          }}
          className={`absolute top-2 right-2 btn btn-sm btn-circle border-0
            ${saved ? 'bg-white text-black hover:bg-white/90' : 'bg-black/60 text-white opacity-0 group-hover/cap:opacity-100'}`}
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      {/* ชื่อเกม (ซ้าย) + ราคา (ขวา) */}
      <div className="flex items-center justify-between gap-3 px-1 text-sm">
        <span className="font-medium line-clamp-1 group-hover/cap:text-primary transition-colors">{game.name}</span>
        {price ? <PriceTag price={price} /> : <span className="opacity-70 whitespace-nowrap">⭐ {game.rating.toFixed(1)}</span>}
      </div>
    </Link>
  )
}
