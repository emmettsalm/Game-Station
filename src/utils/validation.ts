import type { FieldErrors, LoginInput, RegisterInput } from '../types/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

/** กฎของรหัสผ่าน — ใช้ทั้งตรวจสอบและแสดงเช็กลิสต์ใต้ช่องรหัสผ่าน */
export const passwordRules: { label: string; test: (p: string) => boolean }[] = [
  { label: 'อย่างน้อย 8 ตัวอักษร', test: (p) => p.length >= 8 },
  { label: 'มีตัวพิมพ์ใหญ่ (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'มีตัวพิมพ์เล็ก (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: 'มีตัวเลข (0-9)', test: (p) => /\d/.test(p) },
]

/** คะแนนความแข็งแรงของรหัสผ่าน 0–4 */
export const passwordScore = (p: string): number => passwordRules.filter((r) => r.test(p)).length

export function validateRegister(v: RegisterInput): FieldErrors<RegisterInput> {
  const e: FieldErrors<RegisterInput> = {}

  if (!v.username.trim()) e.username = 'กรุณากรอกชื่อผู้ใช้'
  else if (!USERNAME_RE.test(v.username)) e.username = 'ชื่อผู้ใช้ต้องยาว 3–20 ตัว ใช้ได้เฉพาะ a-z, 0-9 และ _'

  if (!v.email.trim()) e.email = 'กรุณากรอกอีเมล'
  else if (!EMAIL_RE.test(v.email.trim())) e.email = 'รูปแบบอีเมลไม่ถูกต้อง เช่น name@example.com'

  if (!v.password) e.password = 'กรุณากรอกรหัสผ่าน'
  else if (passwordScore(v.password) < passwordRules.length) e.password = 'รหัสผ่านยังไม่ตรงตามเงื่อนไขด้านล่าง'

  if (!v.confirmPassword) e.confirmPassword = 'กรุณายืนยันรหัสผ่าน'
  else if (v.confirmPassword !== v.password) e.confirmPassword = 'รหัสผ่านไม่ตรงกัน'

  if (!v.acceptTerms) e.acceptTerms = 'กรุณายอมรับเงื่อนไขการใช้งาน'

  return e
}

export function validateLogin(v: LoginInput): FieldErrors<LoginInput> {
  const e: FieldErrors<LoginInput> = {}
  if (!v.identifier.trim()) e.identifier = 'กรุณากรอกอีเมลหรือชื่อผู้ใช้'
  if (!v.password) e.password = 'กรุณากรอกรหัสผ่าน'
  return e
}

export const hasErrors = <T,>(errors: FieldErrors<T>): boolean => Object.keys(errors).length > 0
