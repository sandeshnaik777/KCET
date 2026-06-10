import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, GraduationCap, MapPin, ChevronDownIcon } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import CategorySelect from '../components/shared/CategorySelect'
import YearSelect from '../components/shared/YearSelect'
import { SkeletonList } from '../components/ui/SkeletonCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import FallbackBadge from '../components/ui/FallbackBadge'
import { useFullTableQuery } from '../hooks/useSupabaseQuery'
import { useAllColleges } from '../hooks/useAllColleges'
import { buildAllRoundColumns, parseCutoff } from '../utils/columnBuilder'
import { CATEGORY_MAP } from '../utils/categoryMap'
import { useAuth } from '../contexts/AuthContext'

const ROUND_SHORT = {
  'Mock':                  'Mock',
  'First Round':           '1st Round',
  'Second Round':          '2nd Round',
  'Second Extended Round': 'Extended',
}

function RoundCutoffRow({ label, value, prevValue, usedGM }) {
  const diff  = prevValue !== null && value !== null ? value - prevValue : null
  const isUp  = diff !== null && diff > 0
  const isDn  = diff !== null && diff < 0
  const color = isUp ? 'text-red-500' : isDn ? 'text-green-500' : 'text-slate-400'

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-navy-700 last:border-0">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-24 flex-shrink-0">{label}</span>
      {value !== null ? (
        <div className="flex items-center gap-3 ml-auto">
          {diff !== null && (
            <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${color}`}>
              {isUp   ? <TrendingUp  size={10} /> :
               isDn   ? <TrendingDown size={10} /> :
                        <Minus size={10} />}
              {diff !== 0 ? Math.abs(diff).toLocaleString('en-IN') : 'Same'}
            </span>
          )}
          <span className="text-sm font-bold text-slate-800 dark:text-white tabular-nums">
            {value.toLocaleString('en-IN')}
          </span>
          {usedGM && <span className="text-[10px] font-medium text-purple-500 dark:text-purple-400">GM</span>}
        </div>
      ) : (
        <span className="text-sm text-slate-300 dark:text-navy-600 ml-auto">—</span>
      )}
    </div>
  )
}

function BranchAccordion({ branch, roundData }) {
  const [open, setOpen] = useState(false)
  const availCount = roundData.filter(r => r.value !== null).length
  const bestCutoff = Math.min(...roundData.filter(r => r.value !== null).map(r => r.value))

  return (
    <div className="border border-slate-100 dark:border-navy-700 rounded-xl overflow-hidden mb-2 bg-white dark:bg-navy-800">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-navy-700/50 transition-colors"
        onClick={() => setOpen(o => !o)}
        id={`accordion-${branch.replace(/\s+/g, '-').slice(0, 30)}`}
      >
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{branch}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {availCount > 0
                ? `${availCount} round${availCount !== 1 ? 's' : ''} of data`
                : 'No cutoff for this category'}
            </p>
            {availCount > 0 && isFinite(bestCutoff) && (
              <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">
                Best: {bestCutoff.toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={15} className="text-slate-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-2 border-t border-slate-100 dark:border-navy-700 animate-slide-up">
          {roundData.map((rd, idx) => (
            <RoundCutoffRow
              key={rd.round}
              label={ROUND_SHORT[rd.round] || rd.round}
              value={rd.value}
              prevValue={idx > 0 ? roundData[idx - 1].value : null}
              usedGM={rd.usedGM}
            />
          ))}
          {roundData.some(rd => rd.usedGM) && (
            <div className="py-2"><FallbackBadge /></div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Explorer() {
  const [year,         setYear]         = useState(2024)
  const [category,     setCategory]     = useState('General (GM)')
  const [selectedCode, setSelectedCode] = useState('')   // '' = all colleges
  const [branchFilter, setBranchFilter] = useState('')

  const { trackCollegeView, spendCredit, user } = useAuth()

  // Charge 3 credits once when page first successfully loads data
  const hasChargedInitial = useRef(false)

  // All unique colleges across all 4 years (deduped by CollegeCode)
  const { colleges: allColleges, loading: collegesLoading } = useAllColleges()

  // Row data for selected year
  const { data: rows, loading, error } = useFullTableQuery({ year })

  // ── Initial load charge: 3 credits when data first appears ───────────────
  useEffect(() => {
    if (!user) return                            // guests: free
    if (hasChargedInitial.current) return        // already charged this visit
    if (loading || collegesLoading || error) return  // still loading
    // Data is ready — charge 3 credits for accessing the Cutoffs section
    hasChargedInitial.current = true
    spendCredit(3)
  }, [loading, collegesLoading, error, user, spendCredit])

  // Colleges that exist in the selected year (filter the master list)
  const yearColleges = useMemo(() =>
    allColleges.filter(c => c.years.includes(year))
  , [allColleges, year])

  const roundCols = useMemo(() => buildAllRoundColumns(category), [category])
  const isGM = CATEGORY_MAP[category] === 'GM'

  // Build college → branches map, filtered by selection
  const processedData = useMemo(() => {
    if (!rows) return {}

    const byCode = {}    // key = CollegeCode (reliable unique key)

    for (const row of rows) {
      const code = row.CollegeCode
      const name = row.CollegeName
      const branch = row.Branch
      if (!code || !name || !branch) continue

      // Filter by selected college code
      if (selectedCode && code !== selectedCode) continue

      // Filter by branch text
      if (branchFilter && !branch.toLowerCase().includes(branchFilter.toLowerCase())) continue

      if (!byCode[code]) byCode[code] = { code, name, branches: {} }

      const roundData = roundCols.map(({ round, column, gmColumn }) => {
        let value  = parseCutoff(row[column])
        let usedGM = false
        if (value === null && !isGM) {
          const gmVal = parseCutoff(row[gmColumn])
          if (gmVal !== null) { value = gmVal; usedGM = true }
        }
        return { round, value, usedGM }
      })

      byCode[code].branches[branch] = roundData
    }
    return byCode
  }, [rows, selectedCode, branchFilter, roundCols, isGM])

  // Sort by college name
  const collegeEntries = Object.values(processedData).sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <div>
      <Topbar title="College Cutoffs" subtitle="Select a college and view complete cutoff history across all rounds." />
      <div className="page-inner">
        {/* Filters */}
        <div className="card mb-5" id="explorer-filters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* College SELECT (not search) */}
            <div>
              <label className="label">
                Select College
                {!collegesLoading && (
                  <span className="text-slate-400 font-normal ml-1">
                    ({yearColleges.length} colleges in {year})
                  </span>
                )}
              </label>
              <div className="relative">
                <select
                  id="explorer-college-select"
                  value={selectedCode}
                  onChange={async (e) => {
                    const newCode = e.target.value
                    if (user) {
                      // Logged-in: spend 2 credits per college change
                      if (newCode) {
                        const ok = await spendCredit(2)
                        if (!ok) return   // zero credits — modal shown by spendCredit
                      }
                      setSelectedCode(newCode)
                    } else {
                      // Guest: track free views
                      const allowed = trackCollegeView()
                      if (allowed) setSelectedCode(newCode)
                    }
                  }}
                  className="input-field pr-10 appearance-none"
                  disabled={collegesLoading || loading}
                >
                  <option value="">— All Colleges —</option>
                  {yearColleges.map(c => (
                    <option key={c.code} value={c.code}>
                      [{c.code}] {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Branch text filter */}
            <div>
              <label className="label">Filter by Branch</label>
              <input
                id="explorer-branch-filter"
                type="text"
                placeholder="e.g. CSE, AI, Civil, Mech…"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <YearSelect
              value={year}
              onChange={async (y) => {
                if (user) {
                  // Logged-in: year change costs 2 credits
                  const ok = await spendCredit(2)
                  if (!ok) return
                }
                setYear(y)
                setSelectedCode('')
              }}
              id="explorer-year"
            />
            <CategorySelect value={category} onChange={setCategory} id="explorer-category" />
          </div>
        </div>

        {(loading || collegesLoading) && <SkeletonList count={4} />}
        {error && <ErrorState message={`Unable to load ${year} data. ${error}`} />}

        {!loading && !collegesLoading && !error && (
          <>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 font-medium">
              {selectedCode
                ? `Showing cutoff data for selected college · ${year}`
                : `${collegeEntries.length} College${collegeEntries.length !== 1 ? 's' : ''} · ${year}`}
            </p>

            {collegeEntries.length === 0 ? (
              <EmptyState
                title="No data found"
                description={
                  selectedCode
                    ? `This college has no data for ${year}. Try selecting a different year.`
                    : "Try adjusting your filters."
                }
              />
            ) : (
              collegeEntries.map(({ code, name, branches }) => {
                const branchNames = Object.keys(branches).sort()
                if (branchNames.length === 0) return null

                return (
                  <div key={code} className="mb-6 animate-fade-in">
                    {/* College Header */}
                    <div className="card mb-2 flex items-center gap-3 py-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-700 flex items-center justify-center flex-shrink-0">
                        <GraduationCap size={18} className="text-slate-500 dark:text-slate-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{name}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[11px] font-mono bg-slate-100 dark:bg-navy-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                            {code}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                            <MapPin size={9} /> Karnataka
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{branchNames.length}</p>
                        <p className="text-[11px] text-slate-400">branches</p>
                      </div>
                    </div>

                    {/* Section header */}
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <div className="w-1 h-5 bg-brand-600 rounded-full" />
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Complete Cutoff History</p>
                      <div className="flex-1" />
                      <span className="text-xs text-slate-400 dark:text-slate-500">{category}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">· {year}</span>
                    </div>

                    {branchNames.map(branchName => (
                      <BranchAccordion
                        key={branchName}
                        branch={branchName}
                        roundData={branches[branchName]}
                      />
                    ))}
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )
}
