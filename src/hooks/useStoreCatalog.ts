import { useGames } from './useGames'
import { usePricedGames } from './usePricedGames'

// A shared menu dataset: RAWG supplies the same 30-game fallback on every route.
export function useStoreCatalog() {
  const pricedQuery = usePricedGames()
  const pricesUnavailable = pricedQuery.isError && !pricedQuery.data
  const fallbackQuery = useGames({}, pricesUnavailable, Infinity)
  const games = pricesUnavailable ? fallbackQuery.data?.results ?? [] : pricedQuery.games

  return {
    pricedQuery,
    fallbackQuery,
    games,
    pricesUnavailable,
    isLoading: pricesUnavailable ? fallbackQuery.isLoading : pricedQuery.isLoading,
  }
}
