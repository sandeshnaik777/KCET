import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, BarChart3, TrendingUp, HelpCircle, ArrowRight, Users, Building2, BookOpen, Shield, MessageCircle, Star, Phone } from 'lucide-react'
import Topbar from '../components/layout/Topbar'

const TOOLS = [
  {
    id: 'tool-predictor',
    to: '/predict',
    icon: Sparkles,
    title: 'College Predictor',
    desc: 'Discover colleges you\'re eligible for based on your rank',
    iconBg: 'bg-brand-100 dark:bg-brand-900/40',
    iconColor: 'text-brand-600 dark:text-brand-400',
  },
  {
    id: 'tool-cutoffs',
    to: '/explore',
    icon: BarChart3,
    title: 'Cutoff Explorer',
    desc: 'Search any college and view all round cutoffs with trends',
    iconBg: 'bg-slate-100 dark:bg-navy-700',
    iconColor: 'text-slate-600 dark:text-slate-300',
  },
  {
    id: 'tool-analytics',
    to: '/analytics',
    icon: TrendingUp,
    title: 'Deep Analytics',
    desc: 'Year-over-year trends and competitive college insights',
    iconBg: 'bg-slate-100 dark:bg-navy-700',
    iconColor: 'text-slate-600 dark:text-slate-300',
  },
  {
    id: 'tool-help',
    to: '/help',
    icon: HelpCircle,
    title: 'Expert Guidance',
    desc: 'Personalized counseling, timeline & expert callback',
    iconBg: 'bg-slate-100 dark:bg-navy-700',
    iconColor: 'text-slate-600 dark:text-slate-300',
  },
]

const FEATURES = [
  {
    icon: Shield,
    title: 'Expert Guidance',
    desc: 'Personalized counseling tailored to your unique profile, career goals, and academic strengths.',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Decisions',
    desc: 'Leveraging historical cutoff data and sophisticated algorithms to maximize your admission chances.',
  },
  {
    icon: TrendingUp,
    title: 'Future Planning',
    desc: 'Comprehensive career insights and roadmap planning beyond just securing college admission.',
  },
]

export default function Home() {
  const navigate = useNavigate()

  // Live viewer count — random 100-200, drifts ±5 every 15s for authenticity
  const [viewerCount, setViewerCount] = useState(() => Math.floor(Math.random() * 101) + 100)
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const delta = Math.floor(Math.random() * 11) - 5  // -5 to +5
        return Math.min(200, Math.max(100, prev + delta))
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // 12-hour countdown timer — persists in localStorage across page refreshes
  const OFFER_DURATION = 12 * 60 * 60 * 1000  // 12 hours in ms
  const [timeLeft, setTimeLeft] = useState(() => {
    const stored = localStorage.getItem('kcet_offer_end')
    const end = stored ? Number(stored) : Date.now() + OFFER_DURATION
    if (!stored) localStorage.setItem('kcet_offer_end', String(end))
    return Math.max(0, end - Date.now())
  })
  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          // Reset to a fresh 12 hours
          const next = Date.now() + OFFER_DURATION
          localStorage.setItem('kcet_offer_end', String(next))
          return OFFER_DURATION
        }
        return prev - 1000
      })
    }, 1000)
    return () => clearInterval(tick)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const hrs  = String(Math.floor(timeLeft / 3600000)).padStart(2, '0')
  const mins = String(Math.floor((timeLeft % 3600000) / 60000)).padStart(2, '0')
  const secs = String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, '0')

  return (
    <div>
      <Topbar />
      <div className="page-inner">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-navy-900 dark:bg-navy-950 mb-6 p-8 md:p-12">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400 blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-navy-400 blur-2xl translate-y-1/2 -translate-x-1/4" />
          </div>
          <div className="relative text-center max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight">
              Your college choice defines your future.{' '}
              <span className="text-brand-400">Make it count.</span>
            </h1>
            <p className="text-sm md:text-base text-navy-200 mb-6 leading-relaxed">
              Enter your KCET rank and discover the engineering colleges you are most likely to get into based on 2025 cutoff trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
              <button
                id="hero-predict-btn"
                onClick={() => navigate('/predict')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors"
              >
                <Sparkles size={16} />
                Predict Your KCET College Now
              </button>
              <button
                id="hero-cutoffs-btn"
                onClick={() => navigate('/explore')}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-navy-600 hover:bg-navy-800 text-navy-100 font-semibold text-sm transition-colors"
              >
                View 2025 Cutoffs
              </button>
            </div>
            {/* Live viewer badge */}
            <div className="flex items-center justify-center gap-2">
              <span className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                {viewerCount} students viewing right now
              </span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 mb-6">
          <div className="card text-center py-6">
            <div className="w-12 h-12 rounded-full bg-navy-100 dark:bg-navy-700 flex items-center justify-center mx-auto mb-3">
              <Building2 size={22} className="text-navy-700 dark:text-navy-200" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">We are the Best</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Trusted by students across Karnataka</p>
          </div>
          <div className="card text-center py-6">
            <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mx-auto mb-3">
              <Users size={22} className="text-brand-600 dark:text-brand-400" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white">1000+</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Students Counseled to Dream Colleges</p>
          </div>
        </section>

        {/* Tools */}
        <section className="mb-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-3">Quick Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOOLS.map(({ id, to, icon: Icon, title, desc, iconBg, iconColor }) => (
              <button
                key={id}
                id={id}
                onClick={() => navigate(to)}
                className="card-hover text-left p-4"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
                  <Icon size={18} className={iconColor} />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight mb-1">{title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ── EXCLUSIVE OFFERS & DOWNLOADS ─────────────────────────────────── */}
        <section className="mb-6" id="exclusive-offers-section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Free Offer: District-Wise College List */}
            <div className="relative overflow-hidden rounded-2xl p-[2px] bg-gradient-to-r from-teal-400 via-cyan-500 to-brand-500 shadow-xl flex">
              <div className="relative rounded-2xl bg-gradient-to-br from-[#02131e] via-[#082236] to-[#02131e] p-6 md:p-8 overflow-hidden flex flex-col justify-between w-full">
                {/* Glow effects */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-teal-400 blur-3xl translate-x-1/3 -translate-y-1/3" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-brand-500 blur-3xl -translate-x-1/4 translate-y-1/4" />
                </div>

                <div className="relative flex flex-col h-full justify-between">
                  <div>
                    {/* Top badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="flex items-center gap-1.5 bg-teal-400/20 border border-teal-400/40 text-teal-300 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse inline-block" />
                        🎁 Free KCET Resource
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">
                      District-Wise <span className="text-teal-400">College List</span>
                    </h3>
                    
                    <p className="text-sm text-cyan-200/80 leading-relaxed mb-4">
                      Get the official compilation of engineering colleges mapped by district to streamline your option entry process.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        '📁 Complete PDF Format',
                        '🏫 Organized by District',
                        '📍 All Karnataka Districts',
                        '⚡ Free Download',
                      ].map(f => (
                        <span key={f} className="text-[11px] font-semibold bg-white/10 border border-white/20 text-cyan-100 px-2.5 py-1 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    {/* Price */}
                    <div className="flex flex-wrap items-center gap-4 mb-5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-teal-400">FREE</span>
                        <span className="text-lg font-bold text-cyan-400/60 line-through decoration-red-400">₹89</span>
                      </div>
                      <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-lg tracking-wide animate-pulse">
                        100% OFF
                      </span>
                    </div>

                    {/* Action Button */}
                    <a
                      href="https://drive.google.com/file/d/1iTlfOo6JjMbXz0JESZva7wQhP9WdZV3r/view?usp=drive_link"
                      target="_blank"
                      rel="noopener noreferrer"
                      id="free-pdf-download-btn"
                      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 hover:scale-[1.02] text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-teal-900/40 w-full text-center"
                    >
                      <ArrowRight size={16} />
                      Download Free PDF List
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Offer: Complete Cutoff Data */}
            <div className="relative overflow-hidden rounded-2xl p-[2px] bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 shadow-xl flex">
              <div className="relative rounded-2xl bg-gradient-to-br from-[#1a0e00] via-[#2d1a00] to-[#1a0e00] p-6 md:p-8 overflow-hidden flex flex-col justify-between w-full">
                {/* Glow effects */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-yellow-400 blur-3xl translate-x-1/3 -translate-y-1/3" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-orange-400 blur-3xl -translate-x-1/4 translate-y-1/4" />
                </div>

                <div className="relative flex flex-col h-full justify-between">
                  <div>
                    {/* Top badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" />
                        🔥 Limited Time Offer
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">
                      Get Complete Cutoff Data{' '}
                      <span className="text-yellow-400">2020 – 2025</span>
                    </h3>
                    
                    <p className="text-sm text-amber-200/80 leading-relaxed mb-4">
                      All engineering colleges · Every round · 6 years of data.
                      Perfect for counselling strategy, option entry planning, and trend analysis.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        '📅 2020 to 2025 Data',
                        '🏫 All 258+ Colleges',
                        '🔄 Every Round Included',
                        '📊 All Categories',
                        '⚡ Instant Access',
                      ].map(f => (
                        <span key={f} className="text-[11px] font-semibold bg-white/10 border border-white/20 text-amber-100 px-2.5 py-1 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    {/* Price + Countdown */}
                    <div className="flex flex-wrap items-center gap-4 mb-5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">₹49</span>
                        <span className="text-lg font-bold text-amber-400/60 line-through decoration-red-400">₹899</span>
                      </div>
                      <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-lg tracking-wide animate-pulse">
                        94% OFF
                      </span>
                      {/* Countdown */}
                      <div className="flex items-center gap-1.5 bg-black/40 border border-yellow-500/30 px-3 py-1.5 rounded-lg">
                        <span className="text-yellow-300 text-[10px] font-bold uppercase tracking-wide">Ends in</span>
                        <span className="font-black text-white text-sm tabular-nums">{hrs}:{mins}:{secs}</span>
                      </div>
                    </div>

                    {/* WhatsApp buttons */}
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <a
                        href="https://wa.me/918123824899?text=Hi%2C%20I%20want%20to%20get%20the%20KCET%20cutoff%20data%202020-2025%20for%20%E2%82%B949"
                        target="_blank"
                        rel="noopener noreferrer"
                        id="offer-wa-btn-1"
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-green-900/40 hover:scale-[1.02] flex-1 text-center"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp: 81238 24899
                      </a>
                      <a
                        href="https://wa.me/919739331654?text=Hi%2C%20I%20want%20to%20get%20the%20KCET%20cutoff%20data%202020-2025%20for%20%E2%82%B949"
                        target="_blank"
                        rel="noopener noreferrer"
                        id="offer-wa-btn-2"
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-green-900/40 hover:scale-[1.02] flex-1 text-center"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        WhatsApp: 97393 31654
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ask Expert CTA Banner */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 p-6 md:p-8">
            {/* Decorative blobs */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white blur-3xl translate-x-1/4 -translate-y-1/4" />
              <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white blur-2xl translate-y-1/4" />
            </div>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={15} className="text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-bold text-brand-100 uppercase tracking-wide">Expert Counseling</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white mb-2 leading-tight">
                  Confused about which college to choose?
                </h3>
                <p className="text-sm text-brand-100 leading-relaxed max-w-md">
                  Ask a KCET expert at very low cost. Get personalized guidance on option entry, rank analysis, and which branch-college combo is right for <strong className="text-white">your</strong> profile.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-brand-200 flex items-center gap-1">
                    <Users size={12} /> 1000+ students guided
                  </span>
                  <span className="text-xs text-brand-200">·</span>
                  <span className="text-xs text-brand-200">Mon–Sat, 9 AM – 6 PM</span>
                </div>
              </div>
              <button
                id="home-ask-expert-btn"
                onClick={() => navigate('/help')}
                className="flex-shrink-0 flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-brand-50 transition-colors shadow-lg"
              >
                <MessageCircle size={17} />
                Ask an Expert Now
              </button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-6">
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center p-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-navy-700 flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-slate-600 dark:text-slate-300" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Insights */}
        <section>
          <h2 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-3">Quick Insights</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Colleges', value: '200+', icon: Building2 },
              { label: 'Branches', value: '100+', icon: BookOpen },
              { label: 'Years Data', value: '4 Yrs', icon: BarChart3 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="card text-center py-4">
                <Icon size={18} className="text-brand-500 mx-auto mb-1.5" />
                <p className="text-lg font-black text-slate-800 dark:text-white">{value}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-slate-200 dark:border-navy-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-white">KCET Predictor</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">© 2026 KCET Predictor. All rights reserved.</p>
            </div>
            <div className="flex gap-5 text-xs text-slate-500 dark:text-slate-400">
              <span className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Privacy Policy</span>
              <span className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Terms of Service</span>
              <span className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">Contact Us</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
