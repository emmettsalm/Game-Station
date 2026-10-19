import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheapSharkApiError, getPricedGamePage, mapApiOffers, priceErrorMessage } from '../api/cheapshark'
import { getGames } from '../api/rawg'
import { queryClient } from '../api/queryClient'
import type { Game } from '../types/game'

export const PRICED_GAME_COUNT = 30
const CONCURRENT_RAWG_LOOKUPS = 5
const MAX_CATALOG_PAGES = 10

interface PricedCatalog {
  games: Game[]
  warning: string | null
  retryAfter: number | null
}

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
      const games: Game[] = []
      const seenGameIds = new Set<number>()
      const seenCheapSharkIds = new Set<string>()
      let warning: string | null = null
      let retryAfter: number | null = null

      // One CheapShark page contains 30 candidates, not necessarily 30 RAWG matches.
      // Read later pages only until the shared Store/Search/Deals menu has 30 games.
      for (let pageNumber = 0; pageNumber < MAX_CATALOG_PAGES && games.length < PRICED_GAME_COUNT; pageNumber++) {
        try {
          const page = await getPricedGamePage(pageNumber, signal)
          const candidates = page.games.filter((item) => {
            if (seenCheapSharkIds.has(item.cheapsharkGameId)) return false
            seenCheapSharkIds.add(item.cheapsharkGameId)
            return item.title.length <= 100
          })
          const matches = await mapLimited(candidates, CONCURRENT_RAWG_LOOKUPS, async (item) => {
            const result = await queryClient.fetchQuery({
              queryKey: ['rawg-match', item.title],
              queryFn: ({ signal: matchSignal }) =>
                getGames({ search: item.title, pageSize: 20 }, AbortSignal.any([signal, matchSignal])),
              staleTime: 30 * 60 * 1000,
            })
            const game = result.results.find((candidate) => normalize(candidate.name) === normalize(item.title))
            return game ? { game, offers: mapApiOffers(game.id, item.offers) } : undefined
          })
          for (const match of matches) {
            if (!match || seenGameIds.has(match.game.id)) continue
            seenGameIds.add(match.game.id)
            games.push(match.game)
            queryClient.setQueryData(['cheapshark-offers', match.game.id, match.game.name], match.offers)
            if (games.length === PRICED_GAME_COUNT) break
          }
          if (!page.hasMore) break
        } catch (cause) {
          if (signal.aborted || games.length === 0) throw cause
          warning = `โหลดรายการเกมต่อไม่สำเร็จ: ${priceErrorMessage(cause)}`
          if (cause instanceof CheapSharkApiError && cause.status === 429) retryAfter = cause.retryAfter ?? 60
          break
        }
      }

      if (games.length < PRICED_GAME_COUNT && !warning) {
        warning = `พบเกมที่มีราคาและจับคู่กับ RAWG ได้ ${games.length}/${PRICED_GAME_COUNT} เกมในขณะนี้`
      }
      return { games, warning, retryAfter } satisfies PricedCatalog
    },
    // Keep the menu selection fixed while navigating; a full reload selects a new set.
    staleTime: Infinity,
    retry: (count, error) => count < 1 && !(error instanceof CheapSharkApiError && error.status === 429),
  })

  const { data, error, refetch } = query
  useEffect(() => {
    const seconds = data?.retryAfter ?? (error instanceof CheapSharkApiError && error.status === 429
      ? error.retryAfter ?? 60 : null)
    if (seconds === null) return
    const timer = window.setTimeout(() => { void refetch() }, seconds * 1000 + 1000)
    return () => window.clearTimeout(timer)
  }, [data, error, refetch])

  return { ...query, games: data?.games ?? [], warning: data?.warning ?? null,
    retryAfter: data?.retryAfter ?? null }
}
