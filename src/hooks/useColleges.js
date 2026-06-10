import { useState, useEffect } from 'react'
import { supabaseData, TABLES } from '../lib/supabase'
import useAppStore from '../store/useAppStore'


/**
 * Fetches a deduplicated list of college names for a given year.
 * Uses Zustand cache to avoid redundant requests.
 * NOTE: The actual column for branch is "Branch" (not "BranchName").
 */
export function useColleges(year) {
  const { collegesCache, setCollegesCache } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const cached = collegesCache[year]

  useEffect(() => {
    if (cached || !year || !TABLES[year]) return

    setLoading(true)
    setError(null)

    const fetchColleges = async () => {
      try {
        const { data, error: sbError } = await supabaseData
          .from(TABLES[year])
          .select('CollegeName, CollegeCode')
          .order('CollegeName', { ascending: true })


        if (sbError) throw sbError

        // Deduplicate by CollegeCode (or CollegeName if no code)
        const seen = new Set()
        const unique = []
        for (const row of data || []) {
          const key = row.CollegeCode || row.CollegeName
          if (!seen.has(key)) {
            seen.add(key)
            unique.push({ name: row.CollegeName, code: row.CollegeCode })
          }
        }

        setCollegesCache(year, unique)
      } catch (err) {
        setError(err.message || 'Failed to fetch colleges')
      } finally {
        setLoading(false)
      }
    }

    fetchColleges()
  }, [year, cached])

  return { colleges: cached || [], loading, error }
}
