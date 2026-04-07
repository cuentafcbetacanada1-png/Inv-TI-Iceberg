import React, { useEffect, useState } from 'react'
import { 
  Activity, 
  Clock, 
  User, 
  Terminal, 
  ShieldCheck, 
  PlusCircle, 
  Edit2, 
  Trash2,
  ArrowRight
} from 'lucide-react'
import { cn } from '../lib/utils'

interface LogEntry {
  id: string
  action: string
  details: string
  user_email: string
  created_at: string
  type: 'create' | 'update' | 'delete' | 'validate' | 'system'
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<LogEntry['type'] | 'all'>('all')

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockLogs: LogEntry[] = [
        {
          id: '1',
          action: 'Inicialización de Equipo',
          details: 'Nuevo equipo ICE-EQUIPO-01 registrado con éxito',
          user_email: 'admin@empresa.com',
          created_at: new Date().toISOString(),
          type: 'create'
        },
        {
          id: '2',
          action: 'Acceso al Sistema',
          details: 'Sesión iniciada desde terminal autorizada',
          user_email: 'admin@empresa.com',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          type: 'system'
        }
      ]
      
      setLogs(mockLogs)
      setIsLoading(false)
    }

    fetchLogs()
  }, [])

  const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.type === filter)

  const getTypeStyles = (type: LogEntry['type']) => {
    switch (type) {
      case 'create': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      case 'update': return 'text-primary-500 bg-primary-500/10 border-primary-500/20'
      case 'delete': return 'text-rose-500 bg-rose-500/10 border-rose-500/20'
      case 'validate': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      default: return 'text-zinc-500 bg-white/5 border-white/10'
    }
  }

  const getTypeIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'create': return <PlusCircle size={14} />
      case 'update': return <Edit2 size={14} />
      case 'delete': return <Trash2 size={14} />
      case 'validate': return <ShieldCheck size={14} />
      default: return <Terminal size={14} />
    }
  }

  return (
    <div className="space-y-10 animate-in font-bold">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5 font-bold">
        <div className="space-y-1 font-bold">
           <div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-[0.3em]">
              <Activity size={12} />
              <span>Auditoría de Infraestructura</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Logs de Actividad</h1>
           <p className="text-sm text-zinc-500 max-w-md font-bold">Registro histórico de operaciones y cambios en la matriz de activos IT.</p>
        </div>
        
        <div className="flex gap-2 font-bold">
          {(['all', 'create', 'update', 'validate', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-bold border",
                filter === t 
                  ? "bg-white/10 text-white border-white/20" 
                  : "text-zinc-600 hover:text-zinc-400 border-transparent"
              )}
            >
              {t === 'all' ? 'Todos' : t}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-4 font-bold">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50 font-bold">
             <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
             <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando Historial...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="card-premium p-20 text-center font-bold">
             <Activity size={40} className="text-zinc-800 mx-auto mb-4" />
             <p className="text-xs font-black text-zinc-600 uppercase tracking-widest">Sin registros que mostrar</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="card-premium p-6 group hover:bg-white/[0.02] transition-all font-bold">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 font-bold">
                  <div className="flex gap-4 font-bold">
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110",
                       getTypeStyles(log.type)
                     )}>
                        {getTypeIcon(log.type)}
                     </div>
                     <div className="space-y-1 font-bold">
                        <div className="flex items-center gap-3 font-bold">
                           <h3 className="text-sm font-black text-white italic uppercase">{log.action}</h3>
                           <span className={cn(
                             "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                             getTypeStyles(log.type)
                           )}>{log.type}</span>
                        </div>
                        <p className="text-xs text-zinc-400 font-bold tracking-tight">{log.details}</p>
                        <div className="flex items-center gap-4 pt-2 font-bold">
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-600 uppercase">
                              <User size={10} className="text-primary-500" /> {log.user_email}
                           </div>
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-600 uppercase">
                              <Clock size={10} className="text-zinc-700" /> {new Date(log.created_at).toLocaleTimeString()}
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 ml-16 md:ml-0 font-bold">
                     <button className="p-2 text-zinc-700 hover:text-white transition-colors font-bold">
                        <ArrowRight size={16} />
                     </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>

      <footer className="pt-10 flex justify-center font-bold">
         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest font-bold">Registro de Auditoría en Tiempo Real Activo</span>
         </div>
      </footer>
    </div>
  )
}

export default LogsPage
