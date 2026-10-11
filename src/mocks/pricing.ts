import type { PriceInfo } from '../types/game'

export const SALE_ENDS_AT =
  '2026-10-31T23:59:59+07:00'

const normalPrices = [299,399,499,590,790,990,1290,1590]

const discounts = [20,30,40,50,60,70,75]

export function getGamePrice(
  gameId: number,
): PriceInfo {
  const seed = Math.abs(gameId)

  // บางเกมเป็นเกมฟรี
  if (seed % 13 === 0) {
    return {
      type: 'free',
    }
  }

  const normal =
    normalPrices[
      seed % normalPrices.length
    ]

  // ประมาณ 2 ใน 3 หรือ 66% ของเกมที่มีราคา
  // จะได้รับส่วนลด
  const discount =
    seed % 3 === 0
      ? 0
      : discounts[
          seed % discounts.length
        ]

  return {
    type: 'paid',
    normal,
    discount,
  }
}

export function getDealForGame(
  gameId: number,
) {
  const price = getGamePrice(gameId)

  if (
    price.type !== 'paid' ||
    price.discount <= 0
  ) {
    return undefined
  }

  return {
    normalPrice: price.normal,
    salePrice: Math.round(
      price.normal *
        (1 - price.discount / 100),
    ),
    discount: price.discount,
    endsAt: SALE_ENDS_AT,
  }
}