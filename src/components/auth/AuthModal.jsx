import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth, FREE_PREDICTIONS, FREE_COLLEGE_VIEWS, FREE_MINUTES } from '../../contexts/AuthContext'
import {
  GraduationCap, Mail, Lock, Eye, EyeOff, Gift,
  Sparkles, Shield, Users, TrendingUp, CheckCircle2, AlertCircle, Loader2, X
} from 'lucide-react'

const PERKS = [
  { icon: Sparkles, text: 'Unlimited predictions with your rank' },
  { icon: TrendingUp, text: 'Full 4-year cutoff analytics' },
  { icon: Users, text: 'Refer friends · earn more access' },
  { icon: Shield, text: 'Save your college shortlist' },
]

function InputField({ id, type, label, placeholder, value, onChange, error, icon: Icon, rightAction }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={type === 'password' ? 'current-password' : 'email'}
          className={`w-full pl-10 pr-${rightAction ? '10' : '3'} py-2.5 rounded-xl border text-sm
            bg-white dark:bg-navy-800
            text-slate-800 dark:text-white
            placeholder-slate-400 dark:placeholder-navy-400
            outline-none transition-all
            ${error
              ? 'border-red-400 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800'
              : 'border-slate-200 dark:border-navy-600 focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 focus:border-brand-400'
            }`}
        />
        {rightAction && (
          <button type="button" onClick={rightAction.onClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {rightAction.icon}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  )
}

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signUp, user, predCount, viewCount } = useAuth()

  const [tab,         setTab]         = useState('signin')   // 'signin' | 'signup'
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [refCode,     setRefCode]     = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [success,     setSuccess]     = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  // Reset on tab switch
  useEffect(() => {
    setError('')
    setSuccess('')
    setFieldErrors({})
  }, [tab])

  if (!showAuthModal || user) return null

  // ── Usage context message ─────────────────────────────────────────────────
  const usageMsg = predCount >= FREE_PREDICTIONS
    ? `You've made ${predCount} predictions as a guest.`
    : viewCount >= FREE_COLLEGE_VIEWS
    ? `You've browsed ${viewCount} colleges as a guest.`
    : `You've been browsing for ${FREE_MINUTES}+ minutes.`

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address'
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      if (tab === 'signin') {
        await signIn(email, password)
        // modal will close via auth state change
      } else {
        const result = await signUp(email, password, refCode)
        const bonus = ' You received 50 free credits!'
        setSuccess(`Account created! Check your email to verify.${bonus}`)
      }
    } catch (err) {
      const msg = err.message || 'Something went wrong'
      if (msg.toLowerCase().includes('invalid login'))  setError('Wrong email or password.')
      else if (msg.toLowerCase().includes('already'))   setError('This email is already registered. Sign in instead.')
      else if (msg.toLowerCase().includes('email'))     setError('Please check your email address.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-md" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-4xl mx-4 flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl animate-fade-in">

        {/* ── Left panel: hero ─────────────────────────────────────── */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-brand-700 to-navy-900 p-8 w-[42%] relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-brand-300 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-navy-300 blur-2xl" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="text-sm font-bold text-white">KCET Predictor</span>
            </div>

            <h2 id="auth-modal-title" className="text-2xl font-black text-white leading-tight mb-3">
              Your free preview has ended.
            </h2>
            <p className="text-sm text-brand-100 leading-relaxed mb-6">
              {usageMsg} Create a free account to keep going — and earn bonus credits by referring friends!
            </p>

            <div className="space-y-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={13} className="text-brand-300" />
                  </div>
                  <span className="text-sm text-brand-100">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-8">
            <div className="bg-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Gift size={13} className="text-yellow-300" />
                <span className="text-xs font-bold text-white">Referral Bonus</span>
              </div>
              <p className="text-xs text-brand-200 leading-snug">
                Refer a friend → you both get bonus credits. Each referral = +100 credits for you!
              </p>
            </div>
          </div>
        </div>

        {/* ── Right panel: form ─────────────────────────────────────── */}
        <div className="flex-1 bg-white dark:bg-navy-900 p-6 md:p-8">
          {/* Mobile header */}
          <div className="flex items-center gap-2 mb-5 md:hidden">
            <GraduationCap size={20} className="text-brand-600" />
            <span className="text-sm font-bold text-slate-800 dark:text-white">KCET Predictor</span>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-navy-800 rounded-xl p-1 mb-6">
            {[
              { key: 'signin', label: 'Sign In' },
              { key: 'signup', label: 'Create Account' },
            ].map(t => (
              <button
                key={t.key}
                id={`auth-tab-${t.key}`}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.key
                    ? 'bg-white dark:bg-navy-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form" noValidate>
            <InputField
              id="auth-email"
              type="email"
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChange={setEmail}
              error={fieldErrors.email}
              icon={Mail}
            />

            <InputField
              id="auth-password"
              type={showPass ? 'text' : 'password'}
              label="Password"
              placeholder={tab === 'signup' ? 'Min. 6 characters' : 'Your password'}
              value={password}
              onChange={setPassword}
              error={fieldErrors.password}
              icon={Lock}
              rightAction={{
                onClick: () => setShowPass(v => !v),
                icon: showPass ? <EyeOff size={15} /> : <Eye size={15} />,
              }}
            />

            {tab === 'signup' && (
              <div>
                <label htmlFor="auth-referral" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Referral Code <span className="font-normal text-slate-400">(optional — help a friend earn credits)</span>
                </label>
                <div className="relative">
                  <Gift size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    id="auth-referral"
                    type="text"
                    placeholder="e.g. ABCD12"
                    value={refCode}
                    onChange={e => setRefCode(e.target.value.toUpperCase().slice(0, 6))}
                    maxLength={6}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-navy-400 outline-none focus:ring-2 focus:ring-brand-200 dark:focus:ring-brand-800 focus:border-brand-400 transition-all font-mono tracking-widest"
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2.5">
                <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl transition-colors"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> {tab === 'signin' ? 'Signing in…' : 'Creating account…'}</>
                : tab === 'signin' ? 'Sign In & Continue' : 'Create Free Account'
              }
            </button>

            {tab === 'signin' && (
              <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                Don't have an account?{' '}
                <button type="button" onClick={() => setTab('signup')}
                  className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                  Create one free
                </button>
              </p>
            )}
          </form>

          <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center mt-4 leading-snug">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
