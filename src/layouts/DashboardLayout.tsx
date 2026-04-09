import React, { useState, useEffect } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  PlusCircle,
  LogOut,
  Shield,
  Activity,
  Search,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Command
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'

const SidebarItem: React.FC<{ to: string, icon: React.ElementType, label: string, active?: boolean, collapsed?: boolean }> = ({ to, icon: Icon, label, active, collapsed }) => (
  <Link to={to} className="block group">
    <div className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300",
      active
        ? "bg-primary-500/10 text-primary-400 font-bold shadow-[0_0_20px_rgba(59,130,246,0.1)]"
        : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 font-bold"
    )}>
      <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", active && "text-primary-400")} />
      {!collapsed && <span className="text-sm tracking-tight">{label}</span>}
      {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />}
    </div>
  </Link>
)

const DashboardLayout: React.FC = () => {
  const { user, signOut } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = React.useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [latency, setLatency] = useState<number | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)

  // Monitor de Latencia y Estado Online
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const checkLatency = async () => {
      if (!navigator.onLine) return
      const start = Date.now()
      try {
        await fetch('https://xgyovzjguphckcsalxex.supabase.co/rest/v1/', { method: 'HEAD', mode: 'no-cors' })
        setLatency(Date.now() - start)
      } catch {
        setLatency(null)
      }
    }

    const interval = setInterval(checkLatency, 5000)
    checkLatency()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/inventario?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
  }

  return (
    <div className="flex h-screen bg-zinc-950 font-sans text-zinc-100 overflow-hidden selection:bg-primary-500/30">
      {/* Fondo Exótico */}
      <div className="bg-mesh" />

      {/* Premium Sidebar */}
      <aside className={cn(
        "relative border-r border-white/5 flex flex-col bg-black/40 backdrop-blur-3xl transition-all duration-500 ease-in-out z-30",
        collapsed ? "w-20" : "w-72"
      )}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all z-40 hover:scale-110 shadow-xl"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="p-6 flex flex-col h-full bg-gradient-to-b from-primary-500/5 to-transparent">
          <div className={cn("flex items-center gap-4 mb-10 transition-all", collapsed && "justify-center")}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/40 shrink-0 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Command className="text-white w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <h1 className="text-xl font-black text-white tracking-widest leading-tight italic drop-shadow-md">ICEBERG <span className="text-primary-500">IT</span></h1>
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] opacity-80">Quantum Inventory</span>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-8 overflow-y-auto custom-scrollbar pr-1">
            <div>
              {!collapsed && <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] block mb-4 px-3">Terminal</span>}
              <div className="space-y-1">
                <SidebarItem to="/" icon={LayoutDashboard} label="Panel Central" active={location.pathname === '/'} collapsed={collapsed} />
                <SidebarItem to="/inventario" icon={Database} label="Inventario" active={location.pathname === '/inventario'} collapsed={collapsed} />
                <SidebarItem to="/crear" icon={PlusCircle} label="Registrar Equipo" active={location.pathname === '/crear'} collapsed={collapsed} />
              </div>
            </div>

            <div>
              {!collapsed && <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] block mb-4 px-3">Telemetría</span>}
              <div className="space-y-1">
                <SidebarItem to="/logs" icon={Activity} label="Logs de Actividad" active={location.pathname === '/logs'} collapsed={collapsed} />
                <SidebarItem to="#" icon={Shield} label="Control de Acceso" collapsed={collapsed} />
                <SidebarItem to="#" icon={Settings} label="Configuración" collapsed={collapsed} />
              </div>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <div className={cn(
              "flex items-center bg-white/[0.03] border border-white/5 rounded-2xl p-3 transition-all",
              collapsed ? "justify-center" : "gap-3"
            )}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-black text-zinc-400">{user?.email?.charAt(0).toUpperCase()}</span>
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold text-zinc-100 truncate">{user?.email?.split('@')[0]}</span>
                  <span className="text-[9px] text-primary-500/70 uppercase font-black tracking-widest">Administrador Máster</span>
                </div>
              )}
              {!collapsed && (
                <button onClick={() => signOut()} className="p-2 text-zinc-600 hover:text-rose-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500",
              isOnline ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-rose-500/10 border-rose-500/20"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOnline ? "bg-emerald-500" : "bg-rose-500")} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest", isOnline ? "text-emerald-500" : "text-rose-500")}>
                {isOnline ? 'Sistema En Línea' : 'Sistema Desconectado'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <form onSubmit={handleSearch} className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar nodo o usuario..."
                className="w-80 bg-white/[0.03] border border-white/5 rounded-xl pl-12 pr-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-primary-500/50 focus:bg-white/[0.05] transition-all font-bold"
              />
            </form>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-xl transition-all"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-zinc-950" />
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-80 card-premium p-4 z-50 border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">Notificaciones</span>
                      <button onClick={() => setShowNotifications(false)} className="text-[10px] text-zinc-600 hover:text-zinc-400">Cerrar</button>
                    </div>
                    <div className="space-y-3">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 font-bold">
                        <p className="text-[11px] text-zinc-300 italic">Bienvenido al sistema v10.0</p>
                        <span className="text-[9px] text-zinc-600 block mt-1 uppercase">Ahora mismo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-white/5 mx-2" />
              <div className="text-right flex flex-col mr-2">
                <span className="text-[10px] font-black text-zinc-600 uppercase">Latencia</span>
                <span className={cn(
                  "text-[10px] font-black",
                  latency && latency < 100 ? "text-emerald-500" : latency && latency < 300 ? "text-amber-500" : "text-rose-500"
                )}>
                  {isOnline ? (latency ? `${latency}ms` : '-- ms') : '---'}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar animate-in">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none" />
      </div>
    </div>
  )
}

export default DashboardLayout
