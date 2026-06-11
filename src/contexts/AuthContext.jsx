import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export const FREE_PREDICTIONS    = 3
export const FREE_COLLEGE_VIEWS  = 5
export const FREE_MINUTES        = 6
export const CREDITS_PER_REFERRAL = 100

const SK = {
  startTime:    'kcet_start_time',
  predictions:  'kcet_pred_count',
  collegeViews: 'kcet_view_count',
}

export function generateReferralCode(userId) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const hex   = userId.replace(/-/g, '')
  let code = ''
  for (let i = 0; i < 6; i++) {
    const byte = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
    code += chars[byte % chars.length]
  }
  return code
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,            setUser]            = useState(null)
  const [profile,         setProfile]         = useState(null)
  const [authLoading,     setAuthLoading]     = useState(true)
  const [showAuthModal,   setShowAuthModal]   = useState(false)
  const [showZeroCredits, setShowZeroCredits] = useState(false)
  const [predCount,       setPredCount]       = useState(0)
  const [viewCount,       setViewCount]       = useState(0)

  const pendingReferralRef = useRef(null)
  const startTimeRef       = useRef(null)
  const profileRef         = useRef(null)   // always holds latest profile for spendCredit

  // Keep profileRef in sync with profile state
  useEffect(() => { profileRef.current = profile }, [profile])

  // ── Init guest usage tracking from localStorage ────────────────────────────
  useEffect(() => {
    let st = localStorage.getItem(SK.startTime)
    if (!st) {
      st = Date.now().toString()
      localStorage.setItem(SK.startTime, st)
    }
    startTimeRef.current = Number(st)
    setPredCount(Number(localStorage.getItem(SK.predictions) || '0'))
    setViewCount(Number(localStorage.getItem(SK.collegeViews) || '0'))
  }, [])

  // ── Read profile from DB — pure read, never writes credits ────────────────
  // Called on login and by refreshProfile(). Credits come 100% from the DB.
  // Admin can set credits directly in Supabase dashboard.
  const loadProfile = useCallback(async (u) => {
    if (!u?.id) { setAuthLoading(false); return }

    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle()

      if (fetchErr) {
        console.warn('[Auth] Profile fetch error:', fetchErr.message)
        setAuthLoading(false)
        return
      }

      // ── First-time user: INSERT a new profile ─────────────────────────────
      if (!existing) {
        const myCode  = generateReferralCode(u.id)
        const refCode = pendingReferralRef.current
        pendingReferralRef.current = null

        // Validate referral code
        // Referrer gets +100 automatically via the add_referral_bonus DB trigger
        let bonusCredits = 50
        if (refCode) {
          const { data: refOwner } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', refCode.toUpperCase())
            .maybeSingle()
          if (refOwner) bonusCredits = 50
        }

        const { data: created, error: insertErr } = await supabase
          .from('profiles')
          .insert({
            id:            u.id,
            email:         u.email,
            referral_code: myCode,
            referred_by:   refCode ? refCode.toUpperCase() : null,
            credits:       bonusCredits,
          })
          .select()
          .maybeSingle()

        if (insertErr) {
          // Unique constraint hit = profile exists (race condition), try reading it
          if (insertErr.code === '23505') {
            const { data: retried } = await supabase
              .from('profiles').select('*').eq('id', u.id).maybeSingle()
            if (retried) {
              const p = { ...retried, total_referrals: 0 }
              setProfile(p); profileRef.current = p
            }
          } else {
            console.warn('[Auth] Profile insert error:', insertErr.message)
          }
          setAuthLoading(false)
          return
        }

        const p = created ? { ...created, total_referrals: 0 } : null
        setProfile(p)
        profileRef.current = p
        setAuthLoading(false)
        return
      }

      // ── Returning user: read credits directly from DB ─────────────────────
      // NOTE: We do NOT recalculate or overwrite credits here.
      // The DB value is the ground truth (admin-set or decremented by spendCredit).
      const { count: refCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by', existing.referral_code)

      const p = { ...existing, total_referrals: refCount || 0 }
      setProfile(p)
      profileRef.current = p
    } catch (err) {
      console.warn('[Auth] loadProfile error:', err.message)
    } finally {
      setAuthLoading(false)
    }
  }, [])

  // ── Re-read profile from DB (pick up referral bonuses, admin credit top-ups)
  const refreshProfile = useCallback(async () => {
    const current = profileRef.current
    if (!current?.id) return
    try {
      const { data } = await supabase
        .from('profiles').select('*').eq('id', current.id).maybeSingle()
      if (!data) return
      const { count: refCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('referred_by', data.referral_code)
      const p = { ...data, total_referrals: refCount || 0 }
      setProfile(p)
      profileRef.current = p
    } catch (err) {
      console.warn('[Auth] refreshProfile error:', err.message)
    }
  }, [])

  // ── Auth state listener — ONE source of truth, no duplicate getSession ─────
  // In Supabase v2, onAuthStateChange fires INITIAL_SESSION on mount if a
  // session exists, so we do NOT need a separate getSession() call.
  // Having both causes two concurrent loadProfile() calls which can race.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const u = session?.user ?? null
        setUser(u)

        if (u) {
          setShowAuthModal(false)
          await loadProfile(u)
        } else {
          setProfile(null)
          profileRef.current = null
          setAuthLoading(false)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [loadProfile])

  // ── Time-based gate for guests ─────────────────────────────────────────────
  useEffect(() => {
    if (user) return
    const st        = startTimeRef.current || Date.now()
    const elapsed   = Date.now() - st
    const remaining = Math.max(0, FREE_MINUTES * 60 * 1000 - elapsed)
    if (remaining === 0) { setShowAuthModal(true); return }
    const timer = setTimeout(() => setShowAuthModal(true), remaining)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── Guest usage trackers ───────────────────────────────────────────────────
  const trackPrediction = useCallback(() => {
    if (user) return true
    const next = predCount + 1
    setPredCount(next)
    localStorage.setItem(SK.predictions, next.toString())
    if (next > FREE_PREDICTIONS) { setShowAuthModal(true); return false }
    return true
  }, [user, predCount])

  const trackCollegeView = useCallback(() => {
    if (user) return true
    const next = viewCount + 1
    setViewCount(next)
    localStorage.setItem(SK.collegeViews, next.toString())
    if (next > FREE_COLLEGE_VIEWS) { setShowAuthModal(true); return false }
    return true
  }, [user, viewCount])

  // ── Spend credits (logged-in users only) ──────────────────────────────────
  // amount: credits to deduct. Uses profileRef to always read latest balance.
  // Returns false + shows zero-credits modal if balance is insufficient.
  const spendCredit = useCallback(async (amount = 1) => {
    if (!user) return true   // guests handled by trackCollegeView / trackPrediction
    const current = profileRef.current
    if (!current) return true

    const currentCredits = current.credits ?? 0

    if (currentCredits <= 0) {
      setShowZeroCredits(true)
      return false
    }

    const newCredits = Math.max(0, currentCredits - amount)

    // Optimistic UI update
    const updated = { ...current, credits: newCredits }
    setProfile(updated)
    profileRef.current = updated

    // Persist to DB
    const { error } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', user.id)

    if (error) {
      console.warn('[Auth] spendCredit DB error:', error.message)
      // Revert optimistic update on failure
      setProfile(current)
      profileRef.current = current
      return true  // don't block on network error
    }

    if (newCredits <= 0) setShowZeroCredits(true)

    return true
  }, [user])

  // ── Auth actions ───────────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, referralCode = '') => {
    if (referralCode.trim()) {
      pendingReferralRef.current = referralCode.trim().toUpperCase()
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { pendingReferralRef.current = null; throw error }
    if (!data.user) { pendingReferralRef.current = null; throw new Error('No user returned') }
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    profileRef.current = null
  }

  return (
    <AuthContext.Provider value={{
      user, profile, authLoading,
      showAuthModal,   setShowAuthModal,
      showZeroCredits, setShowZeroCredits,
      signIn, signUp, signOut,
      trackPrediction, trackCollegeView, spendCredit,
      loadProfile, refreshProfile,
      predCount, viewCount,
      FREE_PREDICTIONS, FREE_COLLEGE_VIEWS, FREE_MINUTES, CREDITS_PER_REFERRAL,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
