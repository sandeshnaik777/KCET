import { useState, useMemo } from 'react'
import { GitCompare, Search, RotateCcw, GraduationCap } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import CategorySelect from '../components/shared/CategorySelect'
import YearSelect from '../components/shared/YearSelect'
import { SkeletonList } from '../components/ui/SkeletonCard'
import ErrorState from '../components/ui/ErrorState'
import FallbackBadge from '../components/ui/FallbackBadge'
import { useFullTableQuery } from '../hooks/useSupabaseQuery'
import { buildAllRoundColumns } from '../utils/columnBuilder'
import { parseCutoff } from '../utils/columnBuilder'
import { ROUND_MAP, CATEGORY_MAP } from '../utils/categoryMap'

const ROUNDS_ORDER = Object.keys(ROUND_MAP)
const ROUND_SHORT = {
  'Mock': 'Mock',
  'First Round': 'Round 1',
  'Second Round': 'Round 2',
  'Second Extended Round': 'Extended',
}

function CollegePicker({ label, value, branch, onCollege, onBranch, colleges, collegeQuery, setCollegeQuery, branches, id, color }) {
  return (
    <div className="card flex-1">
      <div className={`flex items-center gap-2 mb-3 px-1 py-1 rounded-lg ${color} -mx-1`}>
        <GraduationCap size={14} />
        <p className="text-xs font-bold uppercase tracking-wider">{label}</p>
      </div>

      <div className="relative mb-2">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id={`${id}-search`}
          type="text"
          placeholder="Search college..."
          value={collegeQuery}
          onChange={(e) => { setCollegeQuery(e.target.value); onCollege(''); onBranch('') }}
          className="input-field pl-8 text-xs py-2"
          autoComplete="off"
        />
      </div>

      {collegeQuery && !value && (
        <div className="rounded-xl border border-slate-200 dark:border-navy-600 bg-white dark:bg-navy-800 shadow-lg max-h-36 overflow-y-auto scrollbar-none mb-2">
          {colleges.length === 0 ? (
            <p className="text-xs text-slate-400 p-2.5 text-center">No results</p>
          ) : (
            colleges.map(c => (
              <button key={c} type="button"
                className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-navy-700 border-b border-slate-100 dark:border-navy-700 last:border-0"
                onClick={() => { onCollege(c); setCollegeQuery(c) }}
                id={`${id}-option-${c.replace(/\s+/g, '-').slice(0, 15)}`}>
                {c}
              </button>
            ))
          )}
        </div>
      )}

      {value && branches.length > 0 && (
        <select id={`${id}-branch`} className="input-field text-xs py-2 mt-1"
          value={branch} onChange={(e) => onBranch(e.target.value)}>
          <option value="">Select branch…</option>
          {branches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      )}

      {value && <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-1.5 font-medium truncate">✓ {value}</p>}
    </div>
  )
}

export default function Compare() {
  const [year,     setYear]     = useState(2024)
  const [category, setCategory] = useState('General (GM)')
  const [collegeA, setCollegeA] = useState('')
  const [branchA,  setBranchA]  = useState('')
  const [queryA,   setQueryA]   = useState('')
  const [collegeB, setCollegeB] = useState('')
  const [branchB,  setBranchB]  = useState('')
  const [queryB,   setQueryB]   = useState('')

  const { data: rows, loading, error } = useFullTableQuery({ year })

  const allColleges = useMemo(() => {
    if (!rows) return []
    return [...new Set(rows.map(r => r.CollegeName).filter(Boolean))].sort()
  }, [rows])

  const filteredA = useMemo(() => allColleges.filter(n => n.toLowerCase().includes(queryA.toLowerCase())).slice(0, 10), [allColleges, queryA])
  const filteredB = useMemo(() => allColleges.filter(n => n.toLowerCase().includes(queryB.toLowerCase())).slice(0, 10), [allColleges, queryB])

  const branchesFor = (collegeName) => {
    if (!rows || !collegeName) return []
    return [...new Set(rows.filter(r => r.CollegeName === collegeName).map(r => r.Branch).filter(Boolean))].sort()
  }

  const roundCols = useMemo(() => buildAllRoundColumns(category), [category])
  const isGM = CATEGORY_MAP[category] === 'GM'

  const getCutoffs = (collegeName, branchName) => {
    if (!rows || !collegeName || !branchName) return null
    const row = rows.find(r => r.CollegeName === collegeName && r.Branch === branchName)
    if (!row) return null
    return roundCols.map(({ round, column, gmColumn }) => {
      let value  = parseCutoff(row[column])
      let usedGM = false
      if (value === null && !isGM) {
        const gm = parseCutoff(row[gmColumn])
        if (gm !== null) { value = gm; usedGM = true }
      }
      return { round, value, usedGM }
    })
  }

  const cutoffsA = getCutoffs(collegeA, branchA)
  const cutoffsB = getCutoffs(collegeB, branchB)
  const canCompare = cutoffsA && cutoffsB

  const reset = () => {
    setCollegeA(''); setBranchA(''); setQueryA('')
    setCollegeB(''); setBranchB(''); setQueryB('')
  }

  return (
    <div>
      <Topbar title="Compare Colleges" subtitle="Side-by-side cutoff comparison between two colleges" />
      <div className="page-inner">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <YearSelect value={year} onChange={(y) => { setYear(y); reset() }} id="compare-year" />
            <CategorySelect value={category} onChange={setCategory} id="compare-category" />
          </div>
          <button onClick={reset} id="compare-reset" className="btn-outline text-xs">
            <RotateCcw size={12} />
            Reset
          </button>
        </div>

        {loading && <SkeletonList count={2} lines={4} />}
        {error && <ErrorState message={error} />}

        {!loading && !error && (
          <>
            {/* College pickers */}
            <div className="flex gap-3 mb-5">
              <CollegePicker id="college-a" label="College A" value={collegeA} branch={branchA}
                onCollege={setCollegeA} onBranch={setBranchA} colleges={filteredA}
                collegeQuery={queryA} setCollegeQuery={setQueryA} branches={branchesFor(collegeA)}
                color="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300" />
              <CollegePicker id="college-b" label="College B" value={collegeB} branch={branchB}
                onCollege={setCollegeB} onBranch={setBranchB} colleges={filteredB}
                collegeQuery={queryB} setCollegeQuery={setQueryB} branches={branchesFor(collegeB)}
                color="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" />
            </div>

            {canCompare ? (
              <div className="card animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <GitCompare size={16} className="text-brand-500" />
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">Cutoff Comparison</h2>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-3 mb-2 px-1">
                  <span className="text-xs font-semibold text-slate-400">Round</span>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 text-center truncate">{branchA}</span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 text-center truncate">{branchB}</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-navy-700 border border-slate-100 dark:border-navy-700 rounded-xl overflow-hidden">
                  {ROUNDS_ORDER.map((round, idx) => {
                    const a = cutoffsA[idx]
                    const b = cutoffsB[idx]
                    const aWins = a?.value && b?.value && a.value < b.value
                    const bWins = a?.value && b?.value && b.value < a.value
                    return (
                      <div key={round} className="grid grid-cols-3 items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-navy-700/30">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{ROUND_SHORT[round]}</span>
                        <div className="text-center">
                          {a?.value
                            ? <span className={`text-sm font-bold tabular-nums ${aWins ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {a.value.toLocaleString('en-IN')}{a.usedGM && <sup className="text-[8px] text-purple-400 ml-0.5">GM</sup>}
                              </span>
                            : <span className="text-slate-300 dark:text-navy-600">—</span>}
                        </div>
                        <div className="text-center">
                          {b?.value
                            ? <span className={`text-sm font-bold tabular-nums ${bWins ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {b.value.toLocaleString('en-IN')}{b.usedGM && <sup className="text-[8px] text-purple-400 ml-0.5">GM</sup>}
                              </span>
                            : <span className="text-slate-300 dark:text-navy-600">—</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="text-center text-xs p-2 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium">
                    {collegeA.split(' ').slice(0, 4).join(' ')}
                  </div>
                  <div className="text-center text-xs p-2 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium">
                    {collegeB.split(' ').slice(0, 4).join(' ')}
                  </div>
                </div>

                {(cutoffsA.some(r => r.usedGM) || cutoffsB.some(r => r.usedGM)) && (
                  <div className="mt-3"><FallbackBadge /></div>
                )}
              </div>
            ) : (
              <div className="card text-center py-12 border-dashed border-2">
                <GitCompare size={28} className="text-slate-300 dark:text-navy-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 dark:text-slate-500">Select both colleges and branches to compare cutoffs</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
