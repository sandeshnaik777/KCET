import { Sun, Moon, Bell } from 'lucide-react'
import useAppStore from '../../store/useAppStore'

export default function Topbar({ title, subtitle }) {
  const { darkMode, toggleDarkMode } = useAppStore()

  return (
    <header className="topbar">
      <div className="flex-1 min-w-0">
        {title && <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">{title}</h1>}
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
        {!title && (
          <span className="text-base font-bold text-slate-900 dark:text-white md:hidden">KCET Predictor</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          id="dark-mode-toggle"
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     text-slate-500 dark:text-slate-400
                     hover:bg-slate-100 dark:hover:bg-navy-700
                     transition-colors duration-150"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     text-slate-500 dark:text-slate-400
                     hover:bg-slate-100 dark:hover:bg-navy-700
                     transition-colors duration-150"
          aria-label="Notifications"
          id="notifications-btn"
        >
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}
