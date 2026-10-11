import type { Game, GameDetail, Genre, Paginated, Screenshot } from '../types/game'

const BASE_URL = 'https://api.rawg.io/api'
const API_KEY = import.meta.env.VITE_RAWG_KEY

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
  if (!API_KEY?.trim()) throw new Error('ไม่พบ VITE_RAWG_KEY ในไฟล์ .env')
  const query = new URLSearchParams({ ...params, key: API_KEY.trim() })
  const response = await fetch(`${BASE_URL}/${path}?${query}`, { signal })
  if (!response.ok) {
    throw new RawgApiError(`เรียก RAWG API ไม่สำเร็จ: ${response.status}`, response.status)
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
