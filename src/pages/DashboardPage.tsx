import React, { useEffect } from 'react'
import { 
  Users, 
  ShieldCheck, 
  Database,
  Plus,
  MoreVertical,
  MessageCircle,
  LayoutDashboard
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { cn } from '../lib/utils'

const StatCard: React.FC<{ icon: any, value: string | number, label: string, color: string }> = ({ icon: Icon, value, label, color }) => (
   <div className="card-soft p-6 flex flex-col items-center justify-center text-center relative group min-w-[200px]">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300", color)}>
         <Icon className="w-6 h-6" />
      </div>
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
      <h3 className="text-3xl font-black text-[#1b2559] tracking-tight">{value}</h3>
      <p className="text-xs font-bold text-[#a3aed0] uppercase tracking-widest mt-1">{label}</p>
   </div>
)

const DashboardPage: React.FC = () => {
  const { equipos, fetchEquipos } = useEquipmentStore()

  useEffect(() => {
    fetchEquipos()
  }, [])

  const total = equipos.length
  const validados = equipos.filter(e => e.validado).length
  const pendientes = total - validados

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-black text-[#1b2559]">Overview</h1>
         <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-[#a3aed0] hover:text-[#4318ff] transition-all">
               Last 30 days
            </button>
         </div>
      </div>

      {/* Hero Stats al estilo SMMPlanner */}
      <div className="flex flex-wrap gap-6 items-stretch">
        <StatCard icon={Users} value={total} label="Total Assets" color="bg-[#f4f7fe] text-[#4318ff]" />
        <StatCard icon={ShieldCheck} value={validados} label="Validated" color="bg-[#f4f7fe] text-[#05cd99]" />
        <StatCard icon={Database} value={pendientes} label="Pending" color="bg-[#f4f7fe] text-[#ffb547]" />
        
        <div className="card-soft flex-1 flex flex-col items-center justify-center border-dashed border-2 border-gray-100 hover:border-[#4318ff]/30 cursor-pointer group bg-gray-50/30">
           <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-[#4318ff] transition-all">
              <Plus size={20} />
           </div>
           <span className="text-xs font-bold text-[#a3aed0] mt-3 group-hover:text-[#4318ff] transition-all">Add New User</span>
        </div>
      </div>

      {/* Inventory List Preview */}
      <div className="card-soft p-8">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-[#1b2559]">Recent Inventory</h2>
            <div className="flex gap-2">
               {['Name', 'Local IP', 'Model', 'Status'].map(f => (
                 <button key={f} className="px-4 py-2 bg-[#f4f7fe] rounded-lg text-xs font-bold text-[#a3aed0] hover:text-[#4318ff] transition-all">
                   {f}
                 </button>
               ))}
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black text-[#a3aed0] uppercase tracking-[0.2em] border-b border-gray-50">
                     <th className="pb-4">Hostname</th>
                     <th className="pb-4">Local IP</th>
                     <th className="pb-4">Model</th>
                     <th className="pb-4 text-center">TFA</th>
                     <th className="pb-4">Last Sync</th>
                     <th className="pb-4">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {equipos.slice(0, 5).map((e) => (
                    <tr key={e.id} className="group hover:bg-[#f4f7fe]/50 transition-all">
                       <td className="py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center text-[#4318ff] font-bold text-xs ring-4 ring-gray-50">
                                {e.hostname?.charAt(0) || 'H'}
                             </div>
                             <div>
                                <div className="text-sm font-black text-[#1b2559]">{e.hostname || 'Unknown'}</div>
                                <div className="text-[10px] font-medium text-[#a3aed0]">{e.username}</div>
                             </div>
                          </div>
                       </td>
                       <td className="py-5 text-sm font-bold text-[#a3aed0]">{e.ip_local}</td>
                       <td className="py-5 text-sm font-bold text-[#1b2559]">{e.marca_pc || 'Generic'}</td>
                       <td className="py-5">
                          <div className="flex justify-center">
                             {e.validado ? (
                                <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                   <ShieldCheck size={12} />
                                </div>
                             ) : (
                                <div className="w-5 h-5 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                   <Activity size={12} />
                                </div>
                             )}
                          </div>
                       </td>
                       <td className="py-5 text-[11px] font-bold text-[#a3aed0] uppercase tracking-wider">
                          {new Date(e.updated_at).toLocaleDateString()}
                       </td>
                       <td className="py-5">
                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-[#4318ff] shadow-sm">
                                <MessageCircle size={16} />
                             </button>
                             <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 shadow-sm">
                                <MoreVertical size={16} />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  )
}

export default DashboardPage
