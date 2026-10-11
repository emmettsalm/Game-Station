import EmptyState from '../components/state/EmptyState'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <EmptyState
        icon="👾"
        title="404 · ไม่พบหน้านี้"
        description="หน้าที่คุณหาอาจถูกย้ายหรือไม่มีอยู่"
        actionLabel="กลับหน้าแรก"
        actionTo="/"
      />
    </div>
  )
}
