import { Link } from 'react-router'
import type {Game,PriceInfo} from '../../types/game'
import BookmarkIcon from '../common/BookmarkIcon'
import PriceTag, {
  DiscountBadge,
} from './PriceTag'

interface GameCardProps {
  game: Game
  saved: boolean
  onToggleSave: (id: number) => void
  price?: PriceInfo
  priceUnavailable?: boolean
}

export default function GameCard({
  game,
  saved,
  onToggleSave,
  price,
  priceUnavailable = false,
}: GameCardProps) {
  return (
    <Link
      to={`/game/${game.id}`}
      className="card bg-base-200 overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 transition-all"
    >
      <figure className="relative h-44 bg-base-300">
        {game.background_image && (
          <img
            src={game.background_image}
            alt={game.name}
            loading="lazy"
            className="w-full h-full object-cover brightness-90 group-hover:brightness-115 transition duration-300"
          />
        )}

        {price && (
          <DiscountBadge price={price} />
        )}

        <button
          type="button"
          aria-label={
            saved
              ? 'นำออกจาก Library'
              : 'เพิ่มเข้า Library'
          }
          aria-pressed={saved}
          className={`btn btn-circle btn-sm absolute top-2 right-2 border-0 ${
            saved
              ? 'bg-white text-black hover:bg-white/90'
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
          onClick={(event) => {
            event.preventDefault()
            onToggleSave(game.id)
          }}
        >
          <BookmarkIcon filled={saved} />
        </button>

        {game.metacritic !== null && (
          <span className="badge badge-success absolute bottom-2 left-2 font-bold">
            {game.metacritic}
          </span>
        )}
      </figure>

      <div className="card-body p-4 gap-2">
        <h3 className="card-title text-base line-clamp-1">
          {game.name}
        </h3>

        <div className="flex flex-wrap gap-1">
          {game.genres
            .slice(0, 2)
            .map((genre) => (
              <span
                key={genre.id}
                className="badge badge-outline badge-sm"
              >
                {genre.name}
              </span>
            ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm opacity-70">
            ⭐ {game.rating.toFixed(1)}
          </span>

          {price && (
            <PriceTag price={price} />
          )}
          {!price && priceUnavailable && (
            <span className="text-xs opacity-60">ราคายังไม่พร้อม</span>
          )}
        </div>
      </div>
    </Link>
  )
}
