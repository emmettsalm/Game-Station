import { useQuery, useQueries } from '@tanstack/react-query'
import { getGame, getGames, getGenres, getScreenshots } from '../api/rawg'
import type { GamesQueryParams } from '../api/rawg'

// Change this one value to set the dataset size for both Store and Deals.
export const GAME_LIST_SIZE = 30

const GAME_STALE_TIME = 5 * 60 * 1000

export function useGames(params: GamesQueryParams = {}) {
  const queryParams = { page: 1, pageSize: GAME_LIST_SIZE, ...params }
  return useQuery({
    queryKey: ['games', queryParams],
    queryFn: ({ signal }) => getGames(queryParams, signal),
    staleTime: GAME_STALE_TIME,
  })
}

export function useGame(id: number) {
  return useQuery({
    queryKey: ['game', id],
    queryFn: ({ signal }) => getGame(id, signal),
    enabled: Number.isSafeInteger(id) && id > 0,
    staleTime: GAME_STALE_TIME,
  })
}

export function useScreenshots(id: number) {
  return useQuery({
    queryKey: ['game-screenshots', id],
    queryFn: ({ signal }) => getScreenshots(id, signal),
    enabled: Number.isSafeInteger(id) && id > 0,
    staleTime: GAME_STALE_TIME,
  })
}

export function useGamesByIds(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['game', id],
      queryFn: ({ signal }: { signal: AbortSignal }) => getGame(id, signal),
      enabled: Number.isSafeInteger(id) && id > 0,
      staleTime: GAME_STALE_TIME,
    })),
  })
}

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: ({ signal }) => getGenres(signal),
    staleTime: 30 * 60 * 1000,
  })
}
