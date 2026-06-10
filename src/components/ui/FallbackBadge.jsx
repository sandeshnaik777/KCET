import { Info } from 'lucide-react'

export default function FallbackBadge() {
  return (
    <span className="badge-fallback">
      <Info size={10} />
      General Rank Considered (No Category Seats Available)
    </span>
  )
}
