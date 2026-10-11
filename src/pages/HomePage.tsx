import { useSearchParams } from 'react-router'
import { getGamePrice } from '../mocks/pricing'
import { useAuthStore } from '../store/useAuthStore'
import { useLibraryStore } from '../store/useLibraryStore'
import { GAME_LIST_SIZE, useGames, useGenres } from '../hooks/useGames'
import GameCard from '../components/game/GameCard'
import GameGrid from '../components/game/GameGrid'
import GameRow from '../components/game/GameRow'
import HeroBanner from '../components/game/HeroBanner'
import PopularSection from '../components/game/PopularSection'
import GenreTabs from '../components/game/GenreTabs'
import SearchBar from '../components/common/SearchBar'
import GameCardSkeleton from '../components/state/GameCardSkeleton'
import ErrorState from '../components/state/ErrorState'
import EmptyState from '../components/state/EmptyState'

export default function HomePage() {
  const [params, setParams] = useSearchParams()
  const genre = params.get('genre') || undefined
  const search = params.get('q')?.trim() ?? ''
  const isListMode = Boolean(genre || search || params.get('view') === 'all')

  const gamesQuery = useGames()
  const genresQuery = useGenres()
  const user = useAuthStore((state) => state.user)
  const wishlist = useLibraryStore((state) => user ? state.libraryByUser[user.id] : undefined) ?? []
  const toggleGame = useLibraryStore((state) => state.toggleGame)
  const toggleWishlist = (gameId: number) => {
    if (!user) {
      window.alert('กรุณาเข้าสู่ระบบก่อนเพิ่มเกมเข้า Library')
      return
    }
    toggleGame(user.id, gameId)
  }
  const updateParams = (next: Record<string, string | undefined>) => {
    const updated = new URLSearchParams(params)
    for (const [key, value] of Object.entries(next)) {
      if (value) updated.set(key, value)
      else updated.delete(key)
    }
    setParams(updated)
  }
  const genres = genresQuery.data?.results ?? []
  const allGames = (gamesQuery.data?.results ?? []).slice(0, GAME_LIST_SIZE)
  const keyword = search.toLowerCase()
  const games = allGames.filter((game) => (
    (!keyword || game.name.toLowerCase().includes(keyword)) &&
    (!genre || game.genres.some((item) => item.slug === genre))
  ))
  const popular = [...allGames].sort((a, b) => b.added - a.added)
  const count = games.length
  const retryGames = () => { void gamesQuery.refetch() }
  const searchBar = (
    <SearchBar key={search} defaultValue={search}
      onSearch={(q) => updateParams({ q: q || undefined, page: undefined, view: 'all' })} />
  )
  const genreFeedback = genresQuery.isError ? (
    <div role="alert" className="alert alert-warning">
      <span>โหลดหมวดหมู่ไม่สำเร็จ</span>
      <button type="button" className="btn btn-sm" onClick={() => { void genresQuery.refetch() }}>ลองใหม่</button>
    </div>
  ) : genresQuery.isLoading ? <div className="skeleton h-10 w-full" aria-label="กำลังโหลดหมวดหมู่" /> : null

  if (isListMode) {
    const genreName = genres.find((item) => item.slug === genre)?.name ?? genre
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {searchBar}
          {genreFeedback}
          <GenreTabs genres={genres} active={genre}
            onSelect={(slug) => updateParams({ genre: slug, page: undefined, view: 'all' })} />
        </div>
        <h1 className="text-2xl font-bold">
          {search ? `ผลการค้นหา “${search}”` : genre ? `หมวด ${genreName}` : 'เกมทั้งหมด'}
          {gamesQuery.data && ` (${count.toLocaleString()} เกม)`}
        </h1>
        {gamesQuery.isError && !gamesQuery.data ? <ErrorState onRetry={retryGames} />
          : gamesQuery.isLoading ? (
            <GameGrid>{Array.from({ length: 8 }, (_, i) => <GameCardSkeleton key={i} />)}</GameGrid>
          ) : games.length === 0 ? <EmptyState icon="🔎" title={`ไม่พบเกมในชุด ${GAME_LIST_SIZE} เกมนี้`} /> : (
            <>
              {gamesQuery.isError && <ErrorState message="อัปเดตข้อมูลไม่สำเร็จ กำลังแสดงข้อมูลที่โหลดไว้" onRetry={retryGames} />}
              <GameGrid>
                {games.map((game) => <GameCard key={game.id} game={game} saved={wishlist.includes(game.id)}
                  onToggleSave={toggleWishlist} price={getGamePrice(game.id)} />)}
              </GameGrid>
            </>
          )}

      </div>
    )
  }

  const featured = popular[0]
  return (
    <div className="space-y-10">
      {gamesQuery.isLoading ? <div className="skeleton -mx-4 -mt-6 h-[60vh] rounded-none" />
        : featured ? <HeroBanner game={featured} saved={wishlist.includes(featured.id)} onToggleSave={toggleWishlist} />
          : gamesQuery.isError ? <ErrorState onRetry={retryGames} />
            : <EmptyState icon="🎮" title="ยังไม่มีเกมในระบบ" />}
      {searchBar}
      {gamesQuery.isError && featured && <ErrorState message="อัปเดตข้อมูลไม่สำเร็จ" onRetry={retryGames} />}
      <PopularSection title="ยอดนิยมตอนนี้" games={popular.slice(0, 4)} isLoading={gamesQuery.isLoading}
        savedIds={wishlist} onToggleSave={toggleWishlist} getPrice={(game) => getGamePrice(game.id)} />
      <GameRow title="เกมทั้งหมด" games={games} isLoading={gamesQuery.isLoading}
        isError={gamesQuery.isError && !gamesQuery.data} onRetry={retryGames} seeAllTo="/?view=all"
        savedIds={wishlist} onToggleSave={toggleWishlist} getPrice={(game) => getGamePrice(game.id)} />
      {genreFeedback}
      {genres.slice(0, 8).map((item) => ({
        genre: item,
        games: allGames.filter((game) => game.genres.some((gameGenre) => gameGenre.slug === item.slug)),
      })).filter((row) => row.games.length > 0).map((row) => (
        <GameRow key={row.genre.id} title={row.genre.name} games={row.games}
          seeAllTo={`/?genre=${encodeURIComponent(row.genre.slug)}`}
          savedIds={wishlist} onToggleSave={toggleWishlist} getPrice={(game) => getGamePrice(game.id)} />
      ))}
    </div>
  )
}
