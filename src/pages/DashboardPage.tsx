import React, { useEffect } from 'react'
import { 
  Database,
  Activity,
  Settings,
  ShieldCheck,
  HardDrive,
  Monitor
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { cn } from '../lib/utils'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'

const chartData = [
  { time: '00:00', load: 12 },
  { time: '04:00', load: 15 },
  { time: '08:00', load: 28 },
  { time: '12:00', load: 45 },
  { time: '16:00', load: 30 },
  { time: '20:00', load: 18 },
  { time: '23:00', load: 10 },
]

const StatGauge: React.FC<{ percent: number, label: string, colorClass: string, sublabel: string, strokeColor: string }> = ({ percent, label, colorClass, sublabel, strokeColor }) => (
  <div className="card-quantum p-8 flex flex-col items-center justify-center space-y-4 text-center">
    <div className="relative w-40 h-20 overflow-hidden">
      <div className="absolute top-0 left-0 w-40 h-40 rounded-full border-[14px] border-white/5" />
      <div 
        className={cn("absolute top-0 left-0 w-40 h-40 rounded-full border-[14px] transition-all duration-1000 ease-out", colorClass)}
        style={{ 
          clipPath: `inset(0 0 50% 0)`,
          transform: `rotate(${180 + (percent * 1.8)}deg)`,
          borderColor: strokeColor
        }}
      />
      <div className="absolute bottom-0 left-0 w-full text-3xl font-black text-white italic">{percent}%</div>
    </div>
    <div className="space-y-1">
      <h4 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">{label}</h4>
      <p className="text-[12px] text-zinc-400 font-medium">{sublabel}</p>
    </div>
  </div>
)

const MetricCard: React.FC<{ label: string, value: string | number, sub: string, icon: any, color: string }> = ({ label, value, sub, icon: Icon, color }) => (
   <div className="card-quantum p-6 flex items-center justify-between group">
      <div className="flex items-center gap-4">
         <div className={cn("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shadow-[inset_0_0_15px_rgba(255,255,255,0.05)] transition-all", color)}>
            <Icon size={20} />
         </div>
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold text-white uppercase">{sub}</span>
         </div>
      </div>
      <div className={cn("px-4 py-1.5 rounded-xl text-xs font-black shadow-lg", color.replace('text-', 'bg-').concat('/10'))}>
         {value}
      </div>
   </div>
)

const DashboardPage: React.FC = () => {
  const { equipos, fetchEquipos } = useEquipmentStore()

  useEffect(() => {
    fetchEquipos()
  }, [])

  const totalEquipos = equipos.length
  const validados = equipos.filter(e => e.validado).length
  const salud = totalEquipos > 0 ? Math.round((validados / totalEquipos) * 100) : 0
  
  // Storage critico (simulado basado en equipos reales)
  const storageCritico = equipos.filter(e => e.disco && parseInt(e.disco) < 100).length

  return (
    <div className="space-y-8 animate-in pb-20">
      {/* Indicadores Clave */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard label="Inventario Total" value={totalEquipos} sub="Equipos Activos" icon={Monitor} color="text-cyan" />
         <MetricCard label="Storage Crítico" value={storageCritico} sub="Alertas de Disco" icon={HardDrive} color="text-magenta" />
         <MetricCard label="Seguridad" value="98%" sub="Nodos Protegidos" icon={ShieldCheck} color="text-violet" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Gráficos de Salud y Carga */}
        <div className="xl:col-span-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StatGauge percent={salud} label="Integridad de Datos" sublabel="Verificación de telemetría" colorClass="shadow-[0_0_20px_rgba(255,0,122,0.3)]" strokeColor="#ff007a" />
              <StatGauge percent={34} label="Carga del Agente" sublabel="Impacto CPU en despliegue" colorClass="shadow-[0_0_20px_rgba(112,0,255,0.3)]" strokeColor="#7000ff" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card-quantum p-8">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Sincronización de Red</h4>
                       <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-loose">Latencia: 12ms</span>
                    </div>
                 </div>
                 <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                             <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="load" stroke="#00f2ff" strokeWidth={4} fill="url(#cyanGradient)" animationDuration={2000} />
                          <XAxis dataKey="time" hide />
                          <YAxis hide />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="card-quantum p-8">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Memoria Agente</h4>
                       <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-loose">Consumo: 45MB avg</span>
                    </div>
                 </div>
                 <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                             <linearGradient id="magentaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff007b" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ff007b" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="load" stroke="#ff007b" strokeWidth={4} fill="url(#magentaGradient)" animationDuration={2500} />
                          <XAxis dataKey="time" hide />
                          <YAxis hide />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>

        {/* Panel Lateral: Ajustes de Monitoreo */}
        <div className="xl:col-span-4 space-y-8">
           <div className="card-quantum p-8 space-y-8">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Configuración de Red</h4>
              {[
                { l: "Alertas de Disco", c: true, s: "Notificar espacio < 10%" },
                { l: "Auto-Scan GPO", c: false, s: "Sincronizar cada hora" },
                { l: "Debug Log", c: false, s: "Capturar errores del agente" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">{item.l}</span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1">{item.s}</span>
                   </div>
                   <div className={cn("w-12 h-6 rounded-full relative transition-all duration-300", item.c ? "bg-cyan shadow-[0_0_15px_#00f2ff]" : "bg-white/10")}>
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300", item.c ? "right-1" : "left-1")} />
                   </div>
                </div>
              ))}
           </div>

           <div className="card-quantum p-8 space-y-8 flex-1">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Historial Reciente</h4>
                 <Activity size={14} className="text-zinc-500" />
              </div>
              <div className="space-y-4">
                 {[
                   { l: 'Nuevo Nodo', v: '+1', c: 'text-cyan', s: 'Equipo detectado en LAN' },
                   { l: 'S.O. Update', v: 'Win11', c: 'text-magenta', s: 'Migración exitosa' },
                   { l: 'Error Scan', v: 'IP:32', c: 'text-violet', s: 'Acceso denegado WMI' }
                 ].map((item, i) => (
                   <div key={i} className="flex flex-col p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[11px] font-bold text-white uppercase tracking-widest">{item.l}</span>
                         <span className={cn("text-[11px] font-black tracking-widest", item.c)}>{item.v}</span>
                      </div>
                      <span className="text-[9px] text-zinc-500 uppercase font-black">{item.s}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
