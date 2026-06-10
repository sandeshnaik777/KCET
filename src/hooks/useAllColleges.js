import { useState, useEffect } from 'react'
import { supabaseData, TABLES, YEARS } from '../lib/supabase'

// Module-level cache — set to null to force fresh fetch on next load
let cachedAllColleges = null
let fetchPromise      = null

/**
 * Paginated fetch: loops in batches of 1000 until all rows are returned.
 * Works around Supabase PostgREST server-side max_rows=1000 limit.
 */
async function fetchAllPaginated(tableName, columns) {
  const PAGE = 1000
  let from = 0
  let allRows = []
  while (true) {
    const { data, error } = await supabaseData
      .from(tableName)
      .select(columns)
      .range(from, from + PAGE - 1)
    if (error) throw error
    if (!data || data.length === 0) break
    allRows = allRows.concat(data)
    if (data.length < PAGE) break   // received last page
    from += PAGE
  }
  return allRows
}

/**
 * Fetches ALL unique colleges from ALL 4 years (2021-2024).
 * Paginates to bypass Supabase's default server max_rows=1000 limit.
 * Deduplicates by CollegeCode — the true unique identifier per KEA records.
 * Returns: [{ code, name, years: [2021, 2024, ...] }]
 */
export function useAllColleges() {
  const [colleges, setColleges] = useState(cachedAllColleges || [])
  const [loading,  setLoading]  = useState(!cachedAllColleges)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (cachedAllColleges) {
      setColleges(cachedAllColleges)
      setLoading(false)
      return
    }

    if (fetchPromise) {
      fetchPromise
        .then(data  => { setColleges(data); setLoading(false) })
        .catch(err  => { setError(err.message); setLoading(false) })
      return
    }

    setLoading(true)

    fetchPromise = (async () => {
      // Fetch ALL rows from all 4 tables — paginated to bypass server row limit
      const results = await Promise.all(
        YEARS.map(year => fetchAllPaginated(TABLES[year], 'CollegeName, CollegeCode'))
      )

      // Map: CollegeCode → { code, name, years[] }
      const byCode = {}

      YEARS.forEach((year, idx) => {
        const rows = results[idx] || []
        for (const row of rows) {
          const code = row.CollegeCode?.trim()
          const name = row.CollegeName?.trim()
          if (!code || !name) continue

          if (!byCode[code]) {
            byCode[code] = { code, name, years: [] }
          }
          // Most recent year's name wins (overwrite older entries)
          byCode[code].name = name
          if (!byCode[code].years.includes(year)) {
            byCode[code].years.push(year)
          }
        }
      })

      const sorted = Object.values(byCode).sort((a, b) =>
        a.name.localeCompare(b.name)
      )

      cachedAllColleges = sorted
      return sorted
    })()

    fetchPromise
      .then(data => { setColleges(data); setLoading(false) })
      .catch(err => {
        setError(err.message || 'Failed to load college list')
        setLoading(false)
        fetchPromise = null // allow retry
      })
  }, [])

  return { colleges, loading, error }
}

/**
 * Get branches for a specific college (by CollegeCode) in a given year.
 */
export function getBranchesForCollege(rows, collegeCode) {
  if (!rows || !collegeCode) return []
  const seen = new Set()
  const branches = []
  for (const row of rows) {
    if (row.CollegeCode === collegeCode && row.Branch) {
      if (!seen.has(row.Branch)) {
        seen.add(row.Branch)
        branches.push(row.Branch)
      }
    }
  }
  return branches.sort()
}
