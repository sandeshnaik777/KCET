import { useState, useEffect, useRef } from 'react'
import { supabaseData, TABLES } from '../lib/supabase'


// Cache versioned to bust stale entries when fetch logic changes
const CACHE_VER = 'v4'
const cache = {}

/**
 * Paginated fetch — batches of 1000 rows to bypass Supabase max_rows server limit.
 * Returns all rows from the table or throws on Supabase error.
 */
async function fetchAllPaginated(tableName, selectCols, filters = {}) {
  const PAGE_SIZE = 1000
  let offset = 0
  let allRows = []

  while (true) {
    let q = supabaseData
      .from(tableName)
      .select(selectCols)
      .range(offset, offset + PAGE_SIZE - 1)


    for (const [col, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== '') {
        q = q.eq(col, val)
      }
    }

    const { data, error } = await q

    if (error) {
      // Surface the error so the hook can set error state
      throw new Error(`Supabase error on ${tableName}: ${error.message}`)
    }

    if (!data || data.length === 0) break
    allRows = allRows.concat(data)
    if (data.length < PAGE_SIZE) break   // last page
    offset += PAGE_SIZE
  }

  return allRows
}

/**
 * Generic Supabase query hook with in-memory caching + full pagination.
 *
 * @param {object}  opts
 * @param {number}  opts.year      - Data year (2021-2024)
 * @param {string}  opts.select    - Column list (default '*')
 * @param {object}  opts.filters   - Equality filters { col: value }
 * @param {string}  opts.cacheKey  - Override key (auto-generated if omitted)
 * @param {boolean} opts.enabled   - Set false to skip fetch (default true)
 */
export function useSupabaseQuery({
  year,
  select   = '*',
  filters  = {},
  cacheKey,
  enabled  = true,
}) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const mountedRef = useRef(true)

  const tableName = TABLES[year]
  const key = `${CACHE_VER}:${cacheKey ?? `${tableName}:${select}:${JSON.stringify(filters)}`}`

  useEffect(() => {
    mountedRef.current = true   // reset on each effect run

    if (!enabled || !tableName) return

    // Serve from cache instantly — no loading flash
    if (cache[key]) {
      setData(cache[key])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    const run = async () => {
      try {
        const rows = await fetchAllPaginated(tableName, select, filters)
        if (!mountedRef.current) return
        cache[key] = rows
        setData(rows)
      } catch (err) {
        if (!mountedRef.current) return
        console.error('[useSupabaseQuery]', err.message)
        setError(err.message)
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    run()

    return () => { mountedRef.current = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, tableName])

  return { data, loading, error }
}

/**
 * Full table scan — used by Predictor, Explorer, Branch Predictor.
 * Fetches ALL rows (paginated) for the given year.
 */
export function useFullTableQuery({ year, enabled = true }) {
  return useSupabaseQuery({
    year,
    select:   '*',
    cacheKey: `full:${year}`,
    enabled,
  })
}
