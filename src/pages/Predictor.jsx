import { useState, useMemo } from 'react'
import { Sparkles, MapPin, Info, ChevronDown, ChevronUp, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
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
import { useFullTableQuery } from '../hooks/useSupabaseQuery'
import { CHANCE_CONFIG } from '../utils/chanceCalculator'
import useAppStore from '../store/useAppStore'
import { buildGMColumn, buildColumn } from '../utils/columnBuilder'
import { useAuth } from '../contexts/AuthContext'

const CHANCE_LABELS = {
  high:     { label: 'High Chance', icon: '✅', chipClass: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' },
  moderate: { label: 'Moderate Chance', icon: '⚡', chipClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' },
  low:      { label: 'Tough', icon: '⚠️', chipClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' },
}

function CutoffBar({ value, max, colorClass }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-navy-600 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums w-14 text-right">
        {value.toLocaleString('en-IN')}
      </span>
    </div>
  )
}

const ROUND_SHORT = {
  'Mock': 'Mock Cutoff',
  'First Round': 'R1 Cutoff',
  'Second Round': 'R2 Cutoff',
  'Second Extended Round': 'R2 Ext Cutoff'
}

function ResultCard({ item, round, category, maxCutoff }) {
  const cfg = CHANCE_CONFIG[item.chance]
  const chipCfg = CHANCE_LABELS[item.chance]

  const borderColor = item.chance === 'high' ? 'border-l-green-500' :
                      item.chance === 'moderate' ? 'border-l-amber-500' : 'border-l-red-500'
  const barColor    = item.chance === 'high' ? 'bg-green-500' :
                      item.chance === 'moderate' ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className={`card border-l-4 ${borderColor} animate-slide-up`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {item.collegeName}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{item.branchName}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <MapPin size={11} />
              Karnataka
            </span>
            {item.usedGM && (
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-navy-700 px-2 py-0.5 rounded-full border border-slate-200 dark:border-navy-600">
                <Info size={10} />
                General Rank Considered
              </span>
            )}
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${chipCfg.chipClass}`}>
          {chipCfg.icon} {chipCfg.label}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 dark:text-slate-500 w-20 flex-shrink-0">
            {ROUND_SHORT[round] || 'Cutoff'}
          </span>
          <CutoffBar value={item.cutoff} max={maxCutoff} colorClass={barColor} />
        </div>
      </div>

      {item.collegeCode && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-mono">{item.collegeCode}</p>
      )}
    </div>
  )
}


export default function Predictor() {
  const { lastRank, lastCategory, lastYear, lastRound, setLastInputs } = useAppStore()
  const { trackPrediction, spendCredit, user } = useAuth()

  const [rank,         setRank]         = useState(lastRank)
  const [category,     setCategory]     = useState(lastCategory || 'General (GM)')
  const [year,         setYear]         = useState(lastYear || 2024)
  const [round,        setRound]        = useState(lastRound || 'First Round')
  const [branchFilter, setBranchFilter] = useState('')
  const [submitted,    setSubmitted]    = useState(false)
  const [sortBy,       setSortBy]       = useState('cutoff') // 'chance' | 'cutoff'

  const isValid = rank && parseInt(rank) > 0 && parseInt(rank) <= 200000

  // Fetch all rows for the year to get available branches
  const { data: fullRows } = useFullTableQuery({ year })

  const availableBranches = useMemo(() => {
    if (!fullRows) return []
    const set = new Set()
    for (const r of fullRows) {
      if (r.Branch) set.add(r.Branch)
    }
    return Array.from(set).sort()
  }, [fullRows])

  const { results, totalResults, loading, error } = usePrediction({
    rank, category, year, round,
    branchFilter,
    enabled: submitted && !!isValid,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return

    if (user) {
      // Logged-in: costs 5 credits per prediction
      const ok = await spendCredit(5)
      if (!ok) return  // zero credits — modal shown by spendCredit
    } else {
      // Guest: free quota tracked in localStorage
      if (!trackPrediction()) return
    }

    setLastInputs({ lastRank: rank, lastCategory: category, lastYear: year, lastRound: round })
    setSubmitted(true)
  }

  // Compute max cutoff for bar scaling
  const allResults = results
    ? [...(results.high || []), ...(results.moderate || []), ...(results.low || [])]
    : []

  const maxCutoff = allResults.reduce((max, r) => Math.max(max, r.cutoff || 0), 0)

  const displayItems = sortBy === 'cutoff'
    ? [...allResults].sort((a, b) => a.cutoff - b.cutoff)
    : allResults

  return (
    <div>
      <Topbar title="College Predictor" subtitle="Enter your details to discover your chances of admission across top engineering colleges." />

      <div className="page-inner">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Left: Input Panel */}
          <div className="md:w-72 flex-shrink-0">
            <form onSubmit={handleSubmit} className="card space-y-4" id="predictor-form">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Your Details</h2>

              <RankInput value={rank} onChange={setRank} id="predictor-rank" />
              <CategorySelect value={category} onChange={setCategory} id="predictor-category" />

              {/* Branch quick filter */}
              <div>
                <label className="label">Preferred Course</label>
                <div className="relative mb-2">
                  <select
                    id="predictor-branch-filter"
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="input-field pr-10 appearance-none"
                  >
                    <option value="">— All Branches —</option>
                    {availableBranches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <YearSelect value={year} onChange={setYear} id="predictor-year" />
                <RoundSelect value={round} onChange={setRound} id="predictor-round" />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                id="predictor-submit"
                disabled={!isValid || loading}
              >
                <Sparkles size={15} />
                {loading ? 'Analyzing…' : 'Predict Colleges'}
              </button>
            </form>
          </div>

          {/* Right: Results */}
          <div className="flex-1 min-w-0">
            {!submitted && !loading && (
              <div className="card flex flex-col items-center justify-center py-16 text-center border-dashed border-2">
                <Sparkles size={32} className="text-brand-400 mb-3" />
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">Enter your details to see predictions</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Fill in the form and click Predict Colleges</p>
              </div>
            )}

            {submitted && (
              <>
                {/* Results Header */}
                {!loading && !error && results && (
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Showing results for{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Rank: {parseInt(rank).toLocaleString('en-IN')}</span>
                        {' · '}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Cat: {category}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {/* Chance summary chips */}
                      {['high', 'moderate', 'low'].map(k => results[k]?.length > 0 && (
                        <span key={k} className={`text-xs px-2 py-1 rounded-full font-semibold ${CHANCE_LABELS[k].chipClass}`}>
                          {results[k].length} {CHANCE_LABELS[k].label}
                        </span>
                      ))}
                    </div>
                    <button
                      className="btn-outline text-xs py-1.5"
                      onClick={() => setSortBy(s => s === 'chance' ? 'cutoff' : 'chance')}
                      id="sort-toggle"
                    >
                      <ArrowUpDown size={12} />
                      Sort: {sortBy === 'chance' ? 'Chance' : 'Cutoff'}
                    </button>
                  </div>
                )}

                {loading && <SkeletonList count={5} />}
                {error && <ErrorState message={`Unable to fetch ${year} data: ${error}`} onRetry={() => setSubmitted(false)} />}

                {!loading && !error && results && (
                  <>
                    {totalResults === 0 ? (
                      <EmptyState
                        title="No colleges found"
                        description="Your rank doesn't match any cutoffs for the selected filters. Try a different round, year, or category."
                      />
                    ) : (
                      <div className="space-y-3">
                        {displayItems.map((item, idx) => (
                          <ResultCard
                            key={`${item.id}-${idx}`}
                            item={item}
                            round={round}
                            maxCutoff={maxCutoff}
                          />
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
