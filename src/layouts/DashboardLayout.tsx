import React, { useState, useEffect } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  PlusCircle,
  Activity,
  Search,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  User,
  Menu
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'

const SidebarItem: React.FC<{ to: string, icon: React.ElementType, label: string, active?: boolean, collapsed?: boolean }> = ({ to, icon: Icon, label, active, collapsed }) => (
  <Link to={to} className="block group">
    <div className={cn(
      "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300",
      active
        ? "text-cyan-400 bg-white/5 shadow-[inset_0_0_10px_rgba(0,242,255,0.05)]"
        : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
    )}>
      <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", active && "text-cyan-400")} />
      {!collapsed && <span className="text-sm font-bold tracking-tight">{label}</span>}
    </div>
  </Link>
)

const DashboardLayout: React.FC = () => {
  const { user, signOut } = useAuthStore()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-[#0f1021] font-sans text-white overflow-hidden selection:bg-cyan-500/30">
      {/* Fondo de Viñeta */}
      <div className="bg-vignette" />

      {/* Sidebar Estilo Imagen */}
      <aside className={cn(
        "relative flex flex-col bg-[#14152b]/80 backdrop-blur-md transition-all duration-500 ease-in-out z-30 border-r border-white/5",
        collapsed ? "w-20" : "w-64"
      )}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-[#1a1b3a] border border-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-cyan-400 transition-all z-40 shadow-xl"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="p-6 flex flex-col h-full">
          <div className={cn("flex items-center gap-4 mb-12", collapsed && "justify-center")}>
            <div className="w-10 h-10 bg-[#ff007a] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,122,0.4)] shrink-0">
               <span className="text-white font-black">L</span>
            </div>
            {!collapsed && (
               <div className="flex flex-col">
                  <span className="text-xs font-black tracking-widest text-zinc-200 uppercase">Logo</span>
               </div>
            )}
          </div>

          <nav className="flex-1 space-y-4">
            <SidebarItem to="/" icon={LayoutDashboard} label="Ipsum dolor" active={location.pathname === '/'} collapsed={collapsed} />
            <SidebarItem to="/inventario" icon={Database} label="Sit amet" active={location.pathname === '/inventario'} collapsed={collapsed} />
            <SidebarItem to="/crear" icon={PlusCircle} label="Lorem ipsum" active={location.pathname === '/crear'} collapsed={collapsed} />
            <SidebarItem to="/logs" icon={Activity} label="Dolor sit" active={location.pathname === '/logs'} collapsed={collapsed} />
            <SidebarItem to="#" icon={Settings} label="Amet lorem" collapsed={collapsed} />
          </nav>
          
          <div className="mt-auto pt-6 border-t border-white/5">
             <button 
               onClick={() => signOut()}
               className={cn("flex items-center gap-4 px-4 py-3 rounded-2xl text-zinc-500 hover:text-magenta transition-colors w-full", collapsed && "justify-center")}
             >
                <Settings size={20} />
                {!collapsed && <span className="text-sm font-bold">Sign Out</span>}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-8">
            {!collapsed && (
              <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                <span className="text-white border-b-2 border-[#00f2ff] pb-1 cursor-pointer transition-all">Amet lorem</span>
                <span className="hover:text-white transition-colors cursor-pointer">Ipsum dolor</span>
                <span className="hover:text-white transition-colors cursor-pointer">Dolor sit</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <Search className="w-5 h-5 text-zinc-400 cursor-pointer hover:text-cyan-400 transition-colors" />
            <div className="relative cursor-pointer group">
              <Bell className="w-5 h-5 text-zinc-400 group-hover:text-magenta transition-colors" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff007a] rounded-full text-[8px] flex items-center justify-center font-black border-2 border-[#0f1021]">5</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7000ff] to-[#ff007a] p-0.5 cursor-pointer transform hover:scale-110 transition-transform shadow-lg shadow-violet/20">
              <div className="w-full h-full rounded-full bg-[#1a1b3a] flex items-center justify-center overflow-hidden">
                <User size={16} className="text-white/80" />
              </div>
            </div>
            <div className="w-px h-4 bg-white/10 mx-2" />
            <button className="text-white/60 hover:text-white transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
