import { Sun, Moon, GraduationCap } from 'lucide-react'
import useAppStore from '../../store/useAppStore'

export default function Header() {
  const { darkMode, toggleDarkMode } = useAppStore()

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-indigo-500 flex items-center justify-center shadow-sm">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div className="leading-none">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">KCET Guide</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Counseling Platform</p>
          </div>
        </div>

        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-full flex items-center justify-center
                     bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300
                     hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-150"
          aria-label="Toggle dark mode"
          id="dark-mode-toggle"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}
