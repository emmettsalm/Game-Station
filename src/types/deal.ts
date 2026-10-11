/** ดีลโปรโมชัน (ข้อมูล mock ของเราเอง ราคาเป็นเงินบาท) */
export interface Deal {
  id: string
  gameId: number          // ใช้ลิงก์ไปหน้า /game/:id
  title: string
  image: string | null
  normalPrice: number     // ราคาเต็ม (บาท)
  salePrice: number       // ราคาหลังลด (บาท)
  discount: number        // ส่วนลด % เช่น 40
  ratingText: string
  ratingPercent: number   // 0–100
  endsAt: string          // วันหมดโปร (ISO)
}
