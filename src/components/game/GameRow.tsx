import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import type { Game, PriceInfo } from '../../types/game'
import GameCapsule from './GameCapsule'

interface GameRowProps {
  title: string
  games: Game[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  seeAllTo?: string                          // ลิงก์ "ดูทั้งหมด" เช่น /?genre=action
  savedIds: number[]
  onToggleSave: (id: number) => void
  getPrice?: (game: Game) => PriceInfo | undefined
}

/** แถวเกมแบบ Steam/Netflix — ลูกศรอยู่นอกการ์ด เลื่อนทีละหน้า */
export default function GameRow({
  title, games, isLoading = false, isError = false, onRetry, seeAllTo, savedIds, onToggleSave, getPrice,
}: GameRowProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  // เช็กว่ายังเลื่อนไปซ้าย/ขวาได้อีกไหม
  const updateArrows = () => {
    const el = scroller.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  // คำนวณใหม่เมื่อขนาดจอเปลี่ยน (ResizeObserver เรียกครั้งแรกให้เองด้วย)
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const observer = new ResizeObserver(() => updateArrows())
    observer.observe(el)
    return () => observer.disconnect()
  }, [games.length, isLoading])

  const scrollPage = (direction: 1 | -1) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' })
  }

  const arrowCls = (enabled: boolean) =>
    `hidden md:flex absolute top-0 bottom-7 w-10 items-center justify-center text-5xl leading-none
     text-base-content/70 hover:text-base-content transition
     ${enabled ? '' : 'opacity-20 pointer-events-none'}`

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 md:px-10">
        <h2 className="text-lg md:text-xl font-bold uppercase tracking-wide">{title}</h2>
        {seeAllTo && (
          <Link to={seeAllTo} className="btn btn-xs btn-ghost text-primary">ดูทั้งหมด ›</Link>
        )}
      </div>

      {isError ? (
        <div className="alert md:mx-10">
          <span>โหลดหมวด “{title}” ไม่สำเร็จ</span>
          {onRetry && <button type="button" className="btn btn-sm" onClick={onRetry}>ลองใหม่</button>}
        </div>
      ) : (
        <div className="relative md:px-10">
          <button type="button" aria-label={`เลื่อน ${title} ไปทางซ้าย`}
            className={`${arrowCls(canLeft)} left-0`} onClick={() => scrollPage(-1)}>‹</button>

          <div
            ref={scroller}
            onScroll={updateArrows}
            className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none"
          >
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="w-64 sm:w-[17rem] shrink-0 space-y-1">
                    <div className="skeleton aspect-[460/215] rounded-xl" />
                    <div className="skeleton h-4 w-3/4" />
                  </div>
                ))
              : games.map((g) => (
                  <div key={g.id} className="w-64 sm:w-[17rem] shrink-0 snap-start">
                    <GameCapsule
                      game={g}
                      saved={savedIds.includes(g.id)}
                      onToggleSave={onToggleSave}
                      price={getPrice?.(g)}
                    />
                  </div>
                ))}
          </div>

          <button type="button" aria-label={`เลื่อน ${title} ไปทางขวา`}
            className={`${arrowCls(canRight)} right-0`} onClick={() => scrollPage(1)}>›</button>
        </div>
      )}
    </section>
  )
}
