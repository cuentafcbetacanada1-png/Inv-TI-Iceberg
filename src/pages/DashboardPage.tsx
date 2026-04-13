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

const COLORS = ['#00ff88', '#10b981', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e']

const ResumenCard: React.FC<{ label: string, value: string | number, sub: string, icon: any, color: string }> = ({ label, value, sub, icon: Icon, color }) => (
   <div className="card-matrix p-3 flex flex-col justify-between group h-28 relative overflow-hidden">
      <div className={cn("absolute -right-3 -top-3 w-16 h-16 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:opacity-10", color)}>
         <Icon size={60} />
      </div>
      <div className="flex items-center gap-2 relative z-10">
         <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center border", color.replace('text-', 'bg-').concat('/10 border-').concat(color.replace('text-', '')))}>
            <Icon size={12} className={color} />
         </div>
         <span className="text-[8px] font-semibold text-[#4e564e] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="relative z-10">
         <h4 className="text-xl font-bold text-white italic tracking-tighter mb-0.5 font-sans">{value}</h4>
         <p className="text-[8px] font-semibold text-[#4e564e] uppercase tracking-widest flex items-center gap-1">
            <ArrowUpRight size={8} className="text-[#00ff88]" />
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
    
    // Distribución por marca
    const brands = equipos.reduce((acc: Record<string, number>, curr: Equipo) => {
      const brand = curr.marca_pc?.toUpperCase() || 'DESCONOCIDO'
      acc[brand] = (acc[brand] || 0) + 1
      return acc
    }, {})
    
    const brandData = Object.entries(brands).map(([name, value]) => ({ name, value }))

    // Distribución por SO
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
    <div className="space-y-6 pb-10 animate-in font-sans text-white">
      {/* Indicadores Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
         <ResumenCard label="Activos" value={stats.total} sub="Nodos" icon={Monitor} color="text-[#00ff88]" />
         <ResumenCard label="Laptops" value={stats.laptops} sub="Móviles" icon={Laptop} color="text-amber-500" />
         <ResumenCard label="Integridad" value={`${stats.salud}%`} sub="Salud" icon={ShieldCheck} color="text-indigo-500" />
         <ResumenCard label="Servicio" value="Ok" sub="14ms" icon={Zap} color="text-[#00ff88]" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
         {/* Gráfica de Implementación */}
         <div className="xl:col-span-8 space-y-4">
            <div className="card-matrix p-4 space-y-4 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-48 h-48 bg-[#00ff88]/5 blur-[80px]" />
               <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-0.5">
                     <h3 className="text-[8px] font-semibold text-[#4e564e] uppercase tracking-[0.4em]">Fuerza</h3>
                     <h2 className="text-base font-bold text-white italic tracking-tighter">Historial</h2>
                  </div>
               </div>

               <div className="h-[180px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0e312a" vertical={false} opacity={0.1} />
                        <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#4e564e', fontSize: 8, fontWeight: 600}} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ backgroundColor: '#121412', border: '1px solid #00ff8820', borderRadius: '8px' }} itemStyle={{ color: '#00ff88', fontSize: '8px', fontWeight: '600' }} />
                        <Area type="monotone" dataKey="nodos" stroke="#00ff88" strokeWidth={3} fill="url(#glowGradient)" animationDuration={1500} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               {/* Distribución por Marcas */}
               <div className="card-matrix p-4 space-y-3">
                  <div className="flex items-center gap-2">
                     <PieIcon size={12} className="text-indigo-500" />
                     <h3 className="text-[8px] font-semibold text-white/70 uppercase tracking-[0.2em]">Top Marcas</h3>
                  </div>
                  <div className="h-32 flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={stats.brandData} innerRadius={40} outerRadius={50} paddingAngle={4} dataKey="value">
                              {stats.brandData.map((_, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{ backgroundColor: '#121412', border: 'none', borderRadius: '6px' }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     {stats.brandData.slice(0, 4).map((b, i) => (
                       <div key={b.name} className="flex items-center gap-1.5 min-w-0">
                          <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[7px] font-semibold text-white/80 uppercase tracking-tighter truncate">{b.name}</span>
                          <span className="text-[7px] font-semibold text-[#4e564e] ml-auto">
                             {stats.total > 0 ? Math.round((Number(b.value) / stats.total) * 100) : 0}%
                          </span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Sistemas Operativos */}
               <div className="card-matrix p-4 space-y-3">
                  <div className="flex items-center gap-2">
                     <LayoutGrid size={12} className="text-emerald-500" />
                     <h3 className="text-[8px] font-semibold text-white/70 uppercase tracking-[0.2em]">Sistemas</h3>
                  </div>
                  <div className="space-y-3 pt-1">
                     {stats.osData.map((os) => (
                       <div key={os.name} className="space-y-1">
                          <div className="flex justify-between text-[8px] font-semibold uppercase tracking-widest italic">
                             <span className="text-white/80">{String(os.name)}</span>
                             <span className="text-[#00ff88]">{Number(os.value)} N</span>
                          </div>
                          <div className="h-1 w-full bg-[#0e312a] rounded-full overflow-hidden">
                             <div className="h-full bg-gradient-to-r from-[#00ff88] to-[#10ef87]" style={{ width: `${stats.total > 0 ? (Number(os.value) / stats.total) * 100 : 0}%` }} />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Línea de Tiempo Profesional */}
         <div className="xl:col-span-4 space-y-4">
            <div className="card-matrix p-4 space-y-4 min-h-[350px] flex flex-col">
               <div className="flex items-center justify-between border-b border-[#0e312a]/30 pb-2">
                  <div className="flex items-center gap-1.5">
                     <Activity size={12} className="text-[#00ff88] animate-pulse" />
                     <h3 className="text-[8px] font-semibold text-white uppercase tracking-[0.3em] italic">Timeline</h3>
                  </div>
                  <Clock size={12} className="text-[#4e564e]" />
               </div>

               <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                  {stats.recientes.length === 0 ? (
                    <div className="text-center py-12 opacity-20">
                       <Database size={24} className="mx-auto mb-2" />
                       <p className="text-[7px] font-semibold uppercase tracking-widest">Sinc...</p>
                    </div>
                  ) : stats.recientes.map((e: Equipo) => (
                    <div key={e.id} className="relative pl-4 border-l border-[#0e312a] group hover:bg-[#00ff88]/[0.05] p-1.5 rounded-lg transition-all">
                       <div className="absolute left-[-5px] top-3 w-2 h-2 rounded-full bg-[#0e312a] border-2 border-[#090a09] group-hover:bg-[#00ff88] transition-all" />
                       <div className="space-y-0.5">
                          <div className="flex items-center justify-between gap-2">
                             <span className="text-[9px] font-bold text-white italic group-hover:text-[#00ff88] transition-colors uppercase tracking-tight truncate">{String(e.hostname)}</span>
                             <span className="bg-[#00ff88]/10 text-[#00ff88] px-1 py-0.5 rounded text-[6px] font-bold uppercase tracking-widest">OK</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-500 font-semibold text-[7px]">
                             <div className="uppercase tracking-tighter opacity-70 italic truncate max-w-[50px]">{e.username}</div>
                             <div className="w-0.5 h-0.5 rounded-full bg-zinc-800" />
                             <div className="shrink-0">{e.ip_local}</div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <Link to="/inventario" className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#00ff88] to-[#10ef87] text-black text-[8px] font-bold uppercase tracking-[0.3em] hover:scale-[1.01] transition-all text-center flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(0,255,136,0.3)]">
                  Ver Todo
               </Link>
            </div>

            {/* Hub de Servicios Compacto */}
            <div className="card-matrix p-4 bg-black/40 border-[#0e312a]/50 relative overflow-hidden group">
               <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#121412] border border-[#0e312a] flex items-center justify-center text-[#00ff88]">
                     <Server size={14} className="group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                     <h4 className="text-[8px] font-semibold text-white uppercase tracking-[0.2em]">Telemetría</h4>
                     <p className="text-[7px] font-semibold text-[#4e564e] uppercase tracking-widest">Estado: Ok</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-[#0e312a]/10 border border-[#0e312a]/30 text-center backdrop-blur-sm">
                     <p className="text-[6px] font-semibold text-[#4e564e] uppercase mb-0.5">CPU</p>
                     <span className="text-[10px] font-bold text-[#00ff88] italic">12%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0e312a]/10 border border-[#0e312a]/30 text-center backdrop-blur-sm">
                     <p className="text-[6px] font-semibold text-[#4e564e] uppercase mb-0.5">Net</p>
                     <span className="text-[10px] font-bold text-[#00ff88] italic">1.4G</span>
                  </div>
               </div>
               <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#00ff88]/5 rounded-full blur-2xl" />
            </div>
         </div>
      </div>
    </div>
  )
}

export default DashboardPage
