import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuthStore } from '../../store/useAuthStore'

/** หน้าที่ต้องล็อกอินก่อน — ถ้ายังไม่ล็อกอินจะพาไปหน้า Login แล้วกลับมาหน้าเดิม */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  return <>{children}</>
}
