import { useEffect, useState } from 'react'

type Theme = 'night' | 'light'

const MoonIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={`w-7 h-7 ${className}`} aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

const SunIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={`w-7 h-7 ${className}`} aria-hidden="true">
    <circle cx="12" cy="12" r="4.5" fill="currentColor" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

/**
 * ปุ่มสลับธีมมืด/สว่าง ลอยมุมขวาล่าง — ใช้ DaisyUI "swap swap-rotate" ไอคอนหมุนตอนสลับ
 * TODO(เพื่อน): ถ้าอยากโชว์ Client State เพิ่ม ย้ายค่า theme ไปเก็บใน Zustand + persist
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('night')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const isDark = theme === 'night'

  return (
    <label
      title={isDark ? 'ธีมสว่าง' : 'ธีมมืด'}
      className={`swap swap-rotate fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl cursor-pointer
                  hover:scale-110 transition-transform
                  ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
    >
      <input
        type="checkbox"
        checked={!isDark}
        onChange={() => setTheme(isDark ? 'light' : 'night')}
        aria-label={isDark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
      />
      {/* ติ๊กแล้ว (ธีมสว่าง) = พระอาทิตย์, ไม่ติ๊ก (ธีมมืด) = พระจันทร์ */}
      <SunIcon className="swap-on" />
      <MoonIcon className="swap-off" />
    </label>
  )
}
