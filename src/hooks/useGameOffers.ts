import { useQueries, useQuery } from '@tanstack/react-query'
import type { Game } from '../types/game'
import { CheapSharkApiError, getGameOffers } from '../api/cheapshark'

export const gameOfferQuery = (game?: Game) => ({
  queryKey: ['cheapshark-offers', game?.id, game?.name],
  queryFn: ({ signal }: { signal: AbortSignal }) => getGameOffers(game!.id, game!.name, signal),
  enabled: Boolean(game),
  // The menu already supplies these offers. Keep them across route changes;
  // otherwise all 30 cards can refresh together and exhaust CheapShark.
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  retry: (count: number, error: Error) => count < 1 && !(error instanceof CheapSharkApiError && error.status === 429),
})

export function useGameOffers(game?: Game) {
  return useQuery(gameOfferQuery(game))
}

export function useGameOfferQueries(games: (Game | undefined)[]) {
  return useQueries({ queries: games.map(gameOfferQuery) })
}
