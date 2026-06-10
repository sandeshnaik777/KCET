import { SearchX } from 'lucide-react'

export default function EmptyState({ title = 'No results found', description, icon: Icon = SearchX }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">{description}</p>
      )}
    </div>
  )
}
