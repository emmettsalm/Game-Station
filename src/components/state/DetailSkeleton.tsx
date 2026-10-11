export default function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton h-64 md:h-96 w-full" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          <div className="skeleton h-6 w-1/3" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-48 w-full mt-6" />
        </div>
        <div className="skeleton h-80 w-full" />
      </div>
    </div>
  )
}
