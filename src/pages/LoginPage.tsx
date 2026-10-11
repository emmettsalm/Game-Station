import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import type { FieldErrors, LoginInput } from '../types/auth'
import { hasErrors, validateLogin } from '../utils/validation'
import { useAuthStore } from '../store/useAuthStore'
import { USE_SUPABASE } from '../api/backend'
import AuthCard from '../components/auth/AuthCard'
import FormField from '../components/auth/FormField'

/** รับเฉพาะ path ภายในเว็บ เช่น /library (กันการพาไปเว็บอื่น) */
const safeRedirect = (value: string | null): string =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : '/'

export default function LoginPage() {
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirectTo = safeRedirect(params.get('redirect'))

  const [values, setValues] = useState<LoginInput>({ identifier: '', password: '' })
  const [touched, setTouched] = useState<Partial<Record<keyof LoginInput, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={redirectTo} replace />

  const errors: FieldErrors<LoginInput> = validateLogin(values)
  const showError = (f: keyof LoginInput) => (touched[f] || submitted ? errors[f] : undefined)

  const update = (field: keyof LoginInput, value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    setFormError('')
  }
  const blur = (f: keyof LoginInput) => () => setTouched((t) => ({ ...t, [f]: true }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (hasErrors(validateLogin(values))) return

    setLoading(true)
    const result = await login(values)
    setLoading(false)

    if (result.ok) navigate(redirectTo, { replace: true })
    else setFormError(result.message)
  }

  return (
    <AuthCard title="เข้าสู่ระบบ" subtitle="ยินดีต้อนรับกลับมา!">
      {redirectTo !== '/' && (
        <div role="status" className="alert alert-info alert-soft text-sm">กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้</div>
      )}
      {formError && <div role="alert" className="alert alert-error alert-soft text-sm">{formError}</div>}

      <form onSubmit={onSubmit} noValidate className="space-y-1">
        <FormField
          label={USE_SUPABASE ? 'อีเมล' : 'อีเมลหรือชื่อผู้ใช้'}
          autoComplete="username"
          value={values.identifier}
          onChange={(e) => update('identifier', e.target.value)}
          onBlur={blur('identifier')}
          error={showError('identifier')}
        />
        <FormField
          label="รหัสผ่าน"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => update('password', e.target.value)}
          onBlur={blur('password')}
          error={showError('password')}
        />

        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading && <span className="loading loading-spinner loading-sm" />}
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <p className="text-center text-sm">
        ยังไม่มีบัญชี? <Link to="/register" className="link link-primary">สมัครสมาชิก</Link>
      </p>
    </AuthCard>
  )
}
