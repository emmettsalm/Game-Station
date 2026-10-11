import { useEffect, useState } from 'react'

export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  isOver: boolean
}

/** นับถอยหลังไปยังเวลาเป้าหมาย อัปเดตทุก 1 วินาที */
export function useCountdown(targetIso: string): CountdownParts {
  const target = new Date(targetIso).getTime()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)   // ล้าง timer เมื่อออกจากหน้า
  }, [])

  const diff = Math.max(0, target - now)
  const totalSeconds = Math.floor(diff / 1000)

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isOver: diff === 0,
  }
}
