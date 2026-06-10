import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, Cell,
  AreaChart, Area
} from 'recharts'
import { TrendingUp, TrendingDown, Award, Zap, Users, BookOpen, BarChart2 } from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import { SkeletonChart } from '../components/ui/SkeletonCard'
import ErrorState from '../components/ui/ErrorState'
import { TABLES, YEARS, supabaseData } from '../lib/supabase'
import { parseCutoff } from '../utils/columnBuilder'


// --- Branch match patterns (broad — catches real KCET branch name formats) ---
const TREND_BRANCHES = [
  {
    key: 'CS',
    label: 'Computer Science',
    color: '#1d4ed8',
    matches: ['COMPUTER SCIENCE', 'CSE'],
  },
  {
    key: 'AI',
    label: 'AI / ML',
    color: '#16a34a',
    // Broad match — catches all AI, ML, Data Science variants across all years
    matches: ['ARTIFICIAL INTELLIGENCE', 'AI &', 'AI AND', 'AIML', 'MACHINE LEARNING', 'DATA SCIENCE', 'AI-', 'AI ML'],
  },
  {
    key: 'ECE',
    label: 'Electronics (ECE)',
    color: '#d97706',
    matches: ['ELECTRONICS AND COMMUNICATION', 'ELECTRONICS & COMMUNICATION', 'ELECTRONICS &', 'EC ELECTR', 'ECE'],
  },
  {
    key: 'ME',
    label: 'Mechanical',
    color: '#7c3aed',
    matches: ['MECHANICAL', 'ME MECH'],
  },
]

const CHART_COLORS = ['#1d4ed8', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#059669', '#d946ef']
const YEAR_COLORS  = { 2021: '#6366f1', 2022: '#3b82f6', 2023: '#0ea5e9', 2024: '#06b6d4' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-navy-600 rounded-xl p-3 shadow-xl text-xs min-w-[150px]">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400 flex-1 truncate">{p.name}:</span>
          <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">
            {p.value != null ? p.value.toLocaleString('en-IN') : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}

function StatCard({ year, colleges, branches, bestCutoff, avgCutoff, totalRows, color }) {
  return (
    <div className={`card border-t-4 flex-1 min-w-[140px]`} style={{ borderTopColor: color }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-black" style={{ color }}>{year}</span>
        <span className="text-[10px] font-semibold bg-slate-100 dark:bg-navy-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
          {totalRows} rows
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Colleges</span>
          <span className="text-sm font-bold text-slate-800 dark:text-white">{colleges}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Unique Branches</span>
          <span className="text-sm font-bold text-slate-800 dark:text-white">{branches}</span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-navy-700 pt-2 mt-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Best Cutoff GM</span>
          <span className="text-sm font-bold text-green-600 dark:text-green-400 tabular-nums">
            {bestCutoff ? bestCutoff.toLocaleString('en-IN') : '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Avg Cutoff GM</span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
            {avgCutoff ? avgCutoff.toLocaleString('en-IN') : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function matchBranch(branchName, matches) {
  const upper = (branchName || '').toUpperCase()
  return matches.some(m => upper.includes(m.toUpperCase()))
}

function avgArr(arr) {
  const valid = arr.filter(Boolean)
  return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : null
}

function minArr(arr) {
  const valid = arr.filter(Boolean)
  return valid.length ? Math.min(...valid) : null
}

export default function Analytics() {
  const [stats,      setStats]      = useState([])   // per-year overview
  const [trendData,  setTrendData]  = useState([])   // YoY line chart
  const [roundData,  setRoundData]  = useState([])   // round-wise bar chart
  const [competData, setCompetData] = useState([])   // top colleges bar chart
  const [catData,    setCatData]    = useState([])   // category comparison 2024
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        // Paginated fetch helper — fetches in batches of 1000 until exhausted.
        // This works around Supabase's server-side max_rows=1000 limit.
        const fetchAllRows = async (tableName, columns) => {
          const PAGE = 1000
          let from = 0
          let allRows = []
          while (true) {
            const { data, error: sbErr } = await supabaseData
              .from(tableName)
              .select(columns)
              .range(from, from + PAGE - 1)

            if (sbErr) throw sbErr
            if (!data || data.length === 0) break
            allRows = allRows.concat(data)
            if (data.length < PAGE) break   // last page received
            from += PAGE
          }
          return allRows
        }

        const COLS = 'CollegeName, CollegeCode, Branch, Mock_GM, FirstRound_GM, SecondRound_GM, SecondExtended_GM, FirstRound_1G, FirstRound_2AG, FirstRound_SCG, FirstRound_STG'

        // Fetch ALL rows from all 4 years in parallel (paginated per table)
        const yearDataArrays = await Promise.all(
          YEARS.map(year => fetchAllRows(TABLES[year], COLS))
        )
        // Wrap in { data } shape for compatibility with existing code
        const yearResults = yearDataArrays.map(data => ({ data }))

        const hasData = yearResults.some(r => r.data && r.data.length > 0)
        if (!hasData) throw new Error('No data available. Check your Supabase RLS policies.')

        // ── 1. Per-year STATS ──────────────────────────────────────────────────
        const yearStats = YEARS.map((year, idx) => {
          const data = yearResults[idx].data || []
          const uniqueColleges = new Set(data.map(r => r.CollegeCode).filter(Boolean)).size
          const uniqueBranches = new Set(data.map(r => r.Branch).filter(Boolean)).size
          const gmCutoffs = data.map(r => parseCutoff(r.FirstRound_GM)).filter(Boolean)
          return {
            year,
            colleges:   uniqueColleges,
            branches:   uniqueBranches,
            bestCutoff: gmCutoffs.length ? Math.min(...gmCutoffs) : null,
            avgCutoff:  avgArr(gmCutoffs),
            totalRows:  data.length,
            color:      YEAR_COLORS[year],
          }
        })
        setStats(yearStats)

        // ── 2. Year-Over-Year TREND (average FirstRound_GM per branch type) ────
        const trendByYear = {}
        YEARS.forEach((year, idx) => {
          const data = yearResults[idx].data || []
          const entry = { year: String(year) }
          TREND_BRANCHES.forEach(({ key, matches }) => {
            const rows = data.filter(r => matchBranch(r.Branch, matches))
            const vals = rows.map(r => parseCutoff(r.FirstRound_GM)).filter(Boolean)
            entry[key] = avgArr(vals)
          })
          trendByYear[year] = entry
        })
        // Show oldest year first (2021 → 2024)
        setTrendData([...YEARS].reverse().map(y => trendByYear[y]))

        // ── 3. Round-wise COMPARISON for 2024 (avg per branch stream) ──────────
        const latest = yearResults[0].data || []   // yearResults[0] = 2024
        const roundMap = {}
        TREND_BRANCHES.forEach(({ key }) => { roundMap[key] = { Mock: [], R1: [], R2: [], Ext: [] } })

        latest.forEach(row => {
          const tb = TREND_BRANCHES.find(b => matchBranch(row.Branch, b.matches))
          if (!tb) return
          const m  = parseCutoff(row.Mock_GM)
          const r1 = parseCutoff(row.FirstRound_GM)
          const r2 = parseCutoff(row.SecondRound_GM)
          const ex = parseCutoff(row.SecondExtended_GM)
          if (m)  roundMap[tb.key].Mock.push(m)
          if (r1) roundMap[tb.key].R1.push(r1)
          if (r2) roundMap[tb.key].R2.push(r2)
          if (ex) roundMap[tb.key].Ext.push(ex)
        })

        setRoundData([
          { round: 'Mock',     ...Object.fromEntries(TREND_BRANCHES.map(b => [b.key, avgArr(roundMap[b.key].Mock)])) },
          { round: 'Round 1',  ...Object.fromEntries(TREND_BRANCHES.map(b => [b.key, avgArr(roundMap[b.key].R1)]))   },
          { round: 'Round 2',  ...Object.fromEntries(TREND_BRANCHES.map(b => [b.key, avgArr(roundMap[b.key].R2)]))   },
          { round: 'Extended', ...Object.fromEntries(TREND_BRANCHES.map(b => [b.key, avgArr(roundMap[b.key].Ext)])) },
        ])

        // ── 4. Most COMPETITIVE colleges in 2024 (lowest FirstRound_GM) ────────
        const collegeMin = {}
        for (const row of latest) {
          if (!row.CollegeName || !row.CollegeCode) continue
          const val = parseCutoff(row.FirstRound_GM)
          if (!val) continue
          const key = row.CollegeCode
          if (!collegeMin[key] || val < collegeMin[key].cutoff) {
            collegeMin[key] = { name: row.CollegeName, cutoff: val, code: row.CollegeCode }
          }
        }
        const topColleges = Object.values(collegeMin)
          .sort((a, b) => a.cutoff - b.cutoff)
          .slice(0, 8)
          .map(c => ({
            college: c.name.length > 24 ? c.name.slice(0, 22) + '…' : c.name,
            code:    c.code,
            cutoff:  c.cutoff,
          }))
        setCompetData(topColleges)

        // ── 5. Category comparison for 2024 CS branches ───────────────────────
        const csRows2024 = latest.filter(r => matchBranch(r.Branch, ['COMPUTER SCIENCE', 'CSE', 'CS ']))
        const catLabels = [
          { key: 'FirstRound_GM',  label: 'GM',      color: '#1d4ed8' },
          { key: 'FirstRound_1G',  label: 'Cat 1',   color: '#16a34a' },
          { key: 'FirstRound_2AG', label: 'Cat 2A',  color: '#d97706' },
          { key: 'FirstRound_SCG', label: 'SC',      color: '#dc2626' },
          { key: 'FirstRound_STG', label: 'ST',      color: '#7c3aed' },
        ]
        const catChartData = catLabels.map(({ key, label, color }) => ({
          category: label,
          avg: avgArr(csRows2024.map(r => parseCutoff(r[key])).filter(Boolean)),
          color,
        })).filter(d => d.avg !== null)
        setCatData(catChartData)

      } catch (err) {
        setError(err.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Compute insights from real data
  const insights = stats.length === 4 ? (() => {
    const cs2021 = trendData.find(d => d.year === '2021')?.CS
    const cs2024 = trendData.find(d => d.year === '2024')?.CS
    const csDrop = cs2021 && cs2024 ? Math.round(((cs2021 - cs2024) / cs2021) * 100) : null
    const bestCollege = competData[0]
    const totalColleges2024 = stats.find(s => s.year === 2024)?.colleges || 0
    return { csDrop, bestCollege, totalColleges2024 }
  })() : null

  return (
    <div>
      <Topbar title="Analytics Dashboard" subtitle="Real data insights across 2021–2024 KCET counseling rounds" />
      <div className="page-inner">
        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="card animate-pulse h-36 bg-slate-100 dark:bg-navy-800" />)}
            </div>
            <SkeletonChart />
            <SkeletonChart />
          </div>
        )}
        {error && <ErrorState message={error} />}

        {!loading && !error && (
          <div className="space-y-5 animate-fade-in">

            {/* ── Year Overview Stats ──────────────────────────────────────────── */}
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <BarChart2 size={17} className="text-brand-500" />
                4-Year Data Overview (Real Numbers from DB)
              </h2>
              <div className="flex flex-col md:flex-row gap-3">
                {stats.map(s => (
                  <StatCard key={s.year} {...s} />
                ))}
              </div>
            </div>

            {/* ── Insight chips ─────────────────────────────────────────────────── */}
            {insights && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="card border-l-4 border-l-red-500 py-3 px-4">
                  <div className="flex items-start gap-2">
                    <TrendingDown size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">CS Tightening</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {insights.csDrop != null
                          ? `Average CS cutoff dropped ~${insights.csDrop}% from 2021 to 2024 — more competitive every year.`
                          : 'CS cutoffs are tightening year over year. Enter rank to check eligibility.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card border-l-4 border-l-green-500 py-3 px-4">
                  <div className="flex items-start gap-2">
                    <Award size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Most Competitive 2024</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {insights.bestCollege
                          ? `${insights.bestCollege.college} has the lowest First Round GM cutoff at ${insights.bestCollege.cutoff.toLocaleString('en-IN')}.`
                          : 'Top colleges have very tight cutoffs — plan early.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card border-l-4 border-l-brand-500 py-3 px-4">
                  <div className="flex items-start gap-2">
                    <Users size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">Seat Growth</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {insights.totalColleges2024} unique colleges participated in 2024 KCET counseling. Data spans all rounds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── YoY Trend Line Chart ─────────────────────────────────────────── */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">Year-Over-Year Cutoff Trends</h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Average First Round GM cutoff rank · all colleges per stream · 2021–2024
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 10, right: 15, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  {TREND_BRANCHES.map(({ key, label, color }) => (
                    <Line key={key} type="monotone" dataKey={key} name={label} stroke={color}
                          strokeWidth={2.5} dot={{ r: 4, fill: color, strokeWidth: 0 }}
                          activeDot={{ r: 6, strokeWidth: 0 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-1">
                📉 Rank dropping over years = branch getting more competitive (harder to get in)
              </p>
            </div>

            {/* ── Round-wise Bar Chart + Category Comparison ─────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <h2 className="text-base font-bold text-slate-800 dark:text-white mb-1">Round-Wise Cutoff Shift</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                  2024 average cutoff rank per stream (Mock → Extended). Higher rank in later rounds = more seats released.
                </p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={roundData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} vertical={false} />
                    <XAxis dataKey="round" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: '10px' }} />
                    {TREND_BRANCHES.map(({ key, label, color }) => (
                      <Bar key={key} dataKey={key} name={label} fill={color} radius={[4, 4, 0, 0]} fillOpacity={0.85} maxBarSize={25} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h2 className="text-base font-bold text-slate-800 dark:text-white mb-1">Category Cutoff Comparison</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                  2024 First Round average cutoff for Computer Science across categories. Higher rank = more lenient category.
                </p>
                {catData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 50, bottom: 0, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
                        domain={[0, 'auto']}
                      />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={45} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="avg" name="Avg Cutoff" radius={[0, 6, 6, 0]}
                           label={{ position: 'right', fontSize: 9, fill: '#94a3b8', formatter: v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v }}>
                        {catData.map((d, idx) => (
                          <Cell key={idx} fill={d.color} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-40 text-slate-400 text-xs">
                    No category comparison data for CS in 2024
                  </div>
                )}
              </div>
            </div>

            {/* ── Most Competitive Colleges ───────────────────────────────────── */}
            <div className="card">
              <div className="flex items-center gap-2 mb-1">
                <Award size={17} className="text-brand-500" />
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Most Competitive Colleges — 2024</h2>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4">
                Lowest First Round GM cutoff rank (lower = harder to get in = more competitive). Real data from Supabase.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={competData} layout="vertical" margin={{ top: 0, right: 55, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
                    domain={[0, 'auto']}
                  />
                  <YAxis type="category" dataKey="college" tick={{ fontSize: 9, fill: '#94a3b8' }} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cutoff" name="First Round GM" radius={[0, 6, 6, 0]}
                       label={{ position: 'right', fontSize: 9, fill: '#64748b', formatter: v => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v }}>
                    {competData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── Year-wise summary table ─────────────────────────────────────── */}
            <div className="card overflow-x-auto">
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-brand-500" />
                4-Year Summary Table
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-navy-700">
                    <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">Year</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Colleges</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Branches</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Rows in DB</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Best GM Cutoff</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400">Avg GM Cutoff</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s, idx) => (
                    <tr key={s.year} className="border-b border-slate-50 dark:border-navy-700/50 hover:bg-slate-50 dark:hover:bg-navy-700/30">
                      <td className="py-2.5 pr-4">
                        <span className="text-sm font-bold" style={{ color: s.color }}>{s.year}</span>
                      </td>
                      <td className="text-right py-2.5 px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{s.colleges}</td>
                      <td className="text-right py-2.5 px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{s.branches}</td>
                      <td className="text-right py-2.5 px-3 text-sm text-slate-500 dark:text-slate-400 tabular-nums">{s.totalRows}</td>
                      <td className="text-right py-2.5 px-3 text-sm font-semibold text-green-600 dark:text-green-400 tabular-nums">
                        {s.bestCutoff ? s.bestCutoff.toLocaleString('en-IN') : '—'}
                      </td>
                      <td className="text-right py-2.5 px-3 text-sm text-slate-500 dark:text-slate-400 tabular-nums">
                        {s.avgCutoff ? s.avgCutoff.toLocaleString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
