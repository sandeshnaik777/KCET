import { CHANCE_CONFIG } from '../../utils/chanceCalculator'

export default function StatusBadge({ chance }) {
  const config = CHANCE_CONFIG[chance]
  if (!config) return null
  return (
    <span className={config.badgeClass}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  )
}
