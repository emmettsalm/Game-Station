import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheapSharkApiError, getPricedGamePage, mapApiOffers } from '../api/cheapshark'
import { getGames } from '../api/rawg'
import { queryClient } from '../api/queryClient'
import type { Game } from '../types/game'

export const PRICED_GAME_COUNT = 30
const CONCURRENT_RAWG_LOOKUPS = 5

const normalize = (title: string) => title.normalize('NFKC').toLocaleLowerCase('en-US')
  .replace(/[^\p{L}\p{N}]+/gu, '')

async function mapLimited<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  let index = 0
  const output = new Array<R>(items.length)
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const current = index++
      output[current] = await mapper(items[current])
    }
  }))
  return output
}

// Store, Search and Deals all subscribe to this one list of at most 30 games.
export function usePricedGames() {
  const query = useQuery({
    queryKey: ['store-menu-games'],
    queryFn: async ({ signal }) => {
      const page = await getPricedGamePage(0, signal)
      const matches = await mapLimited(page.games.slice(0, PRICED_GAME_COUNT), CONCURRENT_RAWG_LOOKUPS, async (item) => {
        if (item.title.length > 100) return undefined
        const result = await queryClient.fetchQuery({
          queryKey: ['rawg-match', item.title],
          queryFn: ({ signal: matchSignal }) =>
            getGames({ search: item.title, pageSize: 20 }, AbortSignal.any([signal, matchSignal])),
          staleTime: 30 * 60 * 1000,
        })
        const game = result.results.find((candidate) => normalize(candidate.name) === normalize(item.title))
        if (!game) return undefined
        queryClient.setQueryData(['cheapshark-offers', game.id, game.name], mapApiOffers(game.id, item.offers))
        return game
      })
      const seen = new Set<number>()
      return matches.filter((game): game is Game => Boolean(game))
        .filter((game) => !seen.has(game.id) && Boolean(seen.add(game.id)))
        .slice(0, PRICED_GAME_COUNT)
    },
    // Keep the menu selection fixed while navigating; a full reload selects a new set.
    staleTime: Infinity,
    retry: (count, error) => count < 1 && !(error instanceof CheapSharkApiError && error.status === 429),
  })

  const { data, error, refetch } = query
  useEffect(() => {
    if (data || !(error instanceof CheapSharkApiError) || error.status !== 429) return
    const timer = window.setTimeout(() => { void refetch() }, (error.retryAfter ?? 60) * 1000 + 1000)
    return () => window.clearTimeout(timer)
  }, [data, error, refetch])

  return { ...query, games: data ?? [] }
}
