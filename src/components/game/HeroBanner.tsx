import { Link } from 'react-router'
import type { Game } from '../../types/game'
import BookmarkIcon from '../common/BookmarkIcon'

interface HeroBannerProps {
  game: Game
  saved: boolean
  onToggleSave: (id: number) => void
}

/** แบนเนอร์ใหญ่ด้านบนแบบ Netflix */
export default function HeroBanner({ game, saved, onToggleSave }: HeroBannerProps) {
  return (
    <section
      className="relative -mx-4 -mt-6 min-h-[60vh] md:min-h-[70vh] flex items-end bg-base-300 bg-cover bg-center"
      style={{ backgroundImage: game.background_image ? `url(${game.background_image})` : undefined }}
    >
      {/* ไล่สีให้ตัวหนังสืออ่านง่าย และกลืนกับพื้นหลังด้านล่าง */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent" />

      <div className="relative z-10 container mx-auto px-4 pb-16 md:pb-24 max-w-3xl md:max-w-none text-white space-y-4">
        <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg md:max-w-2xl">{game.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm opacity-90">
          <span>⭐ {game.rating.toFixed(1)}</span>
          {game.metacritic !== null && <span className="badge badge-success">{game.metacritic}</span>}
          <span>{game.released?.slice(0, 4) ?? 'TBA'}</span>
          {game.genres.map((g) => <span key={g.id}>· {g.name}</span>)}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to={`/game/${game.id}`} className="btn btn-primary btn-lg">▶ ดูรายละเอียด</Link>
          <button
            type="button"
            className={`btn btn-lg ${saved ? 'bg-white text-black border-0 hover:bg-white/90' : 'bg-white/20 border-0 text-white hover:bg-white/30'}`}
            onClick={() => onToggleSave(game.id)}
          >
            <BookmarkIcon filled={saved} className="w-5 h-5" />
            {saved ? 'อยู่ใน Library' : 'My Library'}
          </button>
        </div>
      </div>
    </section>
  )
}
