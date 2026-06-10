import { CATEGORY_MAP, ROUND_MAP, GM_SUFFIX } from './categoryMap'

/**
 * Build the Supabase column name for a given round + category combination
 * e.g. ('First Round', 'Category 2A') => 'FirstRound_2AG'
 */
export function buildColumn(round, category) {
  const roundPrefix = ROUND_MAP[round]
  const catSuffix   = CATEGORY_MAP[category]
  if (!roundPrefix || !catSuffix) return null
  return `${roundPrefix}_${catSuffix}`
}

/**
 * Build the GM (General Merit) fallback column for a given round
 * e.g. ('First Round') => 'FirstRound_GM'
 */
export function buildGMColumn(round) {
  const roundPrefix = ROUND_MAP[round]
  if (!roundPrefix) return null
  return `${roundPrefix}_${GM_SUFFIX}`
}

/**
 * Returns all column names for a specific category across all rounds
 * Used for the explorer to show cutoff flow
 */
export function buildAllRoundColumns(category) {
  return Object.entries(ROUND_MAP).map(([roundLabel, prefix]) => ({
    round: roundLabel,
    column: `${prefix}_${CATEGORY_MAP[category]}`,
    gmColumn: `${prefix}_${GM_SUFFIX}`,
  }))
}

/**
 * Get all columns needed for analytics (GM across all years)
 */
export function buildGMColumnsAllRounds() {
  return Object.entries(ROUND_MAP).map(([roundLabel, prefix]) => ({
    round: roundLabel,
    column: `${prefix}_${GM_SUFFIX}`,
  }))
}

/**
 * Parse a text cutoff value safely to integer.
 * Supabase stores all cutoff values as text — convert to int for comparison.
 */
export function parseCutoff(val) {
  if (val === null || val === undefined || val === '' || val === '0') return null
  const n = parseInt(val, 10)
  return isNaN(n) || n <= 0 ? null : n
}
