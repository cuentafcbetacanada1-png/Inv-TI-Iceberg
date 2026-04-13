import React from 'react'
import { Link, useLocation, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  PlusCircle,
  Activity,
  Settings,
  Bell,
  Search,
  User,
  LogOut,
  Zap,
  Menu
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'

const SidebarItem: React.FC<{ to: string, icon: React.ElementType, label: string, active?: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link to={to} className="block group mb-2">
    <div className={cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300",
      active
        ? "sidebar-active-emerald font-bold scale-[1.02]"
        : "text-[#4e564e] hover:text-[#00ff88] hover:bg-white/5"
    )}>
      <Icon className={cn("w-4 h-4", active ? "text-black" : "group-hover:text-[#00ff88]")} />
      <span className={cn("text-[10px] tracking-widest uppercase", active ? "font-bold" : "font-semibold")}>{label}</span>
    </div>
  </Link>
)

const DashboardLayout: React.FC = () => {
  const { signOut } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const currentSearch = searchParams.get('search') || ''

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    
    // Si no estamos en inventario y se busca algo, redirigir a inventario
    if (location.pathname !== '/inventario' && location.pathname !== '/') {
      navigate(`/inventario?${params.toString()}`)
    } else {
      navigate(`${location.pathname}?${params.toString()}`, { replace: true })
    }
  }

  return (
    <div className="flex h-screen bg-[#090a09] font-sans text-white overflow-hidden selection:bg-[#00ff88]/30">
      {/* Sidebar Compacto */}
      <aside className="w-60 bg-[#090a09] border-r border-[#0e312a]/50 flex flex-col p-6 z-30">
        <div className="flex items-center gap-2 mb-10 px-1">
           <div className="w-8 h-8 bg-[#00ff88] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.5)] rotate-3">
              <Zap size={18} className="text-black" />
           </div>
           <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tighter italic uppercase text-[#00ff88] text-glow">Iceberg IT</span>
              <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-[#4e564e] -mt-1">Inven-TI</span>
           </div>
        </div>

        <nav className="flex-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="General" active={location.pathname === '/'} />
          <SidebarItem to="/inventario" icon={Database} label="Inventario" active={location.pathname === '/inventario'} />
          <SidebarItem to="/crear" icon={PlusCircle} label="Registrar" active={location.pathname === '/crear'} />
          <SidebarItem to="/logs" icon={Activity} label="Logs" active={location.pathname === '/logs'} />
        </nav>
        
        <div className="mt-auto space-y-4">
           <div className="p-4 rounded-2xl bg-[#0e312a]/20 border border-[#00ff88]/10 relative overflow-hidden group hover:border-[#00ff88]/30 transition-all backdrop-blur-md">
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-[#00ff88]/5 rounded-full blur-xl" />
              <div className="w-7 h-7 rounded-lg bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88] mb-2">
                 <Bell size={14} />
              </div>
              <p className="text-[9px] font-bold text-white uppercase tracking-widest mb-0.5">Alertas</p>
              <p className="text-[8px] font-semibold text-[#4e564e] uppercase leading-relaxed">Sistemas estables.</p>
           </div>
           <button 
             onClick={() => signOut()}
             className="flex items-center gap-2 px-4 py-2 text-[#4e564e] hover:text-[#00ff88] transition-all w-full font-bold text-[10px] uppercase tracking-[0.2em] group"
           >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Salir</span>
           </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold tracking-tighter uppercase italic text-white/90">
                {location.pathname === '/' ? 'Panel de Control' : 'Inventario IT'}
             </h2>
             <div className="h-4 w-px bg-[#0e312a]/50" />
             <div className="flex items-center gap-3 bg-[#121412]/50 px-4 py-2 rounded-xl border border-[#0e312a]/50 w-64 focus-within:border-[#00ff88]/50 transition-all backdrop-blur-xl">
                <Search size={14} className="text-[#4e564e]" />
                <input 
                  type="text" 
                  placeholder="BUSCAR..." 
                  value={currentSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-[10px] w-full placeholder:text-[#4e564e] font-semibold uppercase tracking-widest text-[#00ff88]"
                />
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121412]/30 rounded-xl border border-[#0e312a]/30 glass-pill whitespace-nowrap">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_10px_#00ff88]" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#00ff88]">Online</span>
             </div>
             <div className="p-2.5 bg-zinc-900/30 rounded-xl border border-white/5 hover:border-[#00ff88]/30 transition-colors cursor-pointer">
              <User size={16} className="text-[#00ff88]" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar relative">
          <div className="max-w-[1500px] mx-auto animate-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
