import { useState } from 'react'

/**
 * Library ชั่วคราว (ไม่ persist) ใช้ทดสอบปุ่ม ♥ ระหว่างพัฒนา UI
 * TODO(เพื่อน): แทนด้วย useLibraryStore (Zustand + persist)
 */
export function useMockLibrary(initial: number[] = []) {
  const [wishlist, setWishlist] = useState<number[]>(initial)
  const toggleWishlist = (id: number) =>
    setWishlist((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const clearWishlist = () => setWishlist([])
  return { wishlist, toggleWishlist, clearWishlist }
}
