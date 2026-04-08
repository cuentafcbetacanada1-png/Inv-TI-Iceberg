import React, { useEffect, useState } from 'react'
import { 
  Monitor, 
  ShieldCheck, 
  Activity, 
  AlertCircle, 
  ArrowUpRight,
  RefreshCcw,
  Clock,
  Zap,
  Server,
  CheckCircle2
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { cn } from '../lib/utils'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts'

const StatCard: React.FC<{ 
  label: string, 
  value: string | number, 
  icon: React.ElementType, 
  trend?: string, 
  description: string,
  color: string 
}> = ({ label, value, icon: Icon, trend, description, color }) => (
  <div className="card-premium p-6 space-y-4 group transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500", color)}>
        <Icon size={22} className="group-hover:scale-105 transition-transform" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
          <ArrowUpRight size={14} />
          <span className="text-[10px] font-semibold">{trend}</span>
        </div>
      )}
    </div>
    <div className="space-y-2">
      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
      <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      <p className="text-[11px] text-zinc-500 leading-relaxed">{description}</p>
    </div>
  </div>
)

const chartData = [
  { time: '00:00', load: 30 },
  { time: '04:00', load: 25 },
  { time: '08:00', load: 45 },
  { time: '12:00', load: 60 },
  { time: '16:00', load: 40 },
  { time: '20:00', load: 55 },
  { time: '23:00', load: 35 },
]

const DashboardPage: React.FC = () => {
  const { equipos, fetchEquipos } = useEquipmentStore()
  const [isDiagnosing, setIsDiagnosing] = useState(false)

  useEffect(() => {
    fetchEquipos()
  }, [])

  const handleDiagnose = async () => {
    setIsDiagnosing(true)
    toast.loading('Iniciando escaneo de red...', { id: 'diagnose' })
    
    // Simulación de escaneo profundo
    await new Promise(resolve => setTimeout(resolve, 2000))
    await fetchEquipos()
    
    setIsDiagnosing(false)
    toast.success('Diagnóstico completo: Matriz estabilizada', { id: 'diagnose' })
  }

  const totalEquipos = equipos.length
  const validados = equipos.filter(e => e.validado).length
  const pendientes = totalEquipos - validados
  const salud = totalEquipos > 0 ? Math.round((validados / totalEquipos) * 100) : 0

  return (
    <div className="space-y-8 animate-in">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-3">
           <div className="inline-flex items-center gap-2 text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider">
              <Activity size={13} className="animate-pulse" />
              <span>Monitoreo operativo</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Dashboard de Inventario</h1>
           <p className="text-sm text-zinc-400 max-w-2xl">Vista consolidada de activos, estado de validación y actividad de telemetría en tiempo real.</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <button 
             onClick={handleDiagnose}
             disabled={isDiagnosing}
             className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-300 hover:text-primary-300 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all flex items-center gap-2 group disabled:opacity-60"
           >
              <Zap size={16} className={cn("transition-transform group-hover:scale-110", isDiagnosing && "animate-spin")} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">{isDiagnosing ? 'Escaneando' : 'Diagnóstico'}</span>
           </button>
           <button className="btn-v10-primary px-6 flex items-center gap-2">
              <ShieldCheck size={16} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">Registro completo</span>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard 
          label="Equipos Totales" 
          value={totalEquipos} 
          icon={Monitor} 
          trend="+12%" 
          description="Presencia en Red"
          color="bg-primary-500/5 border-primary-500/10 text-primary-500"
        />
        <StatCard 
          label="Activos Verificados" 
          value={validados} 
          icon={ShieldCheck} 
          trend="+08%" 
          description="Garantía de Acceso"
          color="bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
        />
        <StatCard 
          label="Señales de Alerta" 
          value={pendientes} 
          icon={AlertCircle} 
          description="Telemetría Requerida"
          color="bg-rose-500/5 border-rose-500/10 text-rose-500"
        />
        <div className="card-premium p-6 relative overflow-hidden">
           <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                 <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Salud operativa</span>
                 <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Activity size={18} className="text-primary-500" />
                 </div>
              </div>
              <div className="space-y-2">
                 <div className="flex items-end gap-2">
                    <h3 className="text-4xl font-bold text-white">{salud}%</h3>
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase pb-1">Estable</span>
                 </div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-1000 ease-out" 
                      style={{ width: `${salud}%` }} 
                    />
                 </div>
                 <p className="text-[11px] text-zinc-500">Porcentaje de activos verificados sobre el total inventariado.</p>
              </div>
           </div>
           <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-primary-500/10 blur-[60px] transition-all duration-700" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 card-premium p-6 md:p-8 space-y-6">
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                 <Activity size={18} className="text-primary-500" />
                 <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Telemetría de carga del sistema</h3>
              </div>
              <div className="flex gap-2">
                 {['24H', '7D', '1M'].map(t => (
                   <button key={t} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all", t === '24H' ? "bg-white/10 text-white border border-white/10" : "text-zinc-500 hover:text-zinc-300 border border-transparent")}>{t}</button>
                 ))}
              </div>
           </div>
           
           <div className="h-80 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTelem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#71717a', fontSize: 11, fontWeight: 600}} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(9, 9, 11, 0.9)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#3b82f6' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="load" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTelem)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-md">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                 <span className="text-[10px] font-semibold text-primary-300 uppercase tracking-widest">Live feed activo</span>
              </div>
           </div>
           
           <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Zap size={18} className="text-primary-500" />
                 </div>
                 <div>
                    <h4 className="text-[12px] font-semibold text-white uppercase">Análisis inteligente de red</h4>
                    <p className="text-[11px] text-zinc-500">Optimización automática de recursos detectada en el sector gamma.</p>
                 </div>
              </div>
              <button className="text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider px-4 py-2 border border-white/10 rounded-lg whitespace-nowrap">Ver informe IA</button>
           </div>
        </div>

        <div className="space-y-5">
           <div className="card-premium p-6 space-y-5">
              <div className="flex items-center gap-3">
                 <Clock size={18} className="text-amber-500" />
                 <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Señales prioritarias</h3>
              </div>
              <div className="space-y-3">
                 {[
                   { t: 'Garantía Requerida', n: 'ALPHA_EQUIPO_07', m: 'Hace 1s', c: 'bg-amber-500' },
                   { t: 'Core Actualizado', n: 'BETA_RELAY', m: 'Hace 12m', c: 'bg-emerald-500' },
                   { t: 'Nuevo Enlace', n: 'TELEMETRÍA', m: 'Hace 45m', c: 'bg-primary-500' }
                 ].map((alert, i) => (
                   <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <span className={cn("w-2 h-2 rounded-full", alert.c)} />
                            <span className="text-[11px] font-medium text-zinc-300">{alert.t}: {alert.n}</span>
                         </div>
                         <ArrowUpRight size={12} className="text-zinc-600 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[10px] font-medium text-zinc-500 block mt-2">{alert.m}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="card-premium p-6 space-y-5">
              <div className="flex items-center gap-3">
                 <RefreshCcw size={18} className="text-primary-500" />
                 <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Resumen operativo</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10">
                  <div className="flex items-center gap-2 text-primary-300 mb-2">
                    <Server size={14} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Estado red</span>
                  </div>
                  <p className="text-sm font-semibold text-white">Operativa y estable</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-2 text-emerald-300 mb-2">
                    <CheckCircle2 size={14} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider">Última sync</span>
                  </div>
                  <p className="text-sm font-semibold text-white">Hace unos segundos</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
