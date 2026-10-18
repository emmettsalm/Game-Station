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

/** ราคา PC จาก CheapShark แปลงเป็นเงินบาทด้วยอัตราแลกเปลี่ยนล่าสุด */
export type PriceInfo =
  | { type: 'free' }
  | { type: 'paid'; normal: number; sale: number; discount: number }

/** ราคาปัจจุบันของเกม 1 เกมใน 1 ร้านค้า */
export interface PriceOffer {
  id: string            // CheapShark dealID
  gameId: number
  storeId: string       // storeID ของ CheapShark เช่น "1" = Steam
  storeName: string
  storeIcon: string | null
  rateDate: string
  price: PriceInfo
}
