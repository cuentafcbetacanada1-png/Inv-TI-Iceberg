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
   <div className="card-matrix p-4 flex flex-col justify-between group h-32 relative overflow-hidden">
      <div className={cn("absolute -right-4 -top-4 w-20 h-20 opacity-[0.03] transition-transform group-hover:scale-125 group-hover:opacity-10", color)}>
         <Icon size={70} />
      </div>
      <div className="flex items-center gap-2 relative z-10">
         <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", color.replace('text-', 'bg-').concat('/10 border-').concat(color.replace('text-', '')))}>
            <Icon size={14} className={color} />
         </div>
         <span className="text-[9px] font-semibold text-[#4e564e] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="relative z-10">
         <h4 className="text-2xl font-bold text-white italic tracking-tighter mb-0.5 font-sans">{value}</h4>
         <p className="text-[9px] font-semibold text-[#4e564e] uppercase tracking-widest flex items-center gap-1">
            <ArrowUpRight size={10} className="text-[#00ff88]" />
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
      .slice(0, 5)

    return { total, validados, laptops, escritorios, salud, recientes, brandData, osData }
  }, [equipos])

  return (
    <div className="space-y-10 pb-20 animate-in font-sans text-white">
      {/* Indicadores Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <ResumenCard label="Activos Totales" value={stats.total} sub="Nodos en Servidor" icon={Monitor} color="text-[#00ff88]" />
         <ResumenCard label="Laptops IT" value={stats.laptops} sub="Dispositivos Móviles" icon={Laptop} color="text-amber-500" />
         <ResumenCard label="Integridad Datos" value={`${stats.salud}%`} sub="Salud de Matriz" icon={ShieldCheck} color="text-indigo-500" />
         <ResumenCard label="Sincronización" value="Ok" sub="Latency 14ms" icon={Zap} color="text-[#00ff88]" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-1         {/* Gráfica de Implementación */}
         <div className="xl:col-span-8 space-y-6">
            <div className="card-matrix p-6 space-y-6 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-64 h-64 bg-[#00ff88]/5 blur-[100px]" />
               <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                     <h3 className="text-[9px] font-semibold text-[#4e564e] uppercase tracking-[0.4em]">Fuerza de Implementación</h3>
                     <h2 className="text-2xl font-bold text-white italic tracking-tighter">Historial de Red</h2>
                  </div>
               </div>

               <div className="h-[250px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0e312a" vertical={false} opacity={0.1} />
                        <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#4e564e', fontSize: 9, fontWeight: 600}} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ backgroundColor: '#121412', border: '1px solid #00ff8820', borderRadius: '12px' }} itemStyle={{ color: '#00ff88', fontSize: '10px', fontWeight: '600' }} />
                        <Area type="monotone" dataKey="nodos" stroke="#00ff88" strokeWidth={4} fill="url(#glowGradient)" animationDuration={2000} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Distribución por Marcas */}
               <div className="card-matrix p-6 space-y-4">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                        <PieIcon size={16} />
                     </div>
                     <h3 className="text-[9px] font-semibold text-white uppercase tracking-[0.2em] text-white/70">Top Marcas</h3>
                  </div>
                  <div className="h-40 flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={stats.brandData} innerRadius={50} outerRadius={65} paddingAngle={5} dataKey="value">
                              {stats.brandData.map((_, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{ backgroundColor: '#121412', border: 'none', borderRadius: '8px' }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     {stats.brandData.slice(0, 4).map((b, i) => (
                       <div key={b.name} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[8px] font-semibold text-white/80 uppercase tracking-tighter truncate">{b.name}</span>
                          <span className="text-[8px] font-semibold text-[#4e564e] ml-auto">
                             {stats.total > 0 ? Math.round((Number(b.value) / stats.total) * 100) : 0}%
                          </span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Sistemas Operativos */}
               <div className="card-matrix p-6 space-y-4">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <LayoutGrid size={16} />
                     </div>
                     <h3 className="text-[9px] font-semibold text-white/70 uppercase tracking-[0.2em]">Sistemas Operativos</h3>
                  </div>
                  <div className="space-y-4 pt-2">
                     {stats.osData.map((os) => (
                       <div key={os.name} className="space-y-1.5">
                          <div className="flex justify-between text-[9px] font-semibold uppercase tracking-widest italic">
                             <span className="text-white/80">{String(os.name)}</span>
                             <span className="text-[#00ff88]">{Number(os.value)} Nodos</span>
                          </div>
                          <div className="h-1 w-full bg-[#0e312a] rounded-full overflow-hidden shadow-inner">
                             <div className="h-full bg-gradient-to-r from-[#00ff88] to-[#10ef87] shadow-[0_0_10px_#00ff88]" style={{ width: `${stats.total > 0 ? (Number(os.value) / stats.total) * 100 : 0}%` }} />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Línea de Tiempo Profesional */}
         <div className="xl:col-span-4 space-y-6">
            <div className="card-matrix p-6 space-y-6 min-h-[400px] flex flex-col">
               <div className="flex items-center justify-between border-b border-[#0e312a]/30 pb-3">
                  <div className="flex items-center gap-2">
                     <Activity size={16} className="text-[#00ff88] animate-pulse" />
                     <h3 className="text-[9px] font-semibold text-white uppercase tracking-[0.3em] italic">Timeline de Alta</h3>
                  </div>
                  <Clock size={14} className="text-[#4e564e]" />
               </div>

               <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  {stats.recientes.length === 0 ? (
                    <div className="text-center py-16 opacity-20">
                       <Database size={32} className="mx-auto mb-3" />
                       <p className="text-[8px] font-semibold uppercase tracking-widest">Sincronizando...</p>
                    </div>
                  ) : stats.recientes.map((e: Equipo) => (
                    <div key={e.id} className="relative pl-6 border-l border-[#0e312a] group hover:bg-[#00ff88]/[0.05] p-2 rounded-xl transition-all">
                       <div className="absolute left-[-6px] top-4 w-2.5 h-2.5 rounded-full bg-[#0e312a] border-2 border-[#090a09] group-hover:bg-[#00ff88] transition-all" />
                       <div className="space-y-1">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-white italic group-hover:text-[#00ff88] transition-colors uppercase tracking-tight truncate max-w-[120px]">{String(e.hostname)}</span>
                             <span className="bg-[#00ff88]/10 text-[#00ff88] px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest">OK</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-500 font-semibold text-[8px]">
                             <div className="uppercase tracking-tighter opacity-70 italic">{e.username}</div>
                             <div className="w-1 h-1 rounded-full bg-zinc-800" />
                             <div>{e.ip_local}</div>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <Link to="/inventario" className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00ff88] to-[#10ef87] text-black text-[9px] font-bold uppercase tracking-[0.3em] hover:scale-[1.02] transition-all text-center flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(0,255,136,0.3)] border-none">
                  Ver Inventario
               </Link>
            </div>

            {/* Hub de Servicios */}
            <div className="card-matrix p-6 bg-black/40 border-[#0e312a]/50 relative overflow-hidden group">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#121412] border border-[#0e312a] flex items-center justify-center text-[#00ff88] shadow-inner">
                     <Server size={18} className="group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                     <h4 className="text-[9px] font-semibold text-white uppercase tracking-[0.2em]">Telemetría</h4>
                     <p className="text-[8px] font-semibold text-[#4e564e] uppercase tracking-widest">Estado: Ok</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#0e312a]/10 border border-[#0e312a]/30 text-center backdrop-blur-sm">
                     <p className="text-[7px] font-semibold text-[#4e564e] uppercase mb-0.5">CPU</p>
                     <span className="text-xs font-bold text-[#00ff88] italic text-glow">12%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0e312a]/10 border border-[#0e312a]/30 text-center backdrop-blur-sm">
                     <p className="text-[7px] font-semibold text-[#4e564e] uppercase mb-0.5">Net</p>
                     <span className="text-xs font-bold text-[#00ff88] italic text-glow">1.4G</span>
                  </div>
               </div>
            </div>
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-3xl group-hover:bg-[#00ff88]/10 transition-colors" />
            </div>
         </div>
      </div>
    </div>
  )
}

export default DashboardPage
