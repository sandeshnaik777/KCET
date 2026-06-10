import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="card border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-center py-8 animate-fade-in">
      <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center mx-auto mb-3">
        <AlertTriangle size={22} className="text-red-500 dark:text-red-400" />
      </div>
      <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">Unable to load data</h3>
      <p className="text-xs text-red-500 dark:text-red-400 mb-4 max-w-xs mx-auto">
        {message || 'An error occurred while fetching data. Please try again.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 inline-flex items-center gap-1.5 mx-auto">
          <RefreshCw size={13} />
          Retry
        </button>
      )}
    </div>
  )
}
