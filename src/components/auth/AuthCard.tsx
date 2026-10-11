import logo from '../../image/logo.png'
import type { ReactNode } from 'react'

/** กรอบของหน้า Login / Register */
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-8">
      <div className="card bg-base-200 w-full max-w-md shadow-xl">
        <div className="card-body gap-4">
          <div className="text-center space-y-1">
            <p className="flex items-center justify-center gap-2 text-2xl font-extrabold">
              <img src={logo} alt="" className="h-10 w-auto rounded-md" />
              <span>Game<span className="text-primary">Station</span></span>
            </p>
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-sm opacity-70">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
