import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { RawgApiError } from '../api/rawg'
import { useGame, useScreenshots } from '../hooks/useGames'
import { useAuthStore } from '../store/useAuthStore'
import { useLibraryStore } from '../store/useLibraryStore'
import DetailSkeleton from '../components/state/DetailSkeleton'
import ErrorState from '../components/state/ErrorState'
import EmptyState from '../components/state/EmptyState'
import BookmarkIcon from '../components/common/BookmarkIcon'
import { finalPrice, getCheapestOffer, getDealForOffers, getOfferByStoreId, priceErrorMessage } from '../api/cheapshark'
import { useGameOffers } from '../hooks/useGameOffers'
import { useOfferStore } from '../store/useOfferStore'
import OfferPicker from '../components/game/OfferPicker'
import ScreenshotGallery from '../components/game/ScreenshotGallery'
import { baht, thaiDate } from '../utils/format'

export default function GameDetailPage() {
  const { id = '' } = useParams()

  const gameId = Number(id)
  const gameQuery = useGame(gameId)
  const game = gameQuery.data
  const screenshotsQuery = useScreenshots(gameId)
  const user = useAuthStore((state) => state.user)

  const wishlist =
    useLibraryStore((state) =>
      user ? state.libraryByUser[user.id] : undefined,
    ) ?? []

  const toggleGame = useLibraryStore(
    (state) => state.toggleGame,
  )

  // ราคาทุกแพลตฟอร์ม + แพลตฟอร์มที่บันทึกไว้ใน Library
  const savedOfferId = useOfferStore((state) => (user ? state.selected[user.id]?.[gameId] : undefined))
  const setOffer = useOfferStore((state) => state.setOffer)
  const removeOffer = useOfferStore((state) => state.removeOffer)
  const [pickedId, setPickedId] = useState<string>()

  const offersQuery = useGameOffers(game)
  const offers = offersQuery.data ?? []
  const deal = getDealForOffers(offers)

  const screenshots = screenshotsQuery.data?.results ?? []

  const refetch = () => { void gameQuery.refetch() }
  const retryScreenshots = () => { void screenshotsQuery.refetch() }

  if (gameQuery.isLoading) return <DetailSkeleton />
  if (gameQuery.isError && !game) {
    if (!(gameQuery.error instanceof RawgApiError && gameQuery.error.status === 404)) {
      return <ErrorState onRetry={refetch} />
    }
  }
  if (!game) return <EmptyState icon="👾" title="ไม่พบเกมนี้" actionLabel="กลับไปที่ Store" actionTo="/" />

  const saved = wishlist.includes(game.id)
  // ราคาที่บันทึกไว้ (ถ้าเป็นเกมที่บันทึกจากการ์ดโดยไม่ได้เลือก = ราคาถูกสุด)
  const savedOffer = saved ? (getOfferByStoreId(offers, savedOfferId) ?? getCheapestOffer(offers)) : undefined
  const selected = offers.find((offer) => offer.id === pickedId) ?? savedOffer ?? getCheapestOffer(offers)
  const selectedName = selected?.storeName ?? ''
  const isSavedChoice = selected && savedOffer?.storeId === selected.storeId

  const handleLibrary = () => {
    if (!user) {
      window.alert('กรุณาเข้าสู่ระบบก่อนเพิ่มเกมเข้า Library')
      return
    }
    if (!saved) {
      if (selected) setOffer(user.id, game.id, selected.storeId)
      void toggleGame(user.id, game.id)
    } else if (isSavedChoice || !selected) {
      removeOffer(user.id, game.id)                     // นำออกจาก Library
      void toggleGame(user.id, game.id)
    } else {
      if (selected) setOffer(user.id, game.id, selected.storeId)
    }
  }

  return (
    <article className="space-y-8">
      {gameQuery.isError && <ErrorState message="อัปเดตข้อมูลเกมไม่สำเร็จ กำลังแสดงข้อมูลที่โหลดไว้" onRetry={refetch} />}
      <div className="breadcrumbs text-sm">
        <ul>
          <li><Link to="/">Store</Link></li>
          <li>{game.name}</li>
        </ul>
      </div>

      {/* Hero */}
      <section className="relative rounded-box overflow-hidden min-h-64 md:min-h-96 bg-base-300">
        {game.background_image && (
          <img src={game.background_image} alt={game.name} className="w-full h-64 md:h-96 object-cover" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-base-100 via-base-100/40 to-transparent" />
        {deal && (
          <span className="absolute top-4 left-4 rounded-sm bg-green-500 text-green-950 text-sm font-bold px-2 py-1 shadow">
            SALE {deal.discount}%
          </span>
        )}
        <div className="absolute bottom-0 p-6 space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold">{game.name}</h1>
          <div className="flex flex-wrap gap-2">
            {game.genres.map((g) => (
              <span key={g.id} className="badge badge-primary">{g.name}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ซ้าย: เนื้อหา */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <section className="space-y-3">
            <h2 className="text-xl font-bold">เกี่ยวกับเกม</h2>
            <p className="leading-relaxed opacity-90 whitespace-pre-line">{game.description_raw}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">ภาพตัวอย่าง</h2>
            {screenshotsQuery.isLoading && <div className="skeleton h-48 md:h-60 w-full" aria-label="กำลังโหลดภาพตัวอย่าง" />}
            {screenshotsQuery.isError && <ErrorState message="โหลดภาพตัวอย่างไม่สำเร็จ" onRetry={retryScreenshots} />}
            {!screenshotsQuery.isLoading && !screenshotsQuery.isError && screenshots.length === 0 && (
              <p className="text-sm opacity-60">ยังไม่มีภาพตัวอย่าง</p>
            )}
            {screenshots.length > 0 && <ScreenshotGallery screenshots={screenshots} gameName={game.name} />}
          </section>
        </div>

        {/* ขวา: กล่องข้อมูล */}
        <aside className="card bg-base-200 h-fit lg:sticky lg:top-24">
          <div className="card-body gap-4">
            {/* ราคาของแพลตฟอร์มที่เลือก */}
            {offersQuery.isLoading ? <div className="skeleton h-20 w-full" aria-label="กำลังโหลดราคา" /> : offersQuery.isError ? (
              <ErrorState message={priceErrorMessage(offersQuery.error)} onRetry={() => { void offersQuery.refetch() }} />
            ) : !selected ? <p className="text-sm opacity-60">ไม่พบราคา PC ของเกมนี้ใน CheapShark</p> : <div>
              <p className="text-sm opacity-60">ราคาบน {selectedName} (บาทโดยประมาณ)</p>
              {selected.price.type === 'free' ? (
                <span className="text-4xl font-extrabold">FREE</span>
              ) : selected.price.discount > 0 ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-green-400">{baht(finalPrice(selected.price))}</span>
                    <span className="text-lg opacity-50 line-through">{baht(selected.price.normal)}</span>
                  </div>
                  <p className="text-sm text-green-400 mt-1">
                    ประหยัด {baht(selected.price.normal - finalPrice(selected.price))} ({selected.price.discount}%)
                  </p>
                </>
              ) : (
                <span className="text-4xl font-extrabold">{baht(selected.price.sale)}</span>
              )}
              <p className="text-xs opacity-60 mt-2">อัตราแลกเปลี่ยนอ้างอิงวันที่ {thaiDate(selected.rateDate)} · ราคาชำระจริงอาจต่างกัน</p>
            </div>}

            {/* เลือกแพลตฟอร์ม */}
            {selected && <OfferPicker
              offers={offers}
              selectedId={selected.id}
              savedId={savedOffer?.id}
              onSelect={setPickedId}
            />}

            <button
              type="button"
              className={`btn btn-lg ${saved && isSavedChoice ? 'btn-outline btn-primary' : 'btn-primary'}`}
              onClick={handleLibrary}
            >
              <BookmarkIcon filled={saved} className="w-5 h-5" />
              {!saved ? 'เพิ่มเข้า Library' : isSavedChoice ? 'อยู่ใน Library แล้ว' : selected ? `เปลี่ยนเป็น ${selectedName}` : 'นำออกจาก Library'}
            </button>

            <dl className="text-sm space-y-3">
              <div><dt className="opacity-60">วันวางจำหน่าย</dt><dd>{game.released ?? 'TBA'}</dd></div>
              <div><dt className="opacity-60">เวลาเล่นเฉลี่ย</dt><dd>{game.playtime} ชั่วโมง</dd></div>
              <div><dt className="opacity-60">ผู้พัฒนา</dt><dd>{game.developers.map((d) => d.name).join(', ')}</dd></div>
              <div><dt className="opacity-60">ผู้จัดจำหน่าย</dt><dd>{game.publishers.map((p) => p.name).join(', ')}</dd></div>
            </dl>

            <div className="stats stats-horizontal bg-base-100 w-full">
              <div className="stat">
                <div className="stat-title">Rating</div>
                <div className="stat-value text-2xl">⭐ {game.rating.toFixed(1)}</div>
                <div className="stat-desc">{game.ratings_count.toLocaleString()} รีวิว</div>
              </div>
              <div className="stat">
                <div className="stat-title">Metacritic</div>
                <div className="stat-value text-2xl text-success">{game.metacritic ?? '-'}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  )
}
