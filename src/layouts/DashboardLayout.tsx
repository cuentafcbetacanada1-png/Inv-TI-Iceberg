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
  <Link to={to} className="block group mb-1">
    <div className={cn(
      "flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-300",
      active
        ? "sidebar-active-emerald font-bold scale-[1.01]"
        : "text-[#4e564e] hover:text-[#00ff88] hover:bg-white/5"
    )}>
      <Icon className={cn("w-3.5 h-3.5", active ? "text-black" : "group-hover:text-[#00ff88]")} />
      <span className={cn("text-[9px] tracking-widest uppercase", active ? "font-bold" : "font-semibold")}>{label}</span>
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
      <aside className="w-52 bg-[#090a09] border-r border-[#0e312a]/30 flex flex-col p-4 z-30">
        <div className="flex items-center gap-2 mb-8 px-1">
           <div className="w-7 h-7 bg-[#00ff88] rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(0,255,136,0.4)] rotate-3">
              <Zap size={16} className="text-black" />
           </div>
           <div className="flex flex-col">
              <span className="text-base font-bold tracking-tighter italic uppercase text-[#00ff88] text-glow">Iceberg IT</span>
              <span className="text-[7px] font-semibold uppercase tracking-[0.3em] text-[#4e564e] -mt-0.5">V3.0 MATRIX</span>
           </div>
        </div>

        <nav className="flex-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="General" active={location.pathname === '/'} />
          <SidebarItem to="/inventario" icon={Database} label="Nodos" active={location.pathname === '/inventario'} />
          <SidebarItem to="/crear" icon={PlusCircle} label="Alta" active={location.pathname === '/crear'} />
          <SidebarItem to="/logs" icon={Activity} label="Auditoría" active={location.pathname === '/logs'} />
        </nav>
        
        <div className="mt-auto space-y-3">
           <div className="p-3 rounded-xl bg-[#0e312a]/10 border border-[#00ff88]/5 relative overflow-hidden group hover:border-[#00ff88]/20 transition-all backdrop-blur-md">
              <div className="absolute -right-3 -top-3 w-8 h-8 bg-[#00ff88]/5 rounded-full blur-xl" />
              <div className="w-6 h-6 rounded-lg bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88] mb-1.5">
                 <Bell size={12} />
              </div>
              <p className="text-[8px] font-bold text-white uppercase tracking-widest mb-0.5">Estado</p>
              <p className="text-[7px] font-semibold text-[#4e564e] uppercase">SISTEMAS OK</p>
           </div>
           <button 
             onClick={() => signOut()}
             className="flex items-center gap-2 px-3 py-1.5 text-[#4e564e] hover:text-[#00ff88] transition-all w-full font-bold text-[9px] uppercase tracking-[0.2em] group"
           >
              <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Cerrar</span>
           </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-12 flex items-center justify-between px-6 z-20 border-b border-white/[0.02]">
          <div className="flex items-center gap-4">
             <h2 className="text-sm font-bold tracking-tighter uppercase italic text-white/70">
                {location.pathname === '/' ? 'Terminal / Dash' : 'Nodos / List'}
             </h2>
             <div className="h-3 w-px bg-[#0e312a]/50" />
             <div className="flex items-center gap-2.5 bg-[#121412]/50 px-3 py-1.5 rounded-lg border border-[#0e312a]/30 w-52 focus-within:border-[#00ff88]/40 transition-all backdrop-blur-xl">
                <Search size={12} className="text-[#4e564e]" />
                <input 
                  type="text" 
                  placeholder="COMANDO / BUSCAR" 
                  value={currentSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-[9px] w-full placeholder:text-[#2a302a] font-semibold uppercase tracking-widest text-[#00ff88]"
                />
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121412]/30 rounded-lg border border-[#0e312a]/30 whitespace-nowrap">
                <div className="w-1 h-1 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]" />
                <span className="text-[7px] font-bold uppercase tracking-widest text-[#00ff88]">ON-LINE</span>
             </div>
             <div className="w-8 h-8 flex items-center justify-center bg-zinc-900/30 rounded-lg border border-white/5 hover:border-[#00ff88]/30 transition-colors cursor-pointer">
              <User size={14} className="text-[#00ff88]" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar relative">
          <div className="max-w-[1700px] mx-auto animate-in pt-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
