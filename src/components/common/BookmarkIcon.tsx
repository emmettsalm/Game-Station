interface BookmarkIconProps {
  filled?: boolean
  className?: string
}

/** ไอคอนบุ๊กมาร์ก — โปร่ง = ยังไม่บันทึก, ทึบ = บันทึกใน Library แล้ว */
export default function BookmarkIcon({ filled = false, className = 'w-4 h-4' }: BookmarkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" />
    </svg>
  )
}
