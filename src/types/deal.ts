/** ดีลโปรโมชันจาก CheapShark สำหรับเกมที่มีข้อมูลใน RAWG */
export interface Deal {
  id: string
  gameId: number          // ใช้ลิงก์ไปหน้า /game/:id
  title: string
  image: string | null
  normalPrice: number     // THB
  salePrice: number       // THB
  discount: number        // ส่วนลด % เช่น 40
  ratingText: string
  ratingPercent: number   // 0–100
}
