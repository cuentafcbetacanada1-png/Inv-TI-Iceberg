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
  <Link to={to} className="block group mb-1.5">
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300",
      active
        ? "sidebar-active-emerald font-bold scale-[1.02] shadow-blue-500/20"
        : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
    )}>
      <Icon className={cn("w-4 h-4", active ? "text-black" : "group-hover:text-blue-600")} />
      <span className={cn("text-[10px] tracking-widest uppercase", active ? "font-semibold" : "font-medium")}>{label}</span>
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
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden selection:bg-blue-100">
      {/* Sidebar Compacto */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col p-6 z-30 shadow-xl">
        <div className="flex items-center gap-2 mb-10 px-1">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_var(--primary-glow)] rotate-3">
              <Zap size={18} className="text-black" />
           </div>
           <div className="flex flex-col">
               <span className="text-lg font-bold tracking-tight uppercase text-blue-600 leading-none">Iceberg IT</span>
               <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-slate-400 mt-1">Enterprise Infra</span>
           </div>
        </div>

        <nav className="flex-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Panel General" active={location.pathname === '/'} />
          <SidebarItem to="/inventario" icon={Database} label="Inventario" active={location.pathname === '/inventario'} />
          <SidebarItem to="/crear" icon={PlusCircle} label="Registrar Equipo" active={location.pathname === '/crear'} />
          <SidebarItem to="/logs" icon={Activity} label="Auditoría Red" active={location.pathname === '/logs'} />
        </nav>
        
        <div className="mt-auto space-y-4">
           <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 relative overflow-hidden group hover:border-blue-200 transition-all">
              <div className="absolute -right-3 -top-3 w-10 h-10 bg-blue-500/5 rounded-full blur-xl" />
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 mb-2">
                 <Bell size={14} />
              </div>
              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-0.5">Control</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase">Sistema Activo</p>
           </div>
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2.5 px-4 py-2 text-slate-400 hover:text-red-600 transition-all w-full font-bold text-[10px] uppercase tracking-[0.2em] group"
            >
               <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
               <span>Cerrar Sesión</span>
            </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-5">
             <h2 className="text-xl font-bold tracking-tight uppercase text-slate-800">
                {location.pathname === '/' ? 'Panel de Control' : 'Inventario de Activos'}
             </h2>
             <div className="h-4 w-px bg-slate-200" />
             <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 w-64 md:w-72 focus-within:border-blue-400 transition-all">
                <Search size={14} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="BUSCAR EQUIPO..." 
                  value={currentSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-[10px] w-full placeholder:text-slate-300 font-bold uppercase tracking-widest text-blue-600"
                />
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Conexión Estable</span>
             </div>
             <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer shadow-sm">
              <User size={18} className="text-blue-600" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar relative">
          <div className="max-w-[1700px] mx-auto animate-in pt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}


export default DashboardLayout
