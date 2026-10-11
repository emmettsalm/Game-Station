export interface Genre {
  id: number
  name: string
  slug: string
}

export interface Platform {
  platform: { id: number; name: string; slug: string }
}

export interface Game {
  id: number
  slug: string
  name: string
  released: string | null
  background_image: string | null
  rating: number
  ratings_count: number
  metacritic: number | null
  added: number
  playtime: number
  genres: Genre[]
  parent_platforms?: Platform[]
}

export interface Company {
  id: number
  name: string
}

export interface GameDetail extends Game {
  description_raw: string
  website: string
  developers: Company[]
  publishers: Company[]
}

export interface Screenshot {
  id: number
  image: string
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/** ราคาสำหรับแสดงบนการ์ด (RAWG ไม่มีราคา — ตอนนี้ใช้ mock / ถ้าไม่มีจะโชว์ rating แทน) */
export type PriceInfo =
  | { type: 'free' }
  | { type: 'paid'; normal: number; discount: number } // discount เป็น % เช่น 40
