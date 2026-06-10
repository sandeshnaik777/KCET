import { useMemo } from 'react'
import { useFullTableQuery } from './useSupabaseQuery'
import { buildColumn, buildGMColumn, parseCutoff } from '../utils/columnBuilder'
import { groupByChance } from '../utils/chanceCalculator'
import { CATEGORY_MAP } from '../utils/categoryMap'

/**
 * Core prediction hook.
 * Fetches all rows for the selected year and classifies eligibility.
 * Supports filtering by CollegeCode (unique identifier) or CollegeName.
 */
export function usePrediction({ rank, category, year, round, branchFilter, collegeName, collegeCode, enabled = true }) {
  const { data: rows, loading, error } = useFullTableQuery({ year, enabled })

  const results = useMemo(() => {
    if (!rows || !rank || !category || !round) return null

    const userRank = parseInt(rank, 10)
    if (isNaN(userRank) || userRank <= 0) return null

    const catColumn  = buildColumn(round, category)
    const gmColumn   = buildGMColumn(round)
    const isGMCategory = CATEGORY_MAP[category] === 'GM'

    const processed = []

    for (const row of rows) {
      if (!row.CollegeName || !row.Branch) continue

      // Filter by CollegeCode first (most reliable), fallback to name
      if (collegeCode && row.CollegeCode !== collegeCode) continue
      if (!collegeCode && collegeName && row.CollegeName !== collegeName) continue

      // Optional branch keyword filter
      if (branchFilter && !row.Branch.toLowerCase().includes(branchFilter.toLowerCase())) continue

      let cutoff  = parseCutoff(row[catColumn])
      let usedGM  = false

      if (cutoff === null && !isGMCategory) {
        const gmVal = parseCutoff(row[gmColumn])
        if (gmVal !== null) { cutoff = gmVal; usedGM = true }
      }

      if (cutoff === null) continue

      processed.push({
        id:          `${row.CollegeCode}-${row.Branch}`,
        collegeName: row.CollegeName,
        collegeCode: row.CollegeCode,
        branchName:  row.Branch,
        cutoff,
        usedGM,
        userRank,
      })
    }

    return groupByChance(processed)
  }, [rows, rank, category, year, round, branchFilter, collegeName, collegeCode])

  const totalResults = results
    ? (results.high?.length || 0) + (results.moderate?.length || 0) + (results.low?.length || 0)
    : 0

  return { results, totalResults, loading, error }
}
