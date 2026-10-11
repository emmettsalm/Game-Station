/**
 * ฐานข้อมูลผู้ใช้จำลองใน LocalStorage (แทน Backend จริง)
 * ⚠️ ใช้สำหรับเดโมเท่านั้น — ระบบจริงต้องตรวจรหัสผ่านที่ฝั่ง Server
 */
import type { StoredUser } from '../types/auth'

const KEY = 'gamestation-users'

export function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as StoredUser[]) : []
  } catch {
    return []
  }
}

export function saveUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(users))
  } catch {
    // เบราว์เซอร์ไม่อนุญาตให้บันทึก (เช่นโหมดส่วนตัว) — ข้ามไป
  }
}

/** จำลองความหน่วงของเครือข่าย เพื่อให้เห็นสถานะ loading */
export const fakeDelay = (ms = 600) => new Promise<void>((resolve) => setTimeout(resolve, ms))
