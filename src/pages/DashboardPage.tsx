import React, { useEffect, useState } from 'react'
import { 
  Monitor, 
  ShieldCheck, 
  Activity, 
  AlertCircle, 
  ArrowUpRight,
  RefreshCcw,
  Clock,
  Zap
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { cn } from '../lib/utils'

const StatCard: React.FC<{ 
  label: string, 
  value: string | number, 
  icon: React.ElementType, 
  trend?: string, 
  description: string,
  color: string 
}> = ({ label, value, icon: Icon, trend, description, color }) => (
  <div className="card-premium p-8 space-y-6 group hover:translate-y-[-4px] transition-all duration-500 font-bold">
    <div className="flex items-center justify-between font-bold">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500", color)}>
        <Icon size={24} className="group-hover:scale-110 transition-transform" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
          <ArrowUpRight size={14} />
          <span className="text-[10px] font-black">{trend}</span>
        </div>
      )}
    </div>
    <div className="space-y-1 font-bold">
      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{label}</span>
      <h3 className="text-4xl font-black text-white italic tracking-tighter">{value}</h3>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed pt-2 border-t border-white/5">{description}</p>
    </div>
  </div>
)

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
    <div className="space-y-12 animate-in font-bold">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-white/5 relative font-bold">
        <div className="space-y-2 font-bold">
           <div className="flex items-center gap-3 text-primary-500 font-black text-[10px] uppercase tracking-[0.4em] font-bold">
              <Activity size={14} className="animate-pulse" />
              <span>Vista Operativa en Tiempo Real</span>
           </div>
           <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Centro de Comando</h1>
           <p className="text-sm text-zinc-500 max-w-xl font-bold">Monitorización global de infraestructura, telemetría de activos y aseguramiento de equipos corporativos.</p>
        </div>
        <div className="flex gap-4 font-bold">
           <button 
             onClick={handleDiagnose}
             disabled={isDiagnosing}
             className="px-6 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-primary-400 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all flex items-center gap-3 group font-bold"
           >
              <Zap size={18} className={cn("transition-transform group-hover:scale-120", isDiagnosing && "animate-spin")} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">{isDiagnosing ? 'Escaneando...' : 'Diagnosticar'}</span>
           </button>
           <button className="btn-v10-primary px-8 flex items-center gap-3 font-bold">
              <ShieldCheck size={18} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Registro Completo</span>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-bold">
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
        <div className="card-premium p-8 relative overflow-hidden group font-bold">
           <div className="relative z-10 space-y-6 font-bold">
              <div className="flex items-center justify-between font-bold">
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Salud de Red</span>
                 <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center font-bold">
                    <Activity size={18} className="text-primary-500" />
                 </div>
              </div>
              <div className="space-y-2 font-bold">
                 <div className="flex items-end gap-2 font-bold">
                    <h3 className="text-5xl font-black text-white italic tracking-tighter">{salud}%</h3>
                    <span className="text-[10px] font-black text-emerald-500 uppercase pb-2">Óptimo</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden font-bold">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-1000 ease-out font-bold" 
                      style={{ width: `${salud}%` }} 
                    />
                 </div>
                 <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest pt-2">Integridad de la Flota</p>
              </div>
           </div>
           <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-primary-500/10 blur-[60px] group-hover:bg-primary-500/20 transition-all duration-700 font-bold" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 font-bold">
        <div className="lg:col-span-2 card-premium p-10 space-y-8 font-bold">
           <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-3 font-bold">
                 <Activity size={18} className="text-primary-500" />
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Telemetría de Carga del Sistema</h3>
              </div>
              <div className="flex gap-2 font-bold">
                 {['24H', '7D', '1M'].map(t => (
                   <button key={t} className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black transition-all font-bold", t === '24H' ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-400")}>{t}</button>
                 ))}
              </div>
           </div>
           
           <div className="h-80 w-full relative group font-bold">
              {/* Simulación de gráfico de telemetría de alto nivel */}
              <svg className="w-full h-full font-bold" viewBox="0 0 1000 400" preserveAspectRatio="none">
                 <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                       <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                 </defs>
                 <path 
                   d="M0,300 C100,280 200,320 300,250 C400,180 500,280 600,220 C700,160 800,240 900,230 L1000,240 L1000,400 L0,400 Z" 
                   fill="url(#chartGradient)" 
                   className="animate-in fade-in duration-1000 font-bold"
                 />
                 <path 
                   d="M0,300 C100,280 200,320 300,250 C400,180 500,280 600,220 C700,160 800,240 900,230 L1000,240" 
                   fill="none" 
                   stroke="#3b82f6" 
                   strokeWidth="3" 
                   className="animate-in slide-in-from-left duration-1000 font-bold"
                 />
                 {/* Puntos de datos */}
                 {[300, 250, 220, 240].map((y, i) => (
                    <circle key={i} cx={i * 300} cy={y} r="4" fill="#3b82f6" className="animate-pulse" />
                 ))}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                 <div className="bg-zinc-900/90 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md shadow-2xl font-bold">
                    <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest font-bold">Analizando Flujos...</span>
                 </div>
              </div>
           </div>
           
           <div className="flex justify-between items-center text-[9px] font-black text-zinc-700 uppercase tracking-tighter pt-6 border-t border-white/5 font-bold">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>23:00</span>
           </div>
        </div>

        <div className="space-y-8 font-bold">
           <div className="card-premium p-8 space-y-6 font-bold">
              <div className="flex items-center gap-3 font-bold">
                 <Clock size={18} className="text-amber-500" />
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Señales Prioritarias</h3>
              </div>
              <div className="space-y-4 font-bold">
                 {[
                   { t: 'Garantía Requerida', n: 'ALPHA_EQUIPO_07', m: 'Hace 1s', c: 'bg-amber-500' },
                   { t: 'Core Actualizado', n: 'BETA_RELAY', m: 'Hace 12m', c: 'bg-emerald-500' },
                   { t: 'Nuevo Enlace', n: 'TELEMETRÍA', m: 'Hace 45m', c: 'bg-primary-500' }
                 ].map((alert, i) => (
                   <div key={i} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group font-bold">
                      <div className="flex items-center justify-between font-bold">
                         <div className="flex items-center gap-3 font-bold">
                            <span className={cn("w-2 h-2 rounded-full", alert.c, "shadow-[0_0_8px_currentColor]")} />
                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-tighter">{alert.t}: {alert.n}</span>
                         </div>
                         <ArrowUpRight size={12} className="text-zinc-700 group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-[9px] font-black text-zinc-600 block mt-2 uppercase italic">{alert.m}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="card-premium p-8 space-y-6 font-bold">
              <div className="flex items-center gap-3 font-bold">
                 <RefreshCcw size={18} className="text-primary-500" />
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Flujo de Actividad</h3>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 font-bold">
                 <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black font-bold">A</div>
                 <div className="flex flex-col font-bold">
                    <span className="text-[11px] font-black text-zinc-300 uppercase">ASENA</span>
                    <span className="text-[9px] text-zinc-600 uppercase">HACE 2M</span>
                 </div>
                 <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full font-bold" />
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
