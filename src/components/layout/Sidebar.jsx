import { NavLink } from 'react-router-dom'
import {
  Home, Sparkles, BarChart3, TrendingUp, HelpCircle,
  GraduationCap, BookOpen, User, Zap
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/',          icon: Home,       label: 'Home',            id: 'nav-home' },
  { to: '/predict',   icon: Sparkles,   label: 'Predictor',       id: 'nav-predict' },
  { to: '/explore',   icon: BarChart3,  label: 'Cutoffs',         id: 'nav-cutoffs' },
  { to: '/analytics', icon: TrendingUp, label: 'Analytics',       id: 'nav-analytics' },
  { to: '/help',      icon: HelpCircle, label: 'Expert Guidance', id: 'nav-help' },
]

export default function Sidebar() {
  const { user, profile, setShowAuthModal } = useAuth()

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-navy-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">KCET Predictor</p>
            <p className="text-[10px] text-navy-400 font-medium">College Admissions 2026</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map(({ to, icon: Icon, label, id }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            id={id}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}

        {/* Profile / Login link */}
        {user ? (
          <NavLink
            to="/profile"
            id="nav-profile"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <User size={17} strokeWidth={1.8} />
            <span className="flex-1">Profile</span>
            {profile && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-brand-900/50 text-brand-400 px-1.5 py-0.5 rounded-full">
                <Zap size={9} />{profile.credits}
              </span>
            )}
          </NavLink>
        ) : (
          <button
            id="nav-login-btn"
            onClick={() => setShowAuthModal(true)}
            className="sidebar-link w-full text-left"
          >
            <User size={17} strokeWidth={1.8} />
            <span className="flex-1">Sign In</span>
            <span className="text-[10px] font-bold bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">Free</span>
          </button>
        )}
      </nav>

      {/* CTA */}
      <div className="p-3 border-t border-navy-700">
        <NavLink
          to="/predict"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 
                     rounded-lg bg-brand-600 hover:bg-brand-500 transition-colors
                     text-sm font-semibold text-white"
          id="sidebar-cta"
        >
          <BookOpen size={15} />
          Start Predicting
        </NavLink>
      </div>
    </aside>
  )
}
