import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
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
  <Link to={to} className="block group mb-3">
    <div className={cn(
      "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300",
      active
        ? "sidebar-active-emerald font-black scale-105"
        : "text-[#4e564e] hover:text-[#00ff88] hover:bg-white/5"
    )}>
      <Icon className={cn("w-5 h-5", active ? "text-black" : "group-hover:text-[#00ff88]")} />
      <span className="text-xs tracking-widest uppercase font-black">{label}</span>
    </div>
  </Link>
)

const DashboardLayout: React.FC = () => {
  const { signOut } = useAuthStore()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-[#090a09] font-sans text-white overflow-hidden selection:bg-[#00ff88]/30">
      {/* Sidebar Profesional en Español */}
      <aside className="w-72 bg-[#090a09] border-r border-[#0e312a] flex flex-col p-8 z-30">
        <div className="flex items-center gap-3 mb-16 px-2">
           <div className="w-10 h-10 bg-[#00ff88] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.3)] rotate-3">
              <Zap size={22} className="text-black" />
           </div>
           <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter italic uppercase text-[#00ff88]">Iceberg IT</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#4e564e] -mt-1">Inventario</span>
           </div>
        </div>

        <nav className="flex-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Panel General" active={location.pathname === '/'} />
          <SidebarItem to="/inventario" icon={Database} label="Inventario" active={location.pathname === '/inventario'} />
          <SidebarItem to="/crear" icon={PlusCircle} label="Registrar Equipo" active={location.pathname === '/crear'} />
          <SidebarItem to="/logs" icon={Activity} label="Registros" active={location.pathname === '/logs'} />
        </nav>
        
        <div className="mt-auto space-y-6">
           <div className="p-5 rounded-3xl bg-[#0e312a]/30 border border-[#00ff88]/20 relative overflow-hidden group hover:border-[#00ff88]/40 transition-all">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#00ff88]/5 rounded-full" />
              <div className="w-8 h-8 rounded-lg bg-[#00ff88]/20 flex items-center justify-center text-[#00ff88] mb-3">
                 <Bell size={16} />
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Alertas Activas</p>
              <p className="text-[9px] font-bold text-[#4e564e] uppercase leading-relaxed">Sistemas estables. Sin incidencias reportadas.</p>
           </div>
           <button 
             onClick={() => signOut()}
             className="flex items-center gap-3 px-5 py-3 text-[#4e564e] hover:text-[#00ff88] transition-all w-full font-black text-xs uppercase tracking-[0.2em] group"
           >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Cerrar Sesión</span>
           </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-24 flex items-center justify-between px-10 z-20">
          <div className="flex items-center gap-6">
             <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                {location.pathname === '/' ? 'Panel de Control' : 'Inventario IT'}
             </h2>
             <div className="h-4 w-px bg-[#0e312a]" />
             <div className="flex items-center gap-4 bg-[#121412] px-5 py-2.5 rounded-2xl border border-[#0e312a] w-80">
                <Search size={18} className="text-[#4e564e]" />
                <input 
                  type="text" 
                  placeholder="Buscar en registros..." 
                  className="bg-transparent border-none outline-none text-xs w-full placeholder:text-[#4e564e] font-black uppercase tracking-widest text-[#00ff88]"
                />
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 px-4 py-2 bg-[#121412] rounded-2xl border border-[#0e312a]">
                <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_10px_#00ff88]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#00ff88]">Servicio Online</span>
             </div>
             <div className="p-3 bg-zinc-900/50 rounded-2xl border border-white/5">
              <User size={20} className="text-[#00ff88]" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          <div className="max-w-[1500px] mx-auto animate-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
