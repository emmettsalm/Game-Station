import { useAuthStore } from '../store/useAuthStore'
import { useLibraryStore } from '../store/useLibraryStore'
import { useGamesByIds } from '../hooks/useGames'
import { RawgApiError } from '../api/rawg'
import GameCapsule from '../components/game/GameCapsule'
import { getGamePrice } from '../mocks/pricing'
import GameGrid from '../components/game/GameGrid'
import EmptyState from '../components/state/EmptyState'

export default function LibraryPage() {
  const user = useAuthStore((state) => state.user)
  const wishlist = useLibraryStore((state) => user ? state.libraryByUser[user.id] : undefined) ?? []
  const toggleGame = useLibraryStore((state) => state.toggleGame)
  const clearLibrary = useLibraryStore((state) => state.clearLibrary)
  const loaded = useLibraryStore((state) => state.loaded)
  const loading = useLibraryStore((state) => state.loading)
  const pending = useLibraryStore((state) => state.pending)
  const gameQueries = useGamesByIds(wishlist)
  const toggleWishlist = (gameId: number) => {
    if (user) toggleGame(user.id, gameId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold">My Library</h1>
        {user && wishlist.length > 0 && (
          <button type="button" className="btn btn-outline btn-error btn-sm" disabled={pending || loading} onClick={() => clearLibrary(user.id)}>
            ล้างทั้งหมด
          </button>
        )}
      </div>
      {!loaded ? (
        <p role="status">{loading ? 'กำลังโหลด Library...' : 'ยังโหลด Library ไม่สำเร็จ กรุณาลองใหม่ที่ข้อความด้านบน'}</p>
      ) : wishlist.length === 0 ? (
        <EmptyState icon="🎮" title="ยังไม่มีเกมใน Library" actionLabel="ไปเลือกเกมที่ Store" actionTo="/" />
      ) : (
        <GameGrid>
          {gameQueries.map((query, index) => {
            const gameId = wishlist[index]
            if (!Number.isSafeInteger(gameId) || gameId <= 0 || (query.isError && !query.data)) {
              const missing = query.error instanceof RawgApiError && query.error.status === 404
              return (
                <div key={gameId} role="alert" className="card bg-base-200">
                  <div className="card-body gap-4">
                    <p className="font-semibold">{missing ? 'ไม่พบเกมนี้ในฐานข้อมูล' : 'โหลดเกมไม่สำเร็จ'} (ID: {gameId})</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => { void query.refetch() }}>ลองใหม่</button>
                      <button type="button" className="btn btn-outline btn-error btn-sm" onClick={() => toggleWishlist(gameId)}>
                        นำรายการนี้ออก
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
            if (!query.data) return (
              <div key={gameId} className="space-y-2" aria-label={`กำลังโหลดเกม ${gameId}`}>
                <div className="skeleton aspect-460/215 w-full rounded-xl" />
                <div className="skeleton h-4 w-3/4" />
              </div>
            )
            return (
              <div key={gameId} className="space-y-2">
                <GameCapsule game={query.data} saved onToggleSave={toggleWishlist} price={getGamePrice(gameId)} />
                {query.isError && (
                  <div role="alert" className="text-sm">
                    อัปเดตข้อมูลไม่สำเร็จ{' '}
                    <button type="button" className="link link-primary" onClick={() => { void query.refetch() }}>ลองใหม่</button>
                  </div>
                )}
              </div>
            )
          })}
        </GameGrid>
      )}
    </div>
  )
}
