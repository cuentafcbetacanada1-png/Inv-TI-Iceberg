import React, { useEffect } from 'react'
import { 
  Database,
  Activity,
  Settings
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { cn } from '../lib/utils'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis,
  YAxis
} from 'recharts'

const chartData = [
  { time: '00:00', load: 30 },
  { time: '04:00', load: 25 },
  { time: '08:00', load: 45 },
  { time: '12:00', load: 60 },
  { time: '16:00', load: 40 },
  { time: '20:00', load: 55 },
  { time: '23:00', load: 35 },
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

const MetricCard: React.FC<{ label: string, value: string | number, sub: string, icon: any }> = ({ label, value, sub, icon: Icon }) => (
   <div className="card-quantum p-6 flex items-center justify-between group">
      <div className="flex items-center gap-4">
         <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[#00f2ff] shadow-[inset_0_0_15px_rgba(0,242,255,0.1)] group-hover:bg-[#00f2ff]/10 transition-all">
            <Icon size={20} />
         </div>
         <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold text-white uppercase">{sub}</span>
         </div>
      </div>
      <div className="bg-[#00f2ff]/10 text-[#00f2ff] px-4 py-1.5 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(0,242,255,0.15)]">
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

  return (
    <div className="space-y-8 animate-in pb-20">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard label="Nodos Activos" value={totalEquipos} sub="Telemetría" icon={Database} />
         <MetricCard label="Eventos Red" value="2,367" sub="Monitoreo" icon={Activity} />
         <MetricCard label="Salud Global" value={`${salud}%`} sub="Estado" icon={Settings} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Side */}
        <div className="xl:col-span-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StatGauge percent={salud} label="Salud del Sistema" sublabel="Nodos verificados en tiempo real" colorClass="shadow-[0_0_20px_rgba(255,0,122,0.3)]" strokeColor="#ff007a" />
              <StatGauge percent={28} label="Carga de CPU" sublabel="Lorem ipsum carga detectada" colorClass="shadow-[0_0_20px_rgba(112,0,255,0.3)]" strokeColor="#7000ff" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card-quantum p-8">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Carga de Red</h4>
                       <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-loose">3,567 Nodes Active</span>
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
                       <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Uso de Memoria</h4>
                       <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-loose">4,789 GB Reserved</span>
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

        {/* Right Side */}
        <div className="xl:col-span-4 space-y-8">
           <div className="card-quantum p-8 space-y-8">
              {[
                { l: "Lorem ipsum dolor sit", c: true },
                { l: "Lorem ipsum dolor sit", c: false },
                { l: "Lorem ipsum dolor sit", c: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                   <div className="flex flex-col">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">{item.l}</span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Status: Stable connection</span>
                   </div>
                   <div className={cn("w-12 h-6 rounded-full relative transition-all duration-300", item.c ? "bg-[#00f2ff]" : "bg-white/10")}>
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300", item.c ? "right-1" : "left-1")} />
                   </div>
                </div>
              ))}
           </div>

           <div className="card-quantum p-8 space-y-8 flex-1">
              <div className="flex items-center justify-between">
                 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Métricas Históricas</h4>
                 <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/10" />)}
                 </div>
              </div>
              <div className="space-y-4">
                 {[
                   { l: 'Lorem sit', v: '+$385', c: 'text-[#00f2ff]' },
                   { l: 'Lorem sit', v: '+$485', c: 'text-[#ff007a]' },
                   { l: 'Lorem sit', v: '-$78', c: 'text-[#7000ff]' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{item.l}</span>
                      <span className={cn("text-[11px] font-black tracking-widest", item.c)}>{item.v}</span>
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
