interface PaginationProps {
  page: number
  hasNext: boolean
  onChange: (page: number) => void
}

export default function Pagination({ page, hasNext, onChange }: PaginationProps) {
  return (
    <div className="join flex justify-center">
      <button type="button" className="join-item btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>«</button>
      <span className="join-item btn btn-active pointer-events-none">หน้า {page}</span>
      <button type="button" className="join-item btn" disabled={!hasNext} onClick={() => onChange(page + 1)}>»</button>
    </div>
  )
}
