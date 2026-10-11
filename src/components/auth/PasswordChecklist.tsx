import { passwordRules, passwordScore } from '../../utils/validation'

const levels = [
  { label: 'อ่อนมาก', color: 'progress-error' },
  { label: 'อ่อน', color: 'progress-error' },
  { label: 'พอใช้', color: 'progress-warning' },
  { label: 'ดี', color: 'progress-info' },
  { label: 'แข็งแรง', color: 'progress-success' },
]

/** แถบความแข็งแรง + เช็กลิสต์เงื่อนไขรหัสผ่าน */
export default function PasswordChecklist({ password }: { password: string }) {
  const score = passwordScore(password)
  const level = levels[score]

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <progress className={`progress ${level.color} h-1.5 flex-1`} value={score} max={passwordRules.length} />
        <span className="text-xs opacity-70 w-14 text-right">{password ? level.label : ''}</span>
      </div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {passwordRules.map((r) => {
          const ok = r.test(password)
          return (
            <li key={r.label} className={ok ? 'text-success' : 'opacity-60'}>
              {ok ? '✓' : '○'} {r.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
