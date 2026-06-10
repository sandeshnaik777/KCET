import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Copy, Check, Share2, LogOut, User, Zap, Gift,
  Users, TrendingUp, Sparkles, ChevronRight, Star, ExternalLink, RefreshCw
} from 'lucide-react'
import Topbar from '../components/layout/Topbar'
import { useAuth } from '../contexts/AuthContext'

function CreditBar({ credits, max = 30 }) {
  const pct = Math.min(100, Math.round((credits / max) * 100))
  const color = credits > 15 ? 'bg-green-500' : credits > 5 ? 'bg-brand-500' : 'bg-red-500'
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-500 dark:text-slate-400">Credits remaining</span>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{credits} / {max}</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 dark:bg-navy-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function StatBadge({ icon: Icon, label, value, color }) {
  return (
    <div className="card text-center py-4 px-3">
      <Icon size={18} className={`mx-auto mb-2 ${color}`} />
      <p className="text-xl font-black text-slate-800 dark:text-white">{value}</p>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight">{label}</p>
    </div>
  )
}

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

const HOW_TO_EARN = [
  { step: '1', text: 'Copy your unique referral code above' },
  { step: '2', text: 'Share it with friends appearing in KCET 2026' },
  { step: '3', text: 'When they sign up using your code, you get +25 credits' },
  { step: '4', text: 'They also get +3 bonus credits — win-win!' },
]

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, signOut, loadProfile, refreshProfile } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  // Auto-refresh credits when Profile page mounts (picks up referral bonuses)
  useEffect(() => {
    if (user) refreshProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!user || !profile) {
    return (
      <div>
        <Topbar title="Profile" subtitle="Your account and referral credits" />
        <div className="page-inner flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <User size={40} className="text-slate-300 dark:text-navy-600 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">Not signed in</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Create an account to track your usage and earn credits.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Go to Home</button>
          </div>
        </div>
      </div>
    )
  }

  const initials  = (user.email || 'U').slice(0, 2).toUpperCase()
  const joinDate  = new Date(user.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const referralLink = `${window.location.origin}?ref=${profile.referral_code}`
  const totalReferrals = profile.total_referrals || 0

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join KCET Predictor',
        text: `Use my referral code ${profile.referral_code} on KCET Predictor and get bonus credits!`,
        url: referralLink,
      })
    } else {
      await navigator.clipboard.writeText(referralLink)
      alert('Referral link copied to clipboard!')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div>
      <Topbar title="My Profile" subtitle="Account, credits, and referral program" />
      <div className="page-inner">

        {/* ── Profile Hero ─────────────────────────────────────────────────── */}
        <div className="card mb-5 bg-gradient-to-r from-navy-900 to-brand-900 p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brand-400 blur-3xl" />
          </div>
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center flex-shrink-0 text-2xl font-black text-white">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-black text-white truncate">{user.email}</p>
              <p className="text-xs text-navy-300 mt-0.5">Member since {joinDate}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-brand-700 text-brand-200 px-2 py-0.5 rounded-full font-semibold">
                  Free Tier
                </span>
                <span className="text-xs text-navy-400">·</span>
                <span className="text-xs text-navy-300">Upgrade coming soon</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              id="profile-signout-btn"
              className="flex items-center gap-1.5 text-xs text-navy-300 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-navy-800/50"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Quick stats ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatBadge icon={Zap}    label="Credits"    value={profile.credits}             color="text-brand-500"  />
          <StatBadge icon={Users}  label="Referrals"  value={totalReferrals}              color="text-green-500"  />
          <StatBadge icon={Star}   label="Bonus Earned" value={`+${totalReferrals * 25}`} color="text-yellow-500" />
        </div>

        {/* ── Credits ───────────────────────────────────────────────────────── */}
        <div className="card mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Zap size={16} className="text-brand-500" /> Credits
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-slate-500">1 credit = 1 college view</span>
              <button
                onClick={async () => { setRefreshing(true); await refreshProfile(); setRefreshing(false) }}
                title="Refresh credits from server"
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-400 hover:text-brand-500 transition-colors"
              >
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          <CreditBar credits={profile.credits} max={30} />
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="bg-slate-50 dark:bg-navy-800 rounded-lg py-2.5 px-2">
              <p className="text-sm font-bold text-slate-800 dark:text-white">10</p>
              <p className="text-[10px] text-slate-400">Base credits</p>
            </div>
            <div className="bg-slate-50 dark:bg-navy-800 rounded-lg py-2.5 px-2">
              <p className="text-sm font-bold text-green-600 dark:text-green-400">+{totalReferrals * 25}</p>
              <p className="text-[10px] text-slate-400">From referrals</p>
            </div>
            <div className="bg-slate-50 dark:bg-navy-800 rounded-lg py-2.5 px-2">
              <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{profile.credits}</p>
              <p className="text-[10px] text-slate-400">Available now</p>
            </div>
          </div>
          {profile.referred_by && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-3 flex items-center gap-1.5">
              <Check size={12} /> You got +3 bonus credits for joining with referral code <strong>{profile.referred_by}</strong>
            </p>
          )}
        </div>

        {/* ── Referral Code ─────────────────────────────────────────────────── */}
        <div className="card mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Gift size={16} className="text-yellow-500" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Your Referral Code</h2>
          </div>

          <div className="bg-gradient-to-r from-brand-50 to-yellow-50 dark:from-brand-900/20 dark:to-yellow-900/20 border border-brand-100 dark:border-brand-800 rounded-2xl p-5 text-center mb-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Share this code with friends</p>
            <p className="text-4xl font-black tracking-[0.3em] text-brand-700 dark:text-brand-300 mb-3" id="referral-code-display">
              {profile.referral_code}
            </p>
            <div className="flex items-center justify-center gap-2">
              <CopyButton text={profile.referral_code} label="Copy Code" />
              <button
                onClick={handleShare}
                id="share-referral-btn"
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-navy-800 text-white hover:bg-navy-700 transition-colors"
              >
                <Share2 size={13} />
                Share Link
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 text-center mb-4">
            Referral link: <span className="font-mono text-brand-600 dark:text-brand-400 truncate">{referralLink}</span>
            <CopyButton text={referralLink} label="" />
          </div>

          {/* How it works */}
          <div className="border-t border-slate-100 dark:border-navy-700 pt-4">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">How it works</p>
            <div className="space-y-2.5">
              {HOW_TO_EARN.map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────────── */}
        <div className="card">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Quick Actions</h2>
          <div className="space-y-1">
            {[
              { icon: Sparkles, label: 'Run a Prediction',     to: '/predict',  color: 'text-brand-500' },
              { icon: TrendingUp, label: 'View Analytics',     to: '/analytics', color: 'text-green-500' },
            ].map(({ icon: Icon, label, to, color }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className={color} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* ── Get More Credits / Subscription ──────────────────────────────── */}
        <div className="card mt-4 bg-gradient-to-r from-green-900/60 to-navy-900 border-green-800/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <ExternalLink size={18} className="text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-1">
                Need More Credits or Subscription?
              </p>
              <p className="text-xs text-navy-300 mb-3 leading-snug">
                Contact us on WhatsApp to get more credits, unlock premium features, or subscribe for unlimited access.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="https://wa.me/919739331354"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="whatsapp-contact-1"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  +91 97393 31354
                </a>
                <a
                  href="https://wa.me/918123824899"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="whatsapp-contact-2"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  +91 81238 24899
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
