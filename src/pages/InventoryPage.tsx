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
    toast.success('Inventario sincronizado')
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que desea eliminar este equipo del inventario?')) {
      try {
        await deleteEquipo(id)
        toast.success('Equipo eliminado')
      } catch {
        toast.error('Error al intentar eliminar')
      }
    }
  }

  const filteredEquipos = equipos.filter(e => {
    const searchString = `${e.username} ${e.hostname} ${e.numero_serie || ''} ${e.marca_pc || ''}`.toLowerCase()
    return searchString.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-8 animate-in pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#0e312a]">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[#00ff88] font-black text-[10px] uppercase tracking-[0.4em]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse" />
              <span>Gestión de Activos de Red</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase drop-shadow-2xl">Inventario <span className="text-[#00ff88]">Iceberg IT</span></h1>
           <p className="text-sm text-[#4e564e] font-bold uppercase tracking-widest">Control de hardware y telemetría corporativa.</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <a 
             href="/iceberg-agent.bat" 
             download 
             className="px-6 py-4 rounded-2xl bg-[#121412] border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl"
           >
              <Download size={16} />
              Agente IT
           </a>
           <button 
             onClick={handleRefresh}
             disabled={isRefreshing || isLoading}
             className="px-6 py-4 rounded-2xl bg-[#121412] border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl"
           >
              <RefreshCcw size={16} className={cn(isRefreshing && "animate-spin")} />
              Actualizar
           </button>
           <Link to="/crear" className="btn-matrix flex items-center gap-3 px-8 text-[10px] font-black uppercase tracking-widest">
              <Plus size={18} />
              Nuevo Registro
           </Link>
        </div>
      </header>

      {/* Resumen de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="md:col-span-2 card-matrix p-8 flex items-center gap-8 border-l-4 border-l-[#00ff88] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Database size={80} className="text-[#00ff88] transform rotate-12" />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-[#00ff88]/10 flex items-center justify-center shrink-0 border border-[#00ff88]/20">
               <Zap size={30} className="text-[#00ff88] animate-pulse" />
            </div>
            <div className="space-y-2 relative z-10">
               <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em] italic flex items-center gap-2">
                  Asistente de Sistema v1.2
               </h3>
               <p className="text-xs text-[#4e564e] font-bold uppercase tracking-widest leading-relaxed max-w-xl">
                  Se han detectado <span className="text-[#00ff88]">{equipos.length} equipos activos</span> en la red. 
                  Sugerencia: Revisar <span className="text-red-500">{equipos.filter(e => !e.validado).length} registros</span> sin telemetría validada.
               </p>
            </div>
         </div>
      </div>

      <div className="card-matrix overflow-hidden">
        <div className="p-8 border-b border-[#0e312a] flex flex-col md:flex-row gap-6 justify-between items-center bg-white/[0.01]">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4e564e] group-focus-within:text-[#00ff88] transition-colors" />
              <input
                type="text"
                placeholder="Filtrar por usuario, host o modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#090a09] border border-[#0e312a] rounded-xl pl-12 pr-4 py-4 text-xs text-white outline-none focus:border-[#00ff88]/30 transition-all font-bold uppercase tracking-widest placeholder:text-[#0e312a]"
              />
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right">
                 <p className="text-[9px] font-black text-[#4e564e] uppercase tracking-[0.3em]">Vista Detallada</p>
                 <p className="text-[10px] font-black text-[#00ff88] uppercase italic">Sincronizado v1.2.4</p>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#121412]">
                <th className="px-6 py-5 text-left text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">Equipo</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">Usuario</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">IP Local</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">S/N / Service Tag</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">Hardware</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">S.O. / Otros</th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0e312a]">
              {isLoading && filteredEquipos.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-8 py-24 text-center">
                      <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin mx-auto mb-4" />
                      <p className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest italic">Cargando base de datos...</p>
                   </td>
                </tr>
              ) : filteredEquipos.length === 0 ? (
                <tr>
                   <td colSpan={7} className="px-8 py-24 text-center">
                      <p className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest italic">No se encontraron registros activos</p>
                   </td>
                </tr>
              ) : (
                filteredEquipos.map((e) => (
                  <tr key={e.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center border",
                            e.es_laptop ? "bg-amber-500/5 border-amber-500/10 text-amber-500" : "bg-[#00ff88]/5 border-[#00ff88]/10 text-[#00ff88]"
                          )}>
                             {e.es_laptop ? <Laptop size={16} /> : <Monitor size={16} />}
                          </div>
                          <span className="text-sm font-black text-white uppercase italic">{e.hostname}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-xs text-white/60">{e.username}</td>
                    <td className="px-6 py-5">
                       <code className="text-[10px] font-black text-[#00ff88] bg-[#00ff88]/5 px-2 py-1 rounded-lg border border-[#00ff88]/10">{e.ip_local}</code>
                    </td>
                     <td className="px-6 py-5">
                        <span className="text-[10px] font-black text-[#4e564e] uppercase">{e.numero_serie || 'SIN S/N'}</span>
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-white italic">{e.marca_pc}</span>
                           <span className="text-[9px] font-bold text-[#4e564e] uppercase mt-0.5">{e.modelo}</span>
                        </div>
                     </td>
                    <td className="px-6 py-5">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-[#00ff88] uppercase tracking-tighter">{e.memoria_ram} RAM</span>
                          <span className="text-[9px] text-[#4e564e] font-black uppercase truncate max-w-[120px]">{e.sistema_operativo}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            to={`/editar/${e.id}`}
                            className="p-2.5 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-xl text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all shadow-md"
                          >
                             <Edit2 size={14} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(e.id)}
                            className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md"
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
