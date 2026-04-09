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
  Database
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
  CartesianGrid
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
    
    // Simular ultimas implementaciones basadas en los datos reales
    const recientes = [...equipos]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    return { total, validados, laptops, escritorios, salud, recientes }
  }, [equipos])

  return (
    <div className="space-y-10 pb-20 animate-in">
      {/* Indicadores Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <ResumenCard label="Activos Totales" value={stats.total} sub="Nodos Protegidos" icon={Monitor} color="text-[#00ff88]" />
         <ResumenCard label="Laptops" value={stats.laptops} sub="Fuerza Móvil" icon={Laptop} color="text-amber-500" />
         <ResumenCard label="Integridad" value={`${stats.salud}%`} sub="Datos Validados" icon={ShieldCheck} color="text-indigo-500" />
         <ResumenCard label="Uptime Agente" value="99.9%" sub="Servicio Cloud" icon={Zap} color="text-[#00ff88]" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         {/* Gráfica de Implementación */}
         <div className="xl:col-span-8 card-matrix p-10 space-y-10">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                  <h3 className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.4em]">Flujo de Implementación</h3>
                  <div className="flex items-center gap-3">
                     <h2 className="text-3xl font-black text-white italic tracking-tighter">Actividad de Red</h2>
                     <span className="bg-[#00ff88]/10 text-[#00ff88] px-2 py-1 rounded-lg text-[10px] font-black uppercase">+3 en 24h</span>
                  </div>
               </div>
               <div className="flex gap-2">
                  {['7D', '30D', '90D'].map(t => (
                    <button key={t} className="px-3 py-1.5 rounded-lg border border-[#0e312a] text-[10px] font-black text-[#4e564e] hover:text-[#00ff88] transition-all">{t}</button>
                  ))}
               </div>
            </div>

            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#0e312a" vertical={false} opacity={0.3} />
                     <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#4e564e', fontSize: 10, fontWeight: 800}} dy={10} />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#121412', border: '1px solid #00ff8820', borderRadius: '12px' }}
                        itemStyle={{ color: '#00ff88', fontSize: '10px', fontWeight: '900' }}
                     />
                     <Area type="monotone" dataKey="nodos" stroke="#00ff88" strokeWidth={4} fill="url(#glowGradient)" animationDuration={2000} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="pt-8 border-t border-[#0e312a] flex items-center justify-between">
               <div className="flex items-center gap-10">
                  <div>
                     <p className="text-[9px] font-black text-[#4e564e] uppercase tracking-widest mb-1">Total HDD Scan</p>
                     <span className="text-sm font-black text-white italic">4.2 TB</span>
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-[#4e564e] uppercase tracking-widest mb-1">RAM Promedio</p>
                     <span className="text-sm font-black text-white italic">16.4 GB</span>
                  </div>
               </div>
               <Link to="/inventario" className="text-[10px] font-black text-[#00ff88] uppercase tracking-widest hover:underline decoration-[#00ff88]/30">Ver Inventario Completo →</Link>
            </div>
         </div>

         {/* Línea de Tiempo de Implementación */}
         <div className="xl:col-span-4 flex flex-col gap-10">
            <div className="card-matrix p-8 space-y-8 flex-1">
               <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Implementaciones Recientes</h3>
                  <Clock size={16} className="text-[#4e564e]" />
               </div>

               <div className="space-y-6">
                  {stats.recientes.length === 0 ? (
                    <div className="text-center py-10">
                       <p className="text-[10px] font-bold text-[#4e564e] uppercase italic tracking-widest">Esperando nuevos nodos...</p>
                    </div>
                  ) : stats.recientes.map((e, i) => (
                    <div key={e.id} className="relative pl-6 border-l border-[#0e312a] group cursor-pointer">
                       <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] group-hover:scale-150 transition-transform" />
                       <div className="space-y-1">
                          <div className="flex items-center justify-between">
                             <span className="text-[11px] font-black text-white uppercase italic truncate max-w-[150px]">{e.hostname}</span>
                             <span className="text-[9px] font-black text-[#00ff88] uppercase tracking-tighter">Inyectado</span>
                          </div>
                          <p className="text-[9px] font-bold text-[#4e564e] uppercase">IP: {e.ip_local}</p>
                          <p className="text-[8px] font-black text-zinc-600 uppercase mt-1">
                             {new Date(e.created_at).toLocaleDateString()} - {new Date(e.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                       </div>
                    </div>
                  ))}
               </div>

               <button className="w-full py-4 rounded-2xl bg-[#00ff88]/5 border border-[#00ff88]/10 text-[10px] font-black text-[#00ff88] uppercase tracking-[0.3em] hover:bg-[#00ff88] hover:text-black transition-all">
                  Ver Historial Completo
               </button>
            </div>

            {/* Estado del Nodo de Datos */}
            <div className="card-matrix p-8 bg-[#00ff88]/5 border-[#00ff88]/20 relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#00ff88]/5 rounded-full group-hover:scale-110 transition-transform" />
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#00ff88] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.3)]">
                     <Database size={24} className="text-black" />
                  </div>
                  <div>
                     <h4 className="text-xs font-black text-white uppercase tracking-widest">Base de Datos</h4>
                     <p className="text-[10px] font-bold text-[#00ff88] uppercase italic">Sincronización Activa</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-[#4e564e]">Estado</span>
                     <span className="text-[#00ff88] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                        Online
                     </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#4e564e]">
                     <span>Último Respaldo</span>
                     <span className="text-white">Hoy, 08:30 AM</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

export default DashboardPage
