export default function GameCardSkeleton() {
  return (
    <div className="card bg-base-200" aria-busy="true">
      <div className="skeleton h-44 w-full rounded-b-none" />
      <div className="card-body p-4 gap-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  )
}
