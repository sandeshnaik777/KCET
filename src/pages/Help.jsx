import { useState } from 'react'
import { PhoneCall, CheckCircle2, ChevronDown, ChevronUp, Mail, TrendingUp, Loader2 } from 'lucide-react'
import Topbar from '../components/layout/Topbar'

const EXPERT_EMAIL = 'sandeshnaik525@gmail.com'

const TIMELINE = [
  {
    id: 'mock',
    title: 'Mock Allotment Round',
    desc: 'A trial run to help you understand where you stand based on your initial option entry. You can modify your choices after this round.',
    choices: null,
  },
  {
    id: 'r1',
    title: 'First Round Allotment',
    desc: "Actual seats are allocated based on merit and your finalized option list. You must choose a 'Choice' (1, 2, 3, or 4) to proceed.",
    choices: ['Choice 1: Accept & Join', 'Choice 2: Hold & Upgrade'],
  },
  {
    id: 'r2',
    title: 'Second Round',
    desc: 'For students who opted for Choice 2 or 3 in Round 1, or newly verified candidates. Upgrades are possible here.',
    choices: null,
  },
  {
    id: 'ext',
    title: 'Second Extended Round (Round 3)',
    desc: 'Final mop-up round for remaining vacant seats. Strict rules apply regarding seat acceptance.',
    choices: null,
  },
]

const FAQS = [
  {
    q: 'Is option entry order important?',
    a: 'Yes, crucial. The algorithm checks your options from top to bottom. Always put your most desired college first, regardless of rank.',
  },
  {
    q: "What happens if I don't select a choice in Round 1?",
    a: 'If an allotted seat is not actioned upon, it is considered rejected, and you may be removed from subsequent rounds.',
  },
  {
    q: 'Can I participate in Round 2 after accepting in Round 1?',
    a: 'Only if you chose "Hold & Upgrade" (Choice 2 or 3) in Round 1. If you accepted and joined, you cannot participate further.',
  },
  {
    q: 'How does the category fallback work?',
    a: 'If no seats are reserved for your category in a specific branch, you automatically compete under General Merit cutoffs for that seat.',
  },
]

function TimelineItem({ item, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full border-2 border-brand-500 dark:border-brand-400 bg-white dark:bg-navy-800 flex items-center justify-center flex-shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 dark:bg-brand-400" />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-slate-200 dark:bg-navy-600 mt-1" />}
      </div>
      <div className={`pb-5 flex-1`}>
        <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mb-1">{item.title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
        {item.choices && (
          <div className="flex flex-wrap gap-2 mt-2">
            {item.choices.map(c => (
              <span key={c} className="text-xs bg-slate-100 dark:bg-navy-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full border border-slate-200 dark:border-navy-600 font-medium">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FaqItem({ q, a, idx }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-100 dark:border-navy-700 last:border-0">
      <button
        className="w-full flex items-start justify-between gap-3 py-3.5 text-left hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        onClick={() => setOpen(o => !o)}
        id={`faq-${idx}`}
      >
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1">{q}</p>
        {open
          ? <ChevronUp size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />
          : <ChevronDown size={15} className="text-slate-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="pb-4 animate-slide-up">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function Help() {
  const [form,       setForm]       = useState({ name: '', phone: '', email: '', rank: '', query: '' })
  const [submitted,  setSubmitted]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitErr,  setSubmitErr]  = useState('')
  const [errors,     setErrors]     = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())              e.name  = 'Full name is required'
    if (!/^\d{10}$/.test(form.phone))  e.phone = 'Enter a valid 10-digit number'
    if (!form.rank || isNaN(form.rank)) e.rank  = 'Enter a valid rank number'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSubmitting(true)
    setSubmitErr('')

    try {
      // Submit to Formsubmit.co — emails to EXPERT_EMAIL
      // NOTE: First-ever submission triggers a one-time verification email to sandeshnaik525@gmail.com.
      // After confirming, all future submissions go directly to your inbox.
      const res = await fetch(`https://formsubmit.co/ajax/${EXPERT_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject:      '📚 KCET Counseling Request — New Callback',
          _template:     'table',
          _captcha:      'false',
          'Full Name':   form.name,
          'Phone':       `+91 ${form.phone}`,
          'Email':       form.email || 'Not provided',
          'KCET Rank':   form.rank,
          'Query':       form.query || 'No specific query',
          'Submitted At': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        }),
      })

      const result = await res.json()

      if (result.success === 'true' || result.success === true) {
        setSubmitted(true)
      } else {
        throw new Error(result.message || 'Submission failed')
      }
    } catch (err) {
      setSubmitErr(
        err.message?.includes('Failed to fetch')
          ? 'Network error — please check your connection and try again.'
          : `Submission error: ${err.message}`
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field, val) => {
    setForm(f => ({ ...f, [field]: val }))
    setErrors(e => ({ ...e, [field]: undefined }))
  }

  return (
    <div>
      <Topbar title="Counseling Support" subtitle="Get expert guidance through your KCET counseling journey" />
      <div className="page-inner">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Need Expert Guidance?</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Navigate the KCET counseling process with confidence. Our experts are here to help you make the best choices for your engineering admissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lead Form */}
          <div className="card" id="help-form-card">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Request a Callback</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-4">
              Your request will be sent to our counseling team at{' '}
              <span className="font-mono text-brand-500">{EXPERT_EMAIL}</span>
            </p>

            {submitted ? (
              <div className="text-center py-8 animate-fade-in">
                <CheckCircle2 size={36} className="text-green-500 mx-auto mb-3" />
                <p className="text-base font-bold text-slate-800 dark:text-white mb-1">Request Submitted! ✅</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Your request has been emailed to <span className="font-mono">{EXPERT_EMAIL}</span>.
                  We'll reach out to <strong>{form.name.split(' ')[0]}</strong> at +91 {form.phone} within 24 hours.
                </p>
                <button
                  className="btn-outline mt-4 text-xs"
                  onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', email: '', rank: '', query: '' }) }}
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3" id="counseling-form">
                <div>
                  <label className="label">Full Name *</label>
                  <input id="help-name" type="text" placeholder="Enter your full name"
                    value={form.name} onChange={e => handleChange('name', e.target.value)}
                    className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-300' : ''}`} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="label">Phone Number *</label>
                  <div className="flex">
                    <span className="flex items-center px-3 bg-slate-100 dark:bg-navy-700 border border-r-0 border-slate-200 dark:border-navy-600 rounded-l-lg text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">+91</span>
                    <input id="help-phone" type="tel" placeholder="XXXXX XXXXX" maxLength={10}
                      value={form.phone} onChange={e => handleChange('phone', e.target.value.replace(/\D/g, ''))}
                      className={`input-field rounded-l-none ${errors.phone ? 'border-red-400 focus:ring-red-300' : ''}`} />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <input id="help-email" type="email" placeholder="your@email.com"
                    value={form.email} onChange={e => handleChange('email', e.target.value)}
                    className="input-field" />
                </div>

                <div>
                  <label className="label">KCET Rank *</label>
                  <input id="help-rank" type="number" placeholder="e.g. 4500" min="1" max="200000"
                    value={form.rank} onChange={e => handleChange('rank', e.target.value)}
                    className={`input-field ${errors.rank ? 'border-red-400 focus:ring-red-300' : ''}`} />
                  {errors.rank && <p className="text-xs text-red-500 mt-1">{errors.rank}</p>}
                </div>

                <div>
                  <label className="label">Your Query</label>
                  <textarea id="help-query" rows={3} placeholder="Briefly describe what you need help with..."
                    value={form.query} onChange={e => handleChange('query', e.target.value)}
                    className="input-field resize-none" />
                </div>

                {submitErr && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                    <p className="text-xs text-red-600 dark:text-red-400">{submitErr}</p>
                  </div>
                )}

                <button type="submit" className="btn-primary w-full" id="help-submit" disabled={submitting}>
                  {submitting
                    ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                    : <><PhoneCall size={15} /> Submit Request</>}
                </button>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-snug">
                  * First submission activates email delivery to {EXPERT_EMAIL}.<br />
                  Check your inbox for a one-time confirmation from Formsubmit.
                </p>
              </form>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* How Allotment Works */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-brand-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">How the Allotment Works</h3>
              </div>
              {TIMELINE.map((item, idx) => (
                <TimelineItem key={item.id} item={item} isLast={idx === TIMELINE.length - 1} />
              ))}
            </div>

            {/* Direct Contact */}
            <div className="card bg-navy-900 dark:bg-navy-950 border-navy-800">
              <h3 className="text-sm font-bold text-white mb-1">Direct Contact</h3>
              <p className="text-xs text-navy-300 mb-4">Our support team is available Mon–Sat, 9 AM to 6 PM.</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-navy-800 rounded-lg px-4 py-2.5">
                  <Mail size={14} className="text-brand-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-white break-all">{EXPERT_EMAIL}</span>
                </div>
                <div className="flex items-center gap-3 bg-navy-800 rounded-lg px-4 py-2.5">
                  <Mail size={14} className="text-brand-400 flex-shrink-0" />
                  <span className="text-sm font-semibold text-white break-all">sathvikshetty0404@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Quick FAQ */}
            <div className="card">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">Quick FAQ</h3>
              {FAQS.map((faq, idx) => <FaqItem key={idx} q={faq.q} a={faq.a} idx={idx} />)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-slate-200 dark:border-navy-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-white">KCET Predictor</p>
              <p className="text-xs text-slate-400">© 2026 KCET Predictor. All rights reserved.</p>
            </div>
            <div className="flex gap-5 text-xs text-slate-400">
              <span className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-200">Privacy Policy</span>
              <span className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-200">Terms of Service</span>
              <span className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-200">Expert Guidance FAQ</span>
              <span className="cursor-pointer hover:text-slate-600 dark:hover:text-slate-200">Contact Us</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
