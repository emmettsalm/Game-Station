import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * แพลตฟอร์ม/ราคาที่ผู้ใช้เลือกไว้ของแต่ละเกมใน Library (Client State)
 * เก็บ storeID ที่ผู้ใช้เลือก: { [userId]: { [gameId]: storeId } }
 */
interface OfferState {
  selected: Record<string, Record<string, string>>
  setOffer: (userId: string, gameId: number, storeId: string) => void
  removeOffer: (userId: string, gameId: number) => void
  clearOffers: (userId: string) => void
}

export const useOfferStore = create<OfferState>()(
  persist(
    (set) => ({
      selected: {},
      setOffer: (userId, gameId, storeId) =>
        set((s) => ({ selected: { ...s.selected, [userId]: { ...s.selected[userId], [gameId]: storeId } } })),
      removeOffer: (userId, gameId) =>
        set((s) => {
          const mine = { ...s.selected[userId] }
          delete mine[gameId]
          return { selected: { ...s.selected, [userId]: mine } }
        }),
      clearOffers: (userId) => set((s) => ({ selected: { ...s.selected, [userId]: {} } })),
    }),
    { name: 'gamestation-offers' },
  ),
)
