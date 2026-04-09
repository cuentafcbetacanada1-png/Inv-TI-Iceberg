import React, { useState } from 'react'
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
  ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'

const SidebarItem: React.FC<{ to: string, icon: React.ElementType, label: string, active?: boolean }> = ({ to, icon: Icon, label, active }) => (
  <Link to={to} className="block group mb-2">
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
      active
        ? "bg-white text-[#4318ff] shadow-sm font-bold"
        : "text-[#a3aed0] hover:text-[#4318ff] hover:bg-white/50"
    )}>
      <Icon className={cn("w-5 h-5", active && "text-[#4318ff]")} />
      <span className="text-sm tracking-tight">{label}</span>
      {active && <div className="ml-auto w-1 h-5 bg-[#4318ff] rounded-full" />}
    </div>
  </Link>
)

const DashboardLayout: React.FC = () => {
  const { signOut, user } = useAuthStore()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-[#f4f7fe] font-sans text-[#1b2559] overflow-hidden">
      {/* Sidebar al estilo SMMPlanner */}
      <aside className="w-72 bg-[#f4f7fe] border-r border-gray-100 flex flex-col p-6 z-30">
        <div className="flex flex-col items-center mb-10 px-4">
           <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#4318ff] to-[#b454ff] p-1 mb-3 shadow-lg">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                 <User size={30} className="text-[#4318ff]" />
              </div>
           </div>
           <span className="text-lg font-bold text-[#1b2559]">Admin Panel</span>
           <span className="text-xs font-medium text-[#a3aed0] uppercase tracking-widest">{user?.email?.split('@')[0] || 'System Admin'}</span>
        </div>

        <nav className="flex-1">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          <SidebarItem to="/inventario" icon={Database} label="Inventory" active={location.pathname === '/inventario'} />
          <SidebarItem to="/crear" icon={PlusCircle} label="Add Asset" active={location.pathname === '/crear'} />
          <SidebarItem to="/logs" icon={Activity} label="Event Viewer" active={location.pathname === '/logs'} />
          <SidebarItem to="#" icon={Settings} label="Settings" />
        </nav>
        
        <div className="mt-auto space-y-4">
           <div className="bg-[#4318ff] p-4 rounded-2xl text-white shadow-xl shadow-[#4318ff]/20 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/10 rounded-full" />
              <Bell size={18} />
              <span className="text-sm font-bold">New Requests</span>
              <span className="text-[10px] opacity-80">Check your new registration requests</span>
           </div>
           <button 
             onClick={() => signOut()}
             className="flex items-center gap-3 px-4 py-3 text-[#a3aed0] hover:text-red-500 transition-colors w-full font-bold text-sm"
           >
              <LogOut size={20} />
              <span>Sign Out</span>
           </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-8 bg-[#f4f7fe]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm w-96 max-w-full">
            <Search size={18} className="text-[#1b2559]" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-[#a3aed0] font-medium"
            />
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-50">
            <div className="flex items-center gap-3 px-2">
               <div className="w-8 h-8 rounded-full bg-[#f4f7fe] flex items-center justify-center text-[#a3aed0]">
                  <Bell size={16} />
               </div>
               <div className="w-8 h-8 rounded-full bg-[#4318ff] flex items-center justify-center text-white shadow-md shadow-[#4318ff]/20">
                  <User size={16} />
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
