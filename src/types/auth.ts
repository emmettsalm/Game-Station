/** ผู้ใช้ที่ล็อกอินอยู่ (ไม่มีรหัสผ่าน) */
export interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

/** ผู้ใช้ที่เก็บในฐานข้อมูลจำลอง (เก็บรหัสผ่านแบบ hash) */
export interface StoredUser extends User {
  passwordHash: string
}

export interface RegisterInput {
  username: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface LoginInput {
  identifier: string   // อีเมลหรือชื่อผู้ใช้
  password: string
}

/** error ของแต่ละช่องในฟอร์ม เช่น { email: 'รูปแบบอีเมลไม่ถูกต้อง' } */
export type FieldErrors<T> = Partial<Record<keyof T, string>>

export type AuthResult<T> =
  | { ok: true; requiresEmailConfirmation?: boolean; message?: string }
  | { ok: false; field?: keyof T; message: string }
