import { NavLink } from 'react-router-dom'
import { Home, Sparkles, BarChart3, TrendingUp, HelpCircle, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function BottomNav() {
  const { user, setShowAuthModal } = useAuth()

  const NAV_ITEMS = [
    { to: '/',          icon: Home,       label: 'Home',     id: 'mnav-home' },
    { to: '/predict',   icon: Sparkles,   label: 'Predict',  id: 'mnav-predict' },
    { to: '/explore',   icon: BarChart3,  label: 'Cutoffs',  id: 'mnav-cutoffs' },
    { to: '/analytics', icon: TrendingUp, label: 'Analytics',id: 'mnav-analytics' },
    { to: '/help',      icon: HelpCircle, label: 'Help',     id: 'mnav-help' },
    { to: '/profile',   icon: User,       label: user ? 'Profile' : 'Sign In',  id: 'mnav-profile' },
  ]

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      {NAV_ITEMS.map(({ to, icon: Icon, label, id }) => (
        to === '/profile' && !user ? (
          <button
            key={id}
            id={id}
            onClick={() => setShowAuthModal(true)}
            className="nav-item"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-200">
              <Icon size={17} strokeWidth={1.8} />
            </div>
            <span className="text-[10px] font-semibold leading-none">{label}</span>
          </button>
        ) : (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            id={id}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <div className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-200
                  ${isActive ? 'bg-brand-100 dark:bg-brand-900/40 scale-110' : ''}`}>
                  <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-semibold leading-none
                  ${isActive ? 'text-brand-600 dark:text-brand-400' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        )
      ))}
    </nav>
  )
}
