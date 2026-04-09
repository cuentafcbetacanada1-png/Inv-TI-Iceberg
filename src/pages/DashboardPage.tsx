import React, { useEffect } from 'react'
import { 
  ShieldCheck, 
  Zap,
  Network,
  Edit2,
  Trash2,
  MoreHorizontal
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
import { toast } from 'react-hot-toast'

const chartData = [
  { time: 'Lun', val: 320 },
  { time: 'Mar', val: 380 },
  { time: 'Mie', val: 310 },
  { time: 'Jue', val: 420 },
  { time: 'Vie', val: 480 },
  { time: 'Sab', val: 410 },
  { time: 'Dom', val: 450 },
]

const StatMetric: React.FC<{ label: string, value: string | number, trend: string, up?: boolean }> = ({ label, value, trend, up }) => (
   <div className="flex-1 min-w-[200px] border-r border-[#0e312a] last:border-none px-6 py-2 group cursor-pointer hover:bg-white/5 transition-colors first:rounded-l-2xl last:rounded-r-2xl">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4e564e] mb-2">{label}</p>
      <h3 className="text-3xl font-black text-white italic tracking-tighter mb-2">{value}</h3>
      <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest", up ? "bg-[#00ff88]/10 text-[#00ff88]" : "bg-red-500/10 text-red-500")}>
         <Zap size={10} className={cn(!up && "rotate-180")} />
         <span>{trend}</span>
      </div>
   </div>
)

const ProgressRing: React.FC<{ percent: number }> = ({ percent }) => (
  <div className="relative w-48 h-48 flex items-center justify-center">
    <svg className="w-full h-full -rotate-90">
      <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-[#0e312a]" />
      <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
        strokeDasharray={2 * Math.PI * 80} 
        strokeDashoffset={2 * Math.PI * 80 * (1 - percent / 100)} 
        strokeLinecap="round"
        className="text-[#00ff88] drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]" 
      />
    </svg>
    <div className="absolute flex flex-col items-center">
       <span className="text-4xl font-black text-white italic tracking-tighter">{percent}%</span>
    </div>
  </div>
)

const DashboardPage: React.FC = () => {
  const { equipos, fetchEquipos, deleteEquipo } = useEquipmentStore()

  useEffect(() => {
    fetchEquipos()
  }, [fetchEquipos])

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que desea eliminar este equipo?')) {
      try {
        await deleteEquipo(id)
        toast.success('Equipo eliminado correctamente')
      } catch {
        toast.error('Error al intentar eliminar')
      }
    }
  }

  const total = equipos.length
  const validados = equipos.filter(e => e.validado).length
  const salud = total > 0 ? Math.round((validados / total) * 100) : 0

  return (
    <div className="space-y-10">
      {/* Fila de Métricas en Español */}
      <div className="card-matrix flex flex-wrap divide-x divide-[#0e312a] overflow-hidden">
         <StatMetric label="Total Equipos" value={total.toLocaleString()} trend="+12.45%" up />
         <StatMetric label="Equipos Validados" value={validados.toLocaleString()} trend="-2.65%" />
         <StatMetric label="Eficiencia Sinc." value="98.41%" trend="+1.25%" up />
         <StatMetric label="Latencia Promedio" value="1.2ms" trend="+4.12%" up />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
         {/* Sección Gráfica */}
         <div className="xl:col-span-2 card-matrix p-10 space-y-10">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4e564e] mb-1">Actividad del Sistema</p>
                  <h3 className="text-4xl font-black text-white italic tracking-tighter">{total * 1234}</h3>
                  <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-widest">+12.4% desde el último escaneo</span>
               </div>
               <button className="p-2 rounded-xl bg-white/5 text-[#4e564e] hover:text-[#00ff88] transition-all">
                  <MoreHorizontal size={20} />
               </button>
            </div>

            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                     <defs>
                        <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#00ff88" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#0e312a" vertical={false} opacity={0.5} />
                     <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#4e564e', fontSize: 10, fontWeight: 800}} 
                        dy={10}
                     />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#121412', border: '1px solid #0e312a', borderRadius: '12px' }}
                        itemStyle={{ color: '#00ff88', fontSize: '10px', fontWeight: '900' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="val" 
                        stroke="#00ff88" 
                        strokeWidth={4} 
                        fill="url(#emeraldGradient)" 
                        animationDuration={2500}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Estado de Integridad */}
         <div className="card-matrix p-10 flex flex-col items-center justify-between text-center min-h-[500px]">
            <div className="flex w-full items-center justify-between mb-10">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4e564e]">Estado de Integridad</h4>
               <MoreHorizontal size={18} className="text-[#4e564e]" />
            </div>

            <ProgressRing percent={salud} />
            
            <div className="space-y-2 mt-8">
               <div className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest">Calidad del Escaneo</div>
               <div className="text-sm font-bold text-white italic">Basado en validación de telemetría</div>
            </div>

            <div className="mt-10 p-6 rounded-3xl bg-white/5 border border-white/5 w-full text-left space-y-4 relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-[#00ff88]/5 rounded-full" />
               <div className="text-[10px] font-black text-[#00ff88] uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="animate-pulse" />
                  Transmisión en Vivo
               </div>
               <p className="text-[10px] font-bold text-[#4e564e] uppercase leading-relaxed italic">El agente está emitiendo telemetría cifrada al servidor maestro.</p>
               <button className="text-[10px] font-black text-white uppercase tracking-widest hover:text-[#00ff88] transition-colors">Abrir Consola IT →</button>
            </div>
         </div>
      </div>

      {/* Registros Detallados */}
      <h3 className="text-xs font-black text-[#4e564e] uppercase tracking-[0.4em] mb-4 pl-2 italic">Últimos Registros</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-10">
         {equipos.slice(0, 3).map((e) => (
           <div key={e.id} className="card-matrix p-5 flex items-center justify-between group hover:border-[#00ff88]/40 transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 flex items-center justify-center text-[#00ff88] shadow-inner">
                    <Network size={18} />
                 </div>
                 <div>
                    <h5 className="text-[11px] font-black text-white italic truncate max-w-[120px]">{e.hostname}</h5>
                    <p className="text-[9px] font-black text-[#4e564e] uppercase">{e.ip_local}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Link 
                   to={`/editar/${e.id}`}
                   className="p-2.5 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-xl text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all shadow-sm"
                   title="Editar Equipo"
                 >
                    <Edit2 size={14} />
                 </Link>
                 <button 
                   onClick={() => handleDelete(e.id)}
                   className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                   title="Eliminar Equipo"
                 >
                    <Trash2 size={14} />
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  )
}

export default DashboardPage
