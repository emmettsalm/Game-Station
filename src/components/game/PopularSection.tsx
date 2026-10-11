import type { Game, PriceInfo } from '../../types/game'
import PosterCard from './PosterCard'

interface PopularSectionProps {
  title: string
  games: Game[]                // ส่งมา 4 เกม
  isLoading?: boolean
  savedIds: number[]
  onToggleSave: (id: number) => void
  getPrice?: (game: Game) => PriceInfo | undefined
}

/** ส่วนยอดนิยม: การ์ดแนวตั้ง 4 ใบ ไม่ต้องเลื่อน (มือถือ 2 คอลัมน์) */
export default function PopularSection({ title, games, isLoading = false, savedIds, onToggleSave, getPrice }: PopularSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {isLoading
          ? Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton aspect-[3/4] w-full rounded-xl" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            ))
          : games.slice(0, 4).map((g, i) => (
              <PosterCard
                key={g.id}
                game={g}
                rank={i + 1}
                saved={savedIds.includes(g.id)}
                onToggleSave={onToggleSave}
                price={getPrice?.(g)}
              />
            ))}
      </div>
    </section>
  )
}
