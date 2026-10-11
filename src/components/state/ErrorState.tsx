interface ErrorStateProps {
  message?: string
  onRetry: () => void
}

export default function ErrorState({ message = 'ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบอินเทอร์เน็ต', onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="text-6xl" aria-hidden>😵</span>
      <h2 className="text-xl font-bold">เกิดข้อผิดพลาด</h2>
      <p className="opacity-70 max-w-md">{message}</p>
      <button className="btn btn-primary" onClick={onRetry}>ลองใหม่อีกครั้ง</button>
    </div>
  )
}
