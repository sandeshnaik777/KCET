import { useState, useMemo } from 'react'
import { BookOpen, Search, MapPin, Calendar } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import RankInput from '../components/shared/RankInput'
import CategorySelect from '../components/shared/CategorySelect'
import YearSelect from '../components/shared/YearSelect'
import RoundSelect from '../components/shared/RoundSelect'
import FallbackBadge from '../components/ui/FallbackBadge'
import { SkeletonList } from '../components/ui/SkeletonCard'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { usePrediction } from '../hooks/usePrediction'
import { useAllColleges, getBranchesForCollege } from '../hooks/useAllColleges'
import { useFullTableQuery } from '../hooks/useSupabaseQuery'
import { CHANCE_CONFIG } from '../utils/chanceCalculator'

const CHANCE_CHIP = {
  high:     'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
  moderate: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  low:      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
}
const CHANCE_LABELS = { high: '✅ High Chance', moderate: '⚡ Moderate', low: '🎯 Tough' }
const BORDER_COLORS = { high: 'border-l-green-500', moderate: 'border-l-amber-500', low: 'border-l-red-500' }

export default function BranchPredictor() {
  const [rank,           setRank]           = useState('')
  const [category,       setCategory]       = useState('General (GM)')
  const [year,           setYear]           = useState(2024)
  const [round,          setRound]          = useState('First Round')
  const [selectedCode,   setSelectedCode]   = useState('')   // CollegeCode (unique ID)
  const [selectedName,   setSelectedName]   = useState('')   // display name
  const [collegeQuery,   setCollegeQuery]   = useState('')
  const [showDropdown,   setShowDropdown]   = useState(false)
  const [submitted,      setSubmitted]      = useState(false)

  // All colleges across all years (deduped by CollegeCode)
  const { colleges: allColleges, loading: collegesLoading } = useAllColleges()

  // Full table for the selected year (to get branches)
  const { data: yearRows } = useFullTableQuery({ year })

  const filteredColleges = useMemo(() =>
    allColleges.filter(c =>
      c.name?.toLowerCase().includes(collegeQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(collegeQuery.toLowerCase())
    ).slice(0, 20),
    [allColleges, collegeQuery]
  )

  // Branches for selected college + year
  const availableBranches = useMemo(() =>
    getBranchesForCollege(yearRows, selectedCode),
    [yearRows, selectedCode]
  )

  const isValid = rank && parseInt(rank) > 0 && parseInt(rank) <= 200000 && selectedCode

  const { results, totalResults, loading, error } = usePrediction({
    rank, category, year, round,
    collegeCode: selectedCode,
    enabled: submitted && !!isValid,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid) return
    setSubmitted(true)
  }

  const selectCollege = (college) => {
    setSelectedCode(college.code)
    setSelectedName(college.name)
    setCollegeQuery(college.name)
    setShowDropdown(false)
    setSubmitted(false)
  }

  const clearCollege = () => {
    setSelectedCode('')
    setSelectedName('')
    setCollegeQuery('')
    setSubmitted(false)
  }

  const allResults = results
    ? [...(results.high || []), ...(results.moderate || []), ...(results.low || [])]
        .sort((a, b) => CHANCE_CONFIG[a.chance].order - CHANCE_CONFIG[b.chance].order)
    : []

  // Find the selected college object for year badges
  const selectedCollege = allColleges.find(c => c.code === selectedCode)

  return (
    <div>
      <Topbar title="Branch Predictor" subtitle="See all eligible branches in a specific college" />
      <div className="page-inner">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Left: Input */}
          <div className="md:w-72 flex-shrink-0">
            <form onSubmit={handleSubmit} className="card space-y-4" id="branch-predictor-form">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Your Details</h2>

              <RankInput value={rank} onChange={setRank} id="branch-rank" />

              {/* College search — all years */}
              <div>
                <label className="label">Select College</label>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                  {collegesLoading ? 'Loading colleges from all years…' : `${allColleges.length} colleges across 2021–2024`}
                </p>
                <div className="relative">
                  <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                  <input
                    id="branch-college-search"
                    type="text"
                    placeholder="Search by name or code…"
                    value={collegeQuery}
                    onChange={(e) => {
                      setCollegeQuery(e.target.value)
                      setShowDropdown(true)
                      if (e.target.value !== selectedName) clearCollege()
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="input-field pl-9"
                    autoComplete="off"
                  />
                </div>

                {showDropdown && collegeQuery && !selectedCode && (
                  <div className="mt-1 rounded-xl border border-slate-200 dark:border-navy-600 bg-white dark:bg-navy-800 shadow-lg overflow-hidden max-h-52 overflow-y-auto scrollbar-none">
                    {collegesLoading ? (
                      <div className="p-3 text-xs text-center text-slate-400">Loading all colleges…</div>
                    ) : filteredColleges.length === 0 ? (
                      <div className="p-3 text-xs text-center text-slate-400">No colleges found</div>
                    ) : (
                      filteredColleges.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          className="w-full text-left px-3 py-2.5 hover:bg-brand-50 dark:hover:bg-navy-700 border-b border-slate-100 dark:border-navy-700 last:border-0 transition-colors"
                          onClick={() => selectCollege(c)}
                          id={`college-opt-${c.code}`}
                        >
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{c.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{c.code}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              · {c.years.sort().join(', ')}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {selectedCode && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 truncate">{selectedName}</p>
                      <p className="text-[10px] font-mono text-brand-500 dark:text-brand-400">{selectedCode}</p>
                    </div>
                    <button type="button" onClick={clearCollege} className="text-brand-400 hover:text-brand-600 text-xs flex-shrink-0">✕</button>
                  </div>
                )}
              </div>

              {/* If college selected, show available branches for this year */}
              {selectedCode && availableBranches.length > 0 && (
                <div>
                  <label className="label">Branches in {year}</label>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {availableBranches.length} branch{availableBranches.length !== 1 ? 'es' : ''} available
                  </p>
                </div>
              )}

              <CategorySelect value={category} onChange={setCategory} id="branch-category" />
              <div className="grid grid-cols-2 gap-3">
                <YearSelect value={year} onChange={(y) => { setYear(y); setSubmitted(false) }} id="branch-year" />
                <RoundSelect value={round} onChange={setRound} id="branch-round" />
              </div>

              <button type="submit" className="btn-primary w-full" id="branch-submit" disabled={!isValid || loading}>
                <BookOpen size={15} />
                {loading ? 'Loading…' : 'Show Eligible Branches'}
              </button>
            </form>
          </div>

          {/* Right: Results */}
          <div className="flex-1 min-w-0">
            {!submitted && (
              <div className="card flex flex-col items-center justify-center py-16 text-center border-dashed border-2">
                <BookOpen size={28} className="text-slate-300 dark:text-navy-500 mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Select a college to see eligible branches</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Colleges are loaded from 2021–2024 data</p>
              </div>
            )}

            {submitted && (
              <>
                {loading && <SkeletonList count={4} />}
                {error && <ErrorState message={error} />}
                {!loading && !error && (
                  <>
                    {selectedName && (
                      <div className="card mb-4 flex items-center gap-3 py-3">
                        <div className="w-10 h-10 rounded-xl bg-navy-100 dark:bg-navy-700 flex items-center justify-center flex-shrink-0">
                          <BookOpen size={18} className="text-navy-600 dark:text-navy-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate">{selectedName}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono bg-slate-100 dark:bg-navy-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">{selectedCode}</span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                              <MapPin size={9} /> Karnataka
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                              <Calendar size={9} /> {year}
                            </span>
                          </div>
                        </div>
                        <div className="ml-auto text-right flex-shrink-0">
                          <p className="text-lg font-black text-slate-800 dark:text-white">{totalResults}</p>
                          <p className="text-xs text-slate-400">eligible</p>
                        </div>
                      </div>
                    )}

                    {totalResults === 0 ? (
                      availableBranches.length === 0 ? (
                        <EmptyState
                          title={`College not in ${year} data`}
                          description={`This college (${selectedCode}) has no data for ${year}. Try a different year.`}
                        />
                      ) : (
                        <EmptyState
                          title="No eligible branches"
                          description="Your rank doesn't match any branch cutoffs. Try a different round or category."
                        />
                      )
                    ) : (
                      <div className="space-y-3">
                        {allResults.map((item, idx) => (
                          <div
                            key={`${item.id}-${idx}`}
                            className={`card border-l-4 ${BORDER_COLORS[item.chance]} animate-slide-up`}
                            style={{ animationDelay: `${idx * 40}ms` }}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{item.branchName}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-slate-400">Cutoff Rank:</span>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                                    {item.cutoff.toLocaleString('en-IN')}
                                  </span>
                                </div>
                                {item.usedGM && <div className="mt-1.5"><FallbackBadge /></div>}
                              </div>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${CHANCE_CHIP[item.chance]}`}>
                                {CHANCE_LABELS[item.chance]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
