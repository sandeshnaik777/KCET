export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <div key={i} className={`skeleton h-3 rounded ${i === lines - 2 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 4, lines = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="card">
      <div className="skeleton h-4 w-1/3 mb-4 rounded" />
      <div className="skeleton h-48 w-full rounded-xl" />
    </div>
  )
}
