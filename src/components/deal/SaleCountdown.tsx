import type { CSSProperties } from 'react'
import { useCountdown } from '../../hooks/useCountdown'

/** ตัวเลขที่เปลี่ยนแบบเลื่อน (DaisyUI countdown) */
function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="countdown font-mono text-3xl md:text-4xl font-bold">
        <span
          style={{ '--value': value } as CSSProperties}
          aria-live="polite"
          aria-label={String(value)}
        >
          {value}
        </span>
      </span>
      <span className="text-xs md:text-sm opacity-70">{label}</span>
    </div>
  )
}

/** นับถอยหลังเวลาที่เหลือของโปรโมชัน */
export default function SaleCountdown({ endsAt }: { endsAt: string }) {
  const { days, hours, minutes, seconds, isOver } = useCountdown(endsAt)

  if (isOver) return <p className="font-bold text-error md:text-right">โปรโมชันสิ้นสุดแล้ว</p>

  return (
    <div className="space-y-1 md:text-right">
      <p className="text-sm opacity-70">โปรโมชันจะสิ้นสุดใน</p>
      <div className="flex flex-wrap items-baseline md:justify-end gap-x-3 md:gap-x-5 gap-y-2">
        <Unit value={days} label="days" />
        <Unit value={hours} label="hours" />
        <Unit value={minutes} label="minutes" />
        <Unit value={seconds} label="sec" />
      </div>
    </div>
  )
}
