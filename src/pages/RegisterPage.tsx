import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import type { FieldErrors, RegisterInput } from '../types/auth'
import { hasErrors, validateRegister } from '../utils/validation'
import { useAuthStore } from '../store/useAuthStore'
import AuthCard from '../components/auth/AuthCard'
import FormField from '../components/auth/FormField'
import PasswordChecklist from '../components/auth/PasswordChecklist'

const initial: RegisterInput = { username: '', email: '', password: '', confirmPassword: '', acceptTerms: false }

export default function RegisterPage() {
  const user = useAuthStore((s) => s.user)
  const register = useAuthStore((s) => s.register)
  const navigate = useNavigate()

  const [values, setValues] = useState<RegisterInput>(initial)
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterInput, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<FieldErrors<RegisterInput>>({})
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  // ตรวจสอบทุกครั้งที่พิมพ์ แต่จะ "แสดง" error เมื่อออกจากช่องแล้ว หรือกดสมัครแล้ว
  const errors: FieldErrors<RegisterInput> = { ...validateRegister(values), ...serverErrors }
  const showError = (f: keyof RegisterInput) => (touched[f] || submitted ? errors[f] : undefined)

  const update = <K extends keyof RegisterInput>(field: K, value: RegisterInput[K]) => {
    setValues((v) => ({ ...v, [field]: value }))
    setFormError('')
    setConfirmationMessage('')
    setServerErrors({})   // แก้ข้อมูลแล้ว → ล้าง error จากการสมัครครั้งก่อน (เช่น อีเมลซ้ำ)
  }
  const blur = (f: keyof RegisterInput) => () => setTouched((t) => ({ ...t, [f]: true }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const clientErrors = validateRegister(values)
    if (hasErrors(clientErrors)) return

    setLoading(true)
    const result = await register(values)
    setLoading(false)

    if (result.ok) {
      if (result.requiresEmailConfirmation) setConfirmationMessage(result.message ?? 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ')
      else navigate('/', { replace: true })
    } else if (result.field) {
      setServerErrors({ [result.field]: result.message })
    } else {
      setFormError(result.message)
    }
  }

  return (
    <AuthCard title="สมัครสมาชิก" subtitle="สร้างบัญชีเพื่อบันทึกเกมที่คุณสนใจ">
      {confirmationMessage && <div role="status" className="alert alert-success alert-soft text-sm">{confirmationMessage}</div>}
      {formError && <div role="alert" className="alert alert-error alert-soft text-sm">{formError}</div>}
      <form onSubmit={onSubmit} noValidate className="space-y-1">
        <FormField
          label="ชื่อผู้ใช้"
          placeholder="เช่น pak_gamer"
          autoComplete="username"
          value={values.username}
          onChange={(e) => update('username', e.target.value)}
          onBlur={blur('username')}
          error={showError('username')}
        />
        <FormField
          label="อีเมล"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          value={values.email}
          onChange={(e) => update('email', e.target.value)}
          onBlur={blur('email')}
          error={showError('email')}
        />
        <FormField
          label="รหัสผ่าน"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => update('password', e.target.value)}
          onBlur={blur('password')}
          error={showError('password')}
          hint={<PasswordChecklist password={values.password} />}
        />
        <FormField
          label="ยืนยันรหัสผ่าน"
          type="password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          onBlur={blur('confirmPassword')}
          error={showError('confirmPassword')}
        />

        <div className="pt-2">
          <label className="label cursor-pointer gap-3 text-sm">
            <input
              type="checkbox"
              className={`checkbox checkbox-sm checkbox-primary ${showError('acceptTerms') ? 'checkbox-error' : ''}`}
              checked={values.acceptTerms}
              onChange={(e) => update('acceptTerms', e.target.checked)}
            />
            <span>ฉันยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</span>
          </label>
          {showError('acceptTerms') && <p className="text-error text-xs mt-1">{showError('acceptTerms')}</p>}
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-sm" />}
          {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
      </form>

      <p className="text-center text-sm">
        มีบัญชีอยู่แล้ว? <Link to="/login" className="link link-primary">เข้าสู่ระบบ</Link>
      </p>
    </AuthCard>
  )
}
