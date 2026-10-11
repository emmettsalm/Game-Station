import type { Game, GameDetail, Genre, Paginated, Screenshot } from '../types/game'

const BASE_URL = '/api/rawg'

export class RawgApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'RawgApiError'
    this.status = status
  }
}

export interface GamesQueryParams {
  page?: number
  pageSize?: number
  genre?: string
  search?: string
  ordering?: string
}

async function request<T>(
  path: string,
  params: Record<string, string> = {},
  signal?: AbortSignal,
): Promise<T> {
  const query = new URLSearchParams({ ...params, path })
  const response = await fetch(`${BASE_URL}?${query}`, { signal })
  if (!response.ok) {
    const error: unknown = await response.json().catch(() => null)
    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message : `เรียก RAWG API ไม่สำเร็จ: ${response.status}`
    throw new RawgApiError(message, response.status)
  }
  return response.json() as Promise<T>
}

export function getGames(params: GamesQueryParams = {}, signal?: AbortSignal): Promise<Paginated<Game>> {
  const query: Record<string, string> = {
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 30),
  }
  if (params.genre) query.genres = params.genre
  if (params.search?.trim()) query.search = params.search.trim()
  if (params.ordering) query.ordering = params.ordering
  return request('games', query, signal)
}

export function getGame(id: number, signal?: AbortSignal): Promise<GameDetail> {
  return request(`games/${id}`, {}, signal)
}

export function getScreenshots(id: number, signal?: AbortSignal): Promise<Paginated<Screenshot>> {
  return request(`games/${id}/screenshots`, { page_size: '40' }, signal)
}

export function getGenres(signal?: AbortSignal): Promise<Paginated<Genre>> {
  return request('genres', { page_size: '40' }, signal)
}
