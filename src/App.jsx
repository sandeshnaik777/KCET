import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import useAppStore from './store/useAppStore'
import { AuthProvider } from './contexts/AuthContext'
import AuthModal from './components/auth/AuthModal'
import ZeroCreditsModal from './components/auth/ZeroCreditsModal'
import Sidebar from './components/layout/Sidebar'
import BottomNav from './components/layout/BottomNav'
import Home from './pages/Home'
import Predictor from './pages/Predictor'
import BranchPredictor from './pages/BranchPredictor'
import Explorer from './pages/Explorer'
import Compare from './pages/Compare'
import Analytics from './pages/Analytics'
import Help from './pages/Help'
import Profile from './pages/Profile'

function AppInner() {
  const darkMode = useAppStore((s) => s.darkMode)

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) root.classList.add('dark')
    else          root.classList.remove('dark')
  }, [darkMode])

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-navy-950 transition-colors duration-200">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Main content area */}
        <div className="main-content">
          <Routes>
            <Route path="/"               element={<Home />} />
            <Route path="/predict"        element={<Predictor />} />
            <Route path="/branch-predict" element={<BranchPredictor />} />
            <Route path="/explore"        element={<Explorer />} />
            <Route path="/compare"        element={<Compare />} />
            <Route path="/analytics"      element={<Analytics />} />
            <Route path="/help"           element={<Help />} />
            <Route path="/profile"        element={<Profile />} />
          </Routes>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />

        {/* Auth Gate Modal */}
        <AuthModal />
        {/* Zero Credits Gate */}
        <ZeroCreditsModal />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </BrowserRouter>
  )
}
