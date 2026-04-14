import React, { useEffect, useMemo } from 'react'
import { 
  ShieldCheck, 
  Zap,
  Activity,
  Monitor,
  Laptop,
  Clock,
  ArrowUpRight,
  Database,
  LayoutGrid,
  PieChart as PieIcon,
  Server
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEquipmentStore } from '../store/equipmentStore'
import { cn } from '../lib/utils'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import type { Equipo } from '../types'

const chartData = [
  { dia: 'Lun', nodos: 4 },
  { dia: 'Mar', nodos: 7 },
  { dia: 'Mie', nodos: 5 },
  { dia: 'Jue', nodos: 12 },
  { dia: 'Vie', nodos: 8 },
  { dia: 'Sab', nodos: 3 },
  { dia: 'Dom', nodos: 6 },
]

const COLORS = ['#10b981', '#34d399', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#ef4444']

const ResumenCard: React.FC<{ label: string, value: string | number, sub: string, icon: any, color: string }> = ({ label, value, sub, icon: Icon, color }) => (
   <div className="card-matrix p-4 flex flex-col justify-between group h-32 relative overflow-hidden">
      <div className={cn("absolute -right-4 -top-4 w-20 h-20 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:opacity-10", color)}>
         <Icon size={80} />
      </div>
      <div className="flex items-center gap-3 relative z-10">
         <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", color.replace('text-', 'bg-').concat('/10 border-').concat(color.replace('text-', '')))}>
            <Icon size={14} className={color} />
         </div>
         <span className="text-[10px] font-semibold text-[#889288] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="relative z-10 mt-2">
         <h4 className="text-2xl font-semibold text-white tracking-tight mb-0.5 font-sans leading-none">{value}</h4>
         <p className="text-[9px] font-semibold text-[#4e564e] uppercase tracking-widest flex items-center gap-1.5 mt-1">
            <ArrowUpRight size={10} className="text-[var(--primary)]" />
            {sub}
         </p>
      </div>
   </div>
)

const DashboardPage: React.FC = () => {
  const { equipos, fetchEquipos } = useEquipmentStore()

  useEffect(() => {
    fetchEquipos()
  }, [fetchEquipos])

  const stats = useMemo(() => {
    const total = equipos.length
    const validados = equipos.filter(e => e.validado).length
    const laptops = equipos.filter(e => e.es_laptop).length
    const escritorios = equipos.filter(e => e.es_escritorio).length
    const salud = total > 0 ? Math.round((validados / total) * 100) : 0
    
    // DistribuciÃ³n por marca
    const brands = equipos.reduce((acc: Record<string, number>, curr: Equipo) => {
      const brand = curr.marca_pc?.toUpperCase() || 'DESCONOCIDO'
      acc[brand] = (acc[brand] || 0) + 1
      return acc
    }, {})
    
    const brandData = Object.entries(brands).map(([name, value]) => ({ name, value }))

    // DistribuciÃ³n por SO
    const osSet = equipos.reduce((acc: Record<string, number>, curr: Equipo) => {
      const os = curr.sistema_operativo?.includes('Windows 10') ? 'Windows 10' : 
                 curr.sistema_operativo?.includes('Windows 11') ? 'Windows 11' : 'Otros'
      acc[os] = (acc[os] || 0) + 1
      return acc
    }, {})
    
    const osData = Object.entries(osSet).map(([name, value]) => ({ name, value }))

    const recientes = [...equipos]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6)

    return { total, validados, laptops, escritorios, salud, recientes, brandData, osData }
  }, [equipos])

  return (
    <div className="space-y-6 pb-12 animate-in font-sans text-white">
      {/* Indicadores Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <ResumenCard label="Activos Totales" value={stats.total} sub="Equipos Conectados" icon={Monitor} color="text-emerald-500" />
         <ResumenCard label="Terminales Laptops" value={stats.laptops} sub="Flota en Red" icon={Laptop} color="text-amber-500" />
         <ResumenCard label="Consistencia" value={`${stats.salud}%`} sub="Estado General" icon={ShieldCheck} color="text-blue-500" />
         <ResumenCard label="Estado Red" value="Estable" sub="Latencia: 14ms" icon={Zap} color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
         {/* GrÃ¡fica de ImplementaciÃ³n */}
         <div className="xl:col-span-8 space-y-4">
            <div className="card-matrix p-6 space-y-6 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--primary)]/5 blur-[100px]" />
               <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                     <h3 className="text-[10px] font-semibold text-[#889288] uppercase tracking-[0.3em]">Crecimiento de Red</h3>
                     <h2 className="text-xl font-semibold text-white tracking-tight uppercase">Historial LogÃ­stico</h2>
                  </div>
               </div>

               <div className="h-[220px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.1} />
                        <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 500}} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ backgroundColor: '#0d0f0d', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '12px', padding: '10px' }} itemStyle={{ color: 'var(--primary)', fontSize: '10px', fontWeight: '600' }} />
                        <Area type="monotone" dataKey="nodos" stroke="var(--primary)" strokeWidth={2} fill="url(#glowGradient)" animationDuration={1500} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* DistribuciÃ³n por Marcas */}
               <div className="card-matrix p-6 space-y-5">
                  <div className="flex items-center gap-3">
                     <PieIcon size={16} className="text-indigo-500" />
                     <h3 className="text-[10px] font-semibold text-white/70 uppercase tracking-[0.2em]">Top Fabricantes</h3>
                  </div>
                  <div className="h-40 flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={stats.brandData} innerRadius={50} outerRadius={65} paddingAngle={5} dataKey="value">
                              {stats.brandData.map((_, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{ backgroundColor: '#121412', border: 'none', borderRadius: '10px' }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     {stats.brandData.slice(0, 4).map((b, i) => (
                       <div key={b.name} className="flex items-center gap-2 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[9px] font-semibold text-white/80 uppercase tracking-tight truncate">{b.name}</span>
                          <span className="text-[9px] font-semibold text-[#4e564e] ml-auto">
                             {stats.total > 0 ? Math.round((Number(b.value) / stats.total) * 100) : 0}%
                          </span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Sistemas Operativos */}
               <div className="card-matrix p-6 space-y-5">
                  <div className="flex items-center gap-3">
                     <LayoutGrid size={16} className="text-emerald-500" />
                     <h3 className="text-[10px] font-semibold text-white/70 uppercase tracking-[0.2em]">Sistemas Operativos</h3>
                  </div>
                  <div className="space-y-4 pt-1">
                     {stats.osData.map((os) => (
                       <div key={os.name} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest leading-none">
                             <span className="text-white/80">{String(os.name)}</span>
                             <span className="text-[var(--primary)]">{Number(os.value)} Equipos</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#0e312a] rounded-full overflow-hidden">
                             <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" style={{ width: `${stats.total > 0 ? (Number(os.value) / stats.total) * 100 : 0}%` }} />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* LÃ­nea de Tiempo de Transmisiones */}
         <div className="xl:col-span-4 space-y-4">
            <div className="card-matrix p-6 space-y-5 min-h-[400px] flex flex-col">
               <div className="flex items-center justify-between border-b border-[#0e312a]/30 pb-3">
                  <div className="flex items-center gap-2">
                     <Activity size={16} className="text-[var(--primary)] animate-pulse" />
                     <h3 className="text-[10px] font-semibold text-white uppercase tracking-[0.2em]">Ãšltimos Reportes</h3>
                  </div>
                  <Clock size={16} className="text-[#4e564e]" />
               </div>

               <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                  {stats.recientes.length === 0 ? (
                    <div className="text-center py-20 opacity-20">
                       <Database size={32} className="mx-auto mb-3" />
                       <p className="text-[9px] font-semibold uppercase tracking-widest">Sincronizando...</p>
                    </div>
                  ) : stats.recientes.map((e: Equipo) => (
                    <div key={e.id} className="relative pl-5 border-l border-slate-800 group hover:bg-emerald-500/[0.03] p-2 rounded-xl transition-all">
                       <div className="absolute left-[-6px] top-4 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-black group-hover:bg-emerald-500 transition-all" />
                       <div className="space-y-1">
                          <div className="flex items-center justify-between gap-3">
                             <span className="text-[11px] font-semibold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight truncate">{String(e.hostname)}</span>
                             <span className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-md text-[7px] font-semibold uppercase tracking-widest border border-emerald-500/20">ACTIVO</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#889288] font-medium text-[9px]">
                             <div className="uppercase tracking-wide truncate">{e.username}</div>
                             <div className="w-1 h-1 rounded-full bg-zinc-800" />
                             <div className="shrink-0 font-mono text-[#4e564e]">{e.ip_local}</div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <button 
                 onClick={() => navigate('/inventario')}
                 className="btn-matrix w-full py-3.5 mt-2 rounded-xl text-[10px] flex items-center justify-center gap-2">
                  Ver Inventario Completo
               </button>
            </div>

            {/* Hub de Servicios */}
            <div className="card-matrix p-5 bg-black/40 border-[#0e312a]/50 relative overflow-hidden group">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#121412] border border-[#0e312a] flex items-center justify-center text-[var(--primary)] shadow-lg">
                     <Server size={18} className="group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                     <h4 className="text-[10px] font-semibold text-white uppercase tracking-[0.2em]">Conectividad</h4>
                     <p className="text-[8px] font-medium text-[#889288] uppercase tracking-widest">Protocolo: Iceberg-SSL</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3 relative z-10">
                  <div className="p-3 rounded-xl bg-[#0e312a]/10 border border-[#0e312a]/30 text-center backdrop-blur-sm group-hover:border-[var(--primary)]/20 transition-all">
                     <p className="text-[7px] font-semibold text-[#4e564e] uppercase mb-1">Carga CPU</p>
                     <span className="text-xs font-semibold text-emerald-500">12.4%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e312a]/10 border border-[#0e312a]/30 text-center backdrop-blur-sm group-hover:border-[var(--primary)]/20 transition-all">
                     <p className="text-[7px] font-semibold text-[#4e564e] uppercase mb-1">Ancho de Banda</p>
                     <span className="text-xs font-semibold text-emerald-500">1.4 GB/s</span>
                  </div>
               </div>
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl opacity-50" />
            </div>
         </div>
      </div>
    </div>
  )
}

export default DashboardPage
