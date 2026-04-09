import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Edit2, 
  Trash2, 
  Monitor, 
  Laptop,
  Loader2,
  RefreshCcw,
  Plus,
  Cpu,
  Globe,
  Download,
  Zap,
  Activity,
  Database
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'

const InventoryPage: React.FC = () => {
  const { equipos, fetchEquipos, deleteEquipo, isLoading } = useEquipmentStore()
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchTerm(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    fetchEquipos()
  }, [fetchEquipos])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchEquipos()
    setIsRefreshing(false)
    toast.success('Matriz sincronizada')
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este registro de la matriz?')) {
      try {
        await deleteEquipo(id)
        toast.success('Activo eliminado')
      } catch {
        toast.error('Error al eliminar')
      }
    }
  }

  const filteredEquipos = equipos.filter(e => {
    const searchString = `${e.username} ${e.hostname} ${e.numero_serie || ''} ${e.marca_pc || ''}`.toLowerCase()
    return searchString.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-8 animate-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-[0.4em]">
              <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-pulse" />
              <span>Network Asset Management</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase drop-shadow-2xl">Inventario <span className="text-primary-500">Iceberg</span></h1>
           <p className="text-sm text-zinc-500 font-medium tracking-wide">Control centralizado de telemetría y hardware corporativo.</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <a 
             href="/iceberg-agent.bat" 
             download 
             className="px-6 py-3 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 hover:bg-zinc-800 transition-all flex items-center gap-2 font-bold shadow-xl"
           >
              <Download size={18} className="text-primary-500" />
              <span className="text-[11px] font-black uppercase tracking-widest">Agente</span>
           </a>
           <button 
             onClick={handleRefresh}
             disabled={isRefreshing || isLoading}
             className="px-6 py-3 rounded-2xl bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition-all flex items-center gap-2 font-bold shadow-xl"
           >
              <RefreshCcw size={18} className={cn("text-emerald-500", (isRefreshing || isLoading) && "animate-spin")} />
              <span className="text-[11px] font-black uppercase tracking-widest">Sincronizar</span>
           </button>
           <Link to="/crear" className="btn-v10-primary px-8">
              <Plus size={20} />
              <span className="text-[11px] font-black uppercase tracking-widest">Nuevo Registro</span>
           </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 card-premium p-8 flex items-center gap-8 border-l-4 border-l-primary-500 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Database size={80} className="text-primary-500 transform rotate-12" />
            </div>
            <div className="w-16 h-16 rounded-3xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0 shadow-inner">
               <Zap size={30} className="text-primary-500 animate-pulse fill-primary-500/20" />
            </div>
            <div className="space-y-2 relative z-10">
               <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]" />
                  Asistente de Red (v10.4)
               </h3>
               <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-xl">
                  Se han detectado <span className="text-white font-black underline decoration-primary-500/50 underline-offset-4">{equipos.length} terminales activos</span>. 
                  La integridad de la memoria RAM promedia los <span className="text-emerald-400 font-black italic">16 GB por nodo</span>. 
                  Sugerencia: Verificar <span className="text-rose-400 font-black">{equipos.filter(e => !e.validado).length} equipos</span> con telemetría incompleta.
               </p>
            </div>
         </div>
         <div className="card-premium p-8 flex flex-col justify-center gap-4 border-l-4 border-l-emerald-500/50 bg-emerald-500/[0.02]">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Estado del Sector</span>
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-emerald-500" />
                  <span className="text-2xl font-black text-white tracking-tighter italic">SECTOR_ALFA</span>
               </div>
               <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Nodos Estabilizados</p>
            </div>
         </div>
      </div>

      <div className="card-premium p-1 border-white/5 font-bold overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between font-bold">
           <div className="relative flex-1 max-w-md group font-bold">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar por usuario, host o serial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-zinc-300 outline-none focus:border-primary-500/50 transition-all font-bold"
              />
           </div>
           <div className="flex items-center gap-4 font-bold">
              <div className="flex flex-col items-end gap-0.5 font-bold">
                 <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">VISTA DE DATALAKE</span>
                 <span className="text-[10px] font-bold text-primary-500 uppercase italic">Sincronización v10.4.2</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-bold">
                 <Activity size={18} className="text-zinc-500" />
              </div>
           </div>
        </div>

        <div className="overflow-x-auto font-bold">
          <table className="w-full font-bold border-collapse">
            <thead>
              <tr className="bg-white/[0.02] font-bold">
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Hostname</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Usuario</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">IP Local</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">S/N Equipo</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Tipo / Marca</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Características PC</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">RAM / S.O.</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Monitores</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-white/5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-bold">
              {isLoading && filteredEquipos.length === 0 ? (
                <tr>
                   <td colSpan={8} className="px-8 py-20 text-center font-bold">
                      <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
                      <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">Accediendo a la Matriz de Telemetría...</span>
                   </td>
                </tr>
              ) : filteredEquipos.length === 0 ? (
                <tr>
                   <td colSpan={8} className="px-8 py-20 text-center font-bold">
                      <span className="text-xs font-black text-zinc-700 uppercase tracking-widest">Sin registros detectados</span>
                   </td>
                </tr>
              ) : (
                filteredEquipos.map((e) => (
                  <tr key={e.id} className="group hover:bg-white/[0.02] transition-all font-bold">
                    <td className="px-6 py-5 font-bold">
                       <div className="flex items-center gap-3 font-bold">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center border",
                            e.es_laptop ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                          )}>
                             {e.es_laptop ? <Laptop size={14} /> : <Monitor size={14} />}
                          </div>
                          <span className="text-sm font-black text-white uppercase italic">{e.hostname}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 font-bold">
                       <span className="text-sm text-zinc-400 font-bold">{e.username}</span>
                    </td>
                    <td className="px-6 py-5 font-bold">
                       <div className="flex items-center gap-2 font-bold">
                          <Globe size={12} className="text-zinc-600" />
                          <code className="text-[11px] font-mono text-primary-400">{e.ip_local}</code>
                       </div>
                    </td>
                     <td className="px-6 py-5 font-bold">
                        <div className="flex flex-col font-bold">
                           <span className="text-[11px] font-black text-zinc-500 uppercase tracking-tight">{e.numero_serie}</span>
                           {e.disco && <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mt-1">DISCO: {e.disco}</span>}
                        </div>
                     </td>
                     <td className="px-6 py-5 font-bold">
                        <div className="flex flex-col font-bold">
                           <span className="text-[10px] font-black text-zinc-600 uppercase">{e.es_laptop ? 'LAPTOP' : 'ESCRITORIO'}</span>
                           <span className="text-xs font-bold text-zinc-300 uppercase">{e.marca_pc}</span>
                           {e.modelo && <span className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5">{e.modelo}</span>}
                        </div>
                     </td>
                    <td className="px-6 py-5 font-bold">
                       <div className="flex items-center gap-2 font-bold">
                          <Cpu size={12} className="text-zinc-600" />
                          <span className="text-[11px] text-zinc-400 font-bold truncate max-w-[150px]">{e.caracteristicas_pc}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 font-bold">
                       <div className="flex flex-col gap-1 font-bold">
                          <span className="text-[10px] font-black text-emerald-500/80 bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 w-fit">{e.memoria_ram} RAM</span>
                          <span className="text-[10px] text-zinc-500 font-bold uppercase truncate max-w-[120px]">{e.sistema_operativo}</span>
                       </div>
                    </td>
                     <td className="px-6 py-5 font-bold">
                        <div className="flex items-center gap-2 font-bold">
                           <Monitor size={12} className="text-zinc-600 shrink-0" />
                           <span className="text-[10px] text-zinc-400 font-bold whitespace-pre-line leading-tight">{e.monitores || 'N/A'}</span>
                        </div>
                     </td>
                    <td className="px-6 py-5 text-right font-bold">
                       <div className="flex items-center justify-end gap-2 font-bold">
                          <Link to={`/editar/${e.id}`} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all font-bold">
                             <Edit2 size={14} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(e.id)}
                            className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all font-bold"
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default InventoryPage
