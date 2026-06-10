import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAppStore = create(
  persist(
    (set) => ({
      // Dark mode
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      // Last used predictor inputs (persisted for UX continuity)
      lastRank:     '',
      lastCategory: 'General (GM)',
      lastYear:     2024,
      lastRound:    'First Round',
      setLastInputs: (inputs) => set(inputs),

      // College cache (runtime only — don't persist, could be stale)
      collegesCache: {},
      setCollegesCache: (year, data) =>
        set((s) => ({ collegesCache: { ...s.collegesCache, [year]: data } })),
    }),
    {
      name: 'kcet-app-store',
      partialize: (s) => ({
        darkMode:     s.darkMode,
        lastRank:     s.lastRank,
        lastCategory: s.lastCategory,
        lastYear:     s.lastYear,
        lastRound:    s.lastRound,
      }),
    }
  )
)

export default useAppStore
