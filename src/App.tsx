import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { supabase } from './services/supabase'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import InventoryPage from './pages/InventoryPage'
import CreateEquipmentPage from './pages/CreateEquipmentPage'
import EditEquipmentPage from './pages/EditEquipmentPage'
import LogsPage from './pages/LogsPage'
import { Toaster } from 'react-hot-toast'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 font-sans overflow-hidden">
        <div className="flex flex-col items-center gap-12 relative z-10">
          <div className="relative">
             <div className="w-24 h-24 border-2 border-blue-500/20 rounded-full animate-ping absolute inset-0" />
             <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin relative z-10" />
          </div>
          <div className="text-center space-y-2">
             <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.5em] animate-pulse">Sincronizando Sistema</p>
             <p className="text-lg font-extrabold text-slate-800 uppercase italic tracking-tighter">Iceberg Sistema v10.4</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const App: React.FC = () => {
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    // Asegurar que estamos en light mode
    document.documentElement.classList.remove('dark')

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  return (
    <>
      <Toaster position="bottom-right" toastOptions={{
        duration: 5000,
        style: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          color: '#0f172a',
          borderRadius: '24px',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          padding: '20px 24px',
          fontSize: '11px',
          fontWeight: '900',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        },
      }} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="inventario" element={<InventoryPage />} />
            <Route path="crear" element={<CreateEquipmentPage />} />
            <Route path="editar/:id" element={<EditEquipmentPage />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
