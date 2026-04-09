import React, { useEffect, useMemo } from 'react'
import { 
  History, 
  ShieldCheck, 
  Zap,
  Activity,
  Plus,
  Monitor,
  Laptop,
  CheckCircle2,
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
   <div className="card-matrix p-6 flex flex-col justify-between group h-40 relative overflow-hidden">
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 opacity-5 transition-transform group-hover:scale-125", color)}>
         <Icon size={90} />
      </div>
      <div className="flex items-center gap-3">
         <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", color.replace('text-', 'bg-').concat('/10 border-').concat(color.replace('text-', '')))}>
            <Icon size={18} className={color} />
         </div>
         <span className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div>
         <h4 className="text-3xl font-black text-white italic tracking-tighter mb-1">{value}</h4>
         <p className="text-[10px] font-bold text-[#4e564e] uppercase tracking-widest flex items-center gap-1">
            <ArrowUpRight size={12} className="text-[#00ff88]" />
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
    const brands = equipos.reduce((acc: any, curr) => {
      const brand = curr.marca_pc?.toUpperCase() || 'DESCONOCIDO'
      acc[brand] = (acc[brand] || 0) + 1
      return acc
    }, {})
    
    const brandData = Object.entries(brands).map(([name, value]) => ({ name, value }))

    // Distribución por SO
    const osSet = equipos.reduce((acc: any, curr) => {
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
    <div className="space-y-10 pb-20 animate-in font-sans">
      {/* Indicadores Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <ResumenCard label="Activos Totales" value={stats.total} sub="Nodos en Servidor" icon={Monitor} color="text-[#00ff88]" />
         <ResumenCard label="Laptops IT" value={stats.laptops} sub="Dispositivos Móviles" icon={Laptop} color="text-amber-500" />
         <ResumenCard label="Integridad Datos" value={`${stats.salud}%`} sub="Salud de Matriz" icon={ShieldCheck} color="text-indigo-500" />
         <ResumenCard label="Sincronización" value="Ok" sub="Latency 14ms" icon={Zap} color="text-[#00ff88]" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         {/* Gráfica de Implementación */}
         <div className="xl:col-span-8 space-y-10">
            <div className="card-matrix p-10 space-y-10 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-64 h-64 bg-[#00ff88]/5 blur-[100px]" />
               <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                     <h3 className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.4em]">Fuerza de Implementación</h3>
                     <h2 className="text-3xl font-black text-white italic tracking-tighter">Historial de Red</h2>
                  </div>
                  <div className="flex bg-[#090a09] border border-[#0e312a] p-1 rounded-xl">
                     <button className="px-4 py-2 bg-[#00ff88] text-black rounded-lg text-[10px] font-black uppercase tracking-widest">Global</button>
                     <button className="px-4 py-2 text-[#4e564e] hover:text-[#00ff88] text-[10px] font-black uppercase tracking-widest">Local</button>
                  </div>
               </div>

               <div className="h-[300px] w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={chartData}>
                        <defs>
                           <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#0e312a" vertical={false} opacity={0.2} />
                        <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#4e564e', fontSize: 10, fontWeight: 800}} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ backgroundColor: '#121412', border: '1px solid #00ff8820', borderRadius: '12px' }} itemStyle={{ color: '#00ff88', fontSize: '10px', fontWeight: '900' }} />
                        <Area type="monotone" dataKey="nodos" stroke="#00ff88" strokeWidth={5} fill="url(#glowGradient)" animationDuration={2000} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {/* Distribución por Marcas */}
               <div className="card-matrix p-8 space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-500">
                        <PieIcon size={18} />
                     </div>
                     <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Top Marcas de Hardware</h3>
                  </div>
                  <div className="h-48 flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={stats.brandData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                              {stats.brandData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip contentStyle={{ backgroundColor: '#121412', border: 'none', borderRadius: '8px' }} />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     {stats.brandData.slice(0, 4).map((b, i) => (
                       <div key={b.name} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[9px] font-black text-white uppercase tracking-tighter truncate">{b.name}</span>
                          <span className="text-[9px] font-bold text-[#4e564e] ml-auto">{Math.round((b.value/stats.total)*100)}%</span>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Sistemas Operativos */}
               <div className="card-matrix p-8 space-y-6 text-white">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                        <LayoutGrid size={18} />
                     </div>
                     <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Distribución SO</h3>
                  </div>
                  <div className="space-y-6 pt-4">
                     {stats.osData.map((os, i) => (
                       <div key={os.name} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                             <span>{os.name}</span>
                             <span className="text-[#00ff88]">{os.value} Equipos</span>
                          </div>
                          <div className="h-1.5 w-full bg-[#0e312a] rounded-full overflow-hidden">
                             <div className="h-full bg-[#00ff88] shadow-[0_0_10px_#00ff88]" style={{ width: `${(os.value/stats.total)*100}%` }} />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Línea de Tiempo Profesional */}
         <div className="xl:col-span-4 space-y-10">
            <div className="card-matrix p-8 space-y-8 min-h-[500px] flex flex-col">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Activity size={18} className="text-[#00ff88] animate-pulse" />
                     <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">Timeline de Alta</h3>
                  </div>
                  <Clock size={16} className="text-[#4e564e]" />
               </div>

               <div className="space-y-8 flex-1">
                  {stats.recientes.length === 0 ? (
                    <div className="text-center py-20 opacity-20">
                       <Database size={40} className="mx-auto mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Matriz...</p>
                    </div>
                  ) : stats.recientes.map((e, i) => (
                    <div key={e.id} className="relative pl-8 border-l border-[#0e312a] group hover:bg-[#00ff88]/[0.02] p-2 rounded-xl transition-all">
                       <div className="absolute left-[-6px] top-3 w-3 h-3 rounded-full bg-[#0e312a] border-2 border-[#090a09] group-hover:bg-[#00ff88] group-hover:shadow-[0_0_15px_#00ff88] transition-all" />
                       <div className="space-y-2">
                          <div className="flex items-center justify-between">
                             <span className="text-xs font-black text-white italic group-hover:text-[#00ff88] transition-colors">{e.hostname}</span>
                             <span className="bg-[#00ff88]/5 text-[#00ff88] px-1.5 py-0.5 rounded text-[8px] font-black uppercase">LIVE</span>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="text-[9px] font-black text-[#4e564e] uppercase tracking-tighter">IP: {e.ip_local}</div>
                             <div className="text-[9px] font-black text-[#4e564e] uppercase bg-[#121412] px-2 rounded-md italic">{e.username}</div>
                          </div>
                          <p className="text-[8px] font-black text-zinc-700 uppercase">
                             {new Date(e.created_at).toLocaleDateString()} - {new Date(e.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                       </div>
                    </div>
                  ))}
               </div>

               <Link to="/inventario" className="w-full py-5 rounded-2xl bg-[#00ff88] text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all text-center flex items-center justify-center gap-3">
                  <Database size={16} />
                  Gestión Completa
               </Link>
            </div>

            {/* Hub de Servicios */}
            <div className="card-matrix p-8 bg-black/40 border-[#0e312a] relative overflow-hidden group">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#121412] border border-[#0e312a] flex items-center justify-center text-[#00ff88]">
                     <Server size={22} className="group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                     <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Servidor de Telemetría</h4>
                     <p className="text-[9px] font-bold text-[#4e564e] uppercase tracking-widest">Estado: Operativo</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#0e312a]/20 border border-[#0e312a] text-center">
                     <p className="text-[8px] font-black text-[#4e564e] uppercase mb-1">Carga CPU</p>
                     <span className="text-sm font-black text-[#00ff88] italic">12%</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#0e312a]/20 border border-[#0e312a] text-center">
                     <p className="text-[8px] font-black text-[#4e564e] uppercase mb-1">Red (Gbps)</p>
                     <span className="text-sm font-black text-[#00ff88] italic">1.4</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

export default DashboardPage
