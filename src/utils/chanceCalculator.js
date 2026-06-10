/**
 * Classify eligibility chance based on user rank vs cutoff rank
 * Lower rank number = better (rank 1 is best)
 *
 * High Chance   : userRank <= cutoff * 0.80  (rank is 20%+ better than cutoff)
 * Moderate      : userRank <= cutoff          (rank within cutoff range)
 * Low Chance    : userRank <= cutoff * 1.20   (rank up to 20% above cutoff – borderline)
 * Ineligible    : userRank > cutoff * 1.20
 */
export function classifyChance(userRank, cutoff) {
  if (!cutoff || cutoff <= 0) return null
  if (userRank <= Math.floor(cutoff * 0.80)) return 'high'
  if (userRank <= cutoff)                    return 'moderate'
  if (userRank <= Math.ceil(cutoff * 1.20))  return 'low'
  return null
}

export const CHANCE_CONFIG = {
  high: {
    label: 'High Chance',
    sublabel: 'Safe Seat',
    badgeClass: 'badge-safe',
    bgClass: 'bg-safe-light dark:bg-green-900/20',
    borderClass: 'border-safe dark:border-green-700',
    textClass: 'text-safe-dark dark:text-green-300',
    dotClass: 'bg-safe',
    emoji: '✅',
    order: 0,
  },
  moderate: {
    label: 'Moderate Chance',
    sublabel: 'Within Range',
    badgeClass: 'badge-moderate',
    bgClass: 'bg-moderate-light dark:bg-amber-900/20',
    borderClass: 'border-moderate dark:border-amber-700',
    textClass: 'text-moderate-dark dark:text-amber-300',
    dotClass: 'bg-moderate',
    emoji: '⚡',
    order: 1,
  },
  low: {
    label: 'Low Chance',
    sublabel: 'Tough Seat',
    badgeClass: 'badge-tough',
    bgClass: 'bg-tough-light dark:bg-red-900/20',
    borderClass: 'border-tough dark:border-red-700',
    textClass: 'text-tough-dark dark:text-red-300',
    dotClass: 'bg-tough',
    emoji: '🎯',
    order: 2,
  },
}

/**
 * Given a list of rows with cutoff values, classify and group them
 */
export function groupByChance(results) {
  const groups = { high: [], moderate: [], low: [] }
  results.forEach(result => {
    const chance = classifyChance(result.userRank, result.cutoff)
    if (chance) groups[chance].push({ ...result, chance })
  })
  return groups
}
