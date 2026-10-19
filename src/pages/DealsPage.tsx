import type { Deal } from '../types/deal'
import { getDealForOffers, priceErrorMessage } from '../api/cheapshark'
import { useGameOfferQueries } from '../hooks/useGameOffers'
import { PRICED_GAME_COUNT } from '../hooks/usePricedGames'
import { useStoreCatalog } from '../hooks/useStoreCatalog'
import DealCard from '../components/deal/DealCard'
import GameGrid from '../components/game/GameGrid'
import ErrorState from '../components/state/ErrorState'
import EmptyState from '../components/state/EmptyState'

const sortByDiscount = (
  deals: Deal[],
): Deal[] =>
  [...deals].sort(
    (a, b) => b.discount - a.discount,
  )

export default function DealsPage() {
  // Show deals only for games in the Store menu's shared 30-game catalog.
  const { pricedQuery: gamesQuery, games, pricesUnavailable } = useStoreCatalog()

  const priceQueries = useGameOfferQueries(pricesUnavailable ? [] : games)
  const pricesLoading = priceQueries.some((query) => query.isPending)
  const pricesFailed = priceQueries.some((query) => query.isError)

  // เกมที่มีส่วนลด เรียงจากลดมากไปน้อย (เกมฟรีหรือไม่ลดจะไม่เข้า Deals)
  const deals = sortByDiscount(
  games.flatMap((game, index): Deal[] => {
    const dealInfo =
      getDealForOffers(priceQueries[index]?.data ?? [])

    if (!dealInfo) {
      return []
    }

    const ratingPercent = Math.round(
      (game.rating / 5) * 100,
    )

    const ratingText =
      ratingPercent >= 90
        ? 'Overwhelmingly Positive'
        : ratingPercent >= 80
          ? 'Very Positive'
          : 'Mostly Positive'

    return [
      {
        id: `deal-${game.id}`,
        gameId: game.id,
        title: game.name,
        image: game.background_image,
        normalPrice:
          dealInfo.normalPrice,
        salePrice:
          dealInfo.salePrice,
        discount:
          dealInfo.discount,
        ratingText,
        ratingPercent,
      },
    ]
  }),
)

  const refetch = () => { void gamesQuery.refetch() }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl md:text-4xl font-extrabold">
        🔥 Hot Deals
      </h1>
      {!pricesUnavailable && gamesQuery.warning && (
        <div role="alert" className="alert alert-warning text-sm">
          <span>{gamesQuery.warning} ขณะนี้ Store มี {games.length}/{PRICED_GAME_COUNT} เกม
            {gamesQuery.retryAfter !== null ? ' ระบบจะลองใหม่เมื่อครบเวลารอ' : ''}</span>
          {gamesQuery.retryAfter === null &&
            <button type="button" className="btn btn-sm" onClick={refetch}>ลองโหลดเพิ่ม</button>}
        </div>
      )}
      {pricesUnavailable ? (
        <ErrorState
          message={priceErrorMessage(gamesQuery.error)}
          onRetry={refetch}
        />
      ) : gamesQuery.isLoading || pricesLoading ? (
        <GameGrid>
          {Array.from(
            { length: 8 },
            (_, index) => (
              <div
                key={index}
                className="space-y-2"
              >
                <div className="skeleton aspect-460/215 w-full rounded-xl" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            ),
          )}
        </GameGrid>
      ) : deals.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title={pricesFailed ? 'โหลดราคา CheapShark ไม่สำเร็จ' : 'ยังไม่มีโปรโมชันตอนนี้'}
        />
      ) : (
        <>
        {pricesFailed && <ErrorState message="บางเกมโหลดราคาไม่สำเร็จ" onRetry={() => { priceQueries.forEach((query) => { if (query.isError) void query.refetch() }) }} />}
        <GameGrid>
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
            />
          ))}
        </GameGrid>
        </>
      )}
    </div>
  )
}