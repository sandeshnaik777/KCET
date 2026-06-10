import { useNavigate } from 'react-router-dom'
import { Zap, Gift, X, MessageCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const WA_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export default function ZeroCreditsModal() {
  const { showZeroCredits, setShowZeroCredits, profile } = useAuth()
  const navigate = useNavigate()

  if (!showZeroCredits) return null

  const referralLink = profile?.referral_code
    ? `${window.location.origin}?ref=${profile.referral_code}`
    : window.location.origin

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    alert('Referral link copied! Share it with friends.')
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join KCET Predictor',
        text: `Use my referral code ${profile?.referral_code} to get bonus credits on KCET Predictor!`,
        url: referralLink,
      })
    } else {
      handleCopy()
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-950/90 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-navy-900 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Top bar */}
        <div className="bg-gradient-to-r from-red-600 to-brand-700 px-6 py-5 text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Zap size={28} className="text-yellow-300" />
          </div>
          <h2 className="text-xl font-black text-white">Credits Exhausted!</h2>
          <p className="text-sm text-red-100 mt-1">
            You've used all your credits. Earn more to keep exploring college cutoffs.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Option 1 — Refer */}
          {profile?.referral_code && (
            <div className="border border-brand-200 dark:border-brand-800 rounded-xl p-4 bg-brand-50 dark:bg-brand-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={16} className="text-brand-600 dark:text-brand-400" />
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  Refer a Friend — Get +25 Credits
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Share your referral code. Each friend who signs up gives you 25 free credits!
              </p>
              {/* Code display */}
              <div className="bg-white dark:bg-navy-800 rounded-lg px-4 py-2 text-center mb-3 border border-brand-100 dark:border-navy-700">
                <p className="text-2xl font-black tracking-widest text-brand-700 dark:text-brand-300">
                  {profile.referral_code}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  id="zero-credits-copy-btn"
                  className="flex-1 py-2 text-xs font-semibold rounded-lg border border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={handleShare}
                  id="zero-credits-share-btn"
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors"
                >
                  Share Code
                </button>
              </div>
            </div>
          )}

          {/* Option 2 — WhatsApp */}
          <div className="border border-green-200 dark:border-green-800 rounded-xl p-4 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                Buy Credits or Subscribe
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Contact us on WhatsApp to instantly add credits or get unlimited access.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="https://wa.me/919739331354"
                target="_blank"
                rel="noopener noreferrer"
                id="zero-credits-wa1"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
              >
                {WA_ICON}
                WhatsApp: +91 97393 31354
              </a>
              <a
                href="https://wa.me/918123824899"
                target="_blank"
                rel="noopener noreferrer"
                id="zero-credits-wa2"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition-colors"
              >
                {WA_ICON}
                WhatsApp: +91 81238 24899
              </a>
            </div>
          </div>

          {/* Go to profile */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setShowZeroCredits(false); navigate('/profile') }}
              id="zero-credits-profile-btn"
              className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
            >
              My Profile
            </button>
            <button
              onClick={() => setShowZeroCredits(false)}
              id="zero-credits-dismiss-btn"
              className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
