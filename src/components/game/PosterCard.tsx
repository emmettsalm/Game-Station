import { Link } from 'react-router'
import type { Game, PriceInfo } from '../../types/game'
import PriceTag from './PriceTag'
import BookmarkIcon from '../common/BookmarkIcon'

interface PosterCardProps {
  game: Game
  rank: number                 // อันดับ 1, 2, 3, ...
  saved: boolean
  onToggleSave: (id: number) => void
  price?: PriceInfo
}

/** การ์ดแนวตั้ง (โปสเตอร์) สำหรับส่วนยอดนิยม */
export default function PosterCard({ game, rank, saved, onToggleSave, price }: PosterCardProps) {
  return (
    <Link to={`/game/${game.id}`} title={game.name} className="group/poster block space-y-3">
      <div className="relative overflow-hidden rounded-xl bg-base-300">
        <div className="aspect-[3/4]">
          {game.background_image && (
            <img
              src={game.background_image}
              alt={game.name}
              loading="lazy"
              className="w-full h-full object-cover brightness-90 group-hover/poster:brightness-115 transition duration-300"
            />
          )}
        </div>

        {/* เลขอันดับใหญ่มุมซ้ายบน */}
        <span className="absolute top-2 left-3 text-5xl font-black text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
          {rank}
        </span>

        <button
          type="button"
          aria-label={saved ? 'นำออกจาก Library' : 'เพิ่มเข้า Library'}
          aria-pressed={saved}
          onClick={(e) => {
            e.preventDefault()
            onToggleSave(game.id)
          }}
          className={`absolute top-2 right-2 btn btn-sm btn-circle border-0
            ${saved ? 'bg-white text-black hover:bg-white/90' : 'bg-black/60 text-white opacity-0 group-hover/poster:opacity-100'}`}
        >
          <BookmarkIcon filled={saved} />
        </button>

      </div>

      <div className="space-y-1 px-1">
        <h3 className="font-bold line-clamp-1 group-hover/poster:text-primary transition-colors">{game.name}</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="opacity-60 line-clamp-1">{game.genres.map((g) => g.name).join(' · ')}</span>
          {price && <PriceTag price={price} />}
        </div>
      </div>
    </Link>
  )
}
