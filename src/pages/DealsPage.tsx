import type { Deal } from '../types/deal'
import {getDealForGame, SALE_ENDS_AT} from '../mocks/pricing'
import { GAME_LIST_SIZE, useGames } from '../hooks/useGames'
import DealCard from '../components/deal/DealCard'
import SaleCountdown from '../components/deal/SaleCountdown'
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
  // โหลดเกมจริงชุดเดียวกับหน้า Home
  const gamesQuery = useGames()

  const games =
    (gamesQuery.data?.results ?? []).slice(0, GAME_LIST_SIZE)

  // สร้างรายการเกมที่เข้าเงื่อนไขโปรโมชันทั้งหมด
  const allDeals = sortByDiscount(
    games.flatMap((game): Deal[] => {
      const dealInfo =
        getDealForGame(game.id)

      // เกมฟรีหรือเกมที่ไม่มีส่วนลดจะไม่เข้า Deals
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
          endsAt:
            dealInfo.endsAt,
        },
      ]
    }),
  )

  const deals = sortByDiscount(
  games.flatMap((game): Deal[] => {
    const dealInfo =
      getDealForGame(game.id)

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
        endsAt:
          dealInfo.endsAt,
      },
    ]
  }),
)

  const refetch = () => {
    void gamesQuery.refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            🔥 Hot Deals
          </h1>

          {!gamesQuery.isLoading &&
            !gamesQuery.isError && (
              <p className="mt-1 text-sm opacity-70">
                แสดงโปรโมชัน {deals.length} เกม
                จากเกมที่เข้าเงื่อนไขทั้งหมด{' '}
                {allDeals.length} เกม
              </p>
            )}
        </div>

        {!gamesQuery.isLoading &&
          !gamesQuery.isError &&
          deals.length > 0 && (
            <SaleCountdown
              endsAt={SALE_ENDS_AT}
            />
          )}
      </div>

      {gamesQuery.isError ? (
        <ErrorState
          message="โหลดโปรโมชันไม่สำเร็จ"
          onRetry={refetch}
        />
      ) : gamesQuery.isLoading ? (
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
          title="ยังไม่มีโปรโมชันตอนนี้"
        />
      ) : (
        <GameGrid>
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
            />
          ))}
        </GameGrid>
      )}
    </div>
  )
}