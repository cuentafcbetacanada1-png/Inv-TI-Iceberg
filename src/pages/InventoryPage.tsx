import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Edit2, 
  Trash2, 
  Monitor, 
  Laptop,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  RefreshCcw,
  Plus
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'

const InventoryPage: React.FC = () => {
  const { equipos, fetchEquipos, deleteEquipo, toggleValidation, isLoading } = useEquipmentStore()
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Activos' | 'Inactivos'>('Todos')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchTerm(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    fetchEquipos()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchEquipos()
    setIsRefreshing(false)
    toast.success('Inventario sincronizado')
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Confirmar desmantelamiento de este activo?')) {
      try {
        await deleteEquipo(id)
        toast.success('Activo eliminado de la matriz')
      } catch (error) {
        toast.error('Fallo en la eliminación')
      }
    }
  }

  const filteredEquipos = equipos.filter(e => {
    const matchesSearch = 
      e.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.hostname.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (filterStatus === 'Activos') matchesStatus = e.validado === true
    if (filterStatus === 'Inactivos') matchesStatus = e.validado === false
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-10 animate-in font-bold">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5 font-bold">
        <div className="space-y-1 font-bold">
           <div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-[0.3em]">
              <ShieldCheck size={12} />
              <span>Listado Completo de equipos registrados</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Equipos Activos</h1>
           <p className="text-sm text-zinc-500 max-w-md font-bold">Gestión centralizada de equipos activos e inactivos.</p>
        </div>
        <div className="flex gap-3 font-bold">
           <button 
             onClick={handleRefresh}
             disabled={isRefreshing || isLoading}
             className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 font-bold"
           >
              <RefreshCcw size={16} className={cn((isRefreshing || isLoading) && "animate-spin")} />
              <span className="text-[10px] font-black uppercase tracking-widest">Sincronizar</span>
           </button>
           <Link to="/crear" className="btn-v10-primary px-6 flex items-center gap-2 font-bold">
              <Plus size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Registrar Equipo</span>
           </Link>
        </div>
      </header>

      <div className="card-premium p-1 border-white/5 font-bold">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-6 justify-between font-bold">
           <div className="relative flex-1 max-w-md group font-bold">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Filtrar por usuario o hostname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-zinc-300 outline-none focus:border-primary-500/50 transition-all font-bold"
              />
           </div>
           <div className="flex gap-2 font-bold">
              {(['Todos', 'Activos', 'Inactivos'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-bold border",
                    filterStatus === status 
                      ? "bg-primary-500/10 text-primary-400 border-primary-500/20" 
                      : "text-zinc-600 hover:text-zinc-400 border-transparent"
                  )}
                >
                  {status}
                </button>
              ))}
           </div>
        </div>

        <div className="overflow-x-auto font-bold">
          <table className="w-full font-bold">
            <thead>
              <tr className="border-b border-white/5 font-bold">
                <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-600 uppercase tracking-widest">Activo IT</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-600 uppercase tracking-widest">Responsable</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-600 uppercase tracking-widest">Hostname</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-600 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-zinc-600 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-bold">
              {isLoading && filteredEquipos.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center font-bold">
                      <div className="flex flex-col items-center gap-4 font-bold">
                         <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                         <span className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">Accediendo a la Matriz...</span>
                      </div>
                   </td>
                </tr>
              ) : filteredEquipos.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center font-bold">
                      <div className="flex flex-col items-center gap-4 font-bold opacity-30">
                         <Search className="w-12 h-12 text-zinc-700" />
                         <span className="text-xs font-black text-zinc-700 uppercase tracking-[0.3em]">No se encontraron registros</span>
                      </div>
                   </td>
                </tr>
              ) : (
                filteredEquipos.map((e) => (
                  <tr key={e.id} className="group hover:bg-white/[0.01] transition-colors font-bold">
                    <td className="px-8 py-6 font-bold">
                      <div className="flex items-center gap-4 font-bold">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                          e.equipo === 'Portátil' 
                            ? "bg-primary-500/5 border-primary-500/10 text-primary-500 group-hover:bg-primary-500/10" 
                            : "bg-emerald-500/5 border-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/10"
                        )}>
                          {e.equipo === 'Portátil' ? <Laptop size={20} /> : <Monitor size={20} />}
                        </div>
                        <div className="flex flex-col font-bold">
                          <span className="text-sm font-black text-white italic uppercase tracking-tight">{e.equipo}</span>
                          <span className="text-[10px] text-zinc-600 font-bold tracking-widest">REF: {e.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold">
                       <span className="text-sm font-bold text-zinc-300">{e.nombre_usuario}</span>
                    </td>
                    <td className="px-8 py-6 font-bold">
                       <div className="flex items-center gap-2 font-bold">
                          <code className="text-[11px] font-black text-primary-400 bg-primary-500/5 px-2 py-1 rounded border border-primary-500/10 uppercase italic">
                             {e.hostname}
                          </code>
                       </div>
                    </td>
                    <td className="px-8 py-6 font-bold">
                       <button 
                         onClick={() => toggleValidation(e.id, e.validado)}
                         className={cn(
                           "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 font-bold",
                           e.validado 
                             ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                             : "bg-zinc-800/50 border-white/5 text-zinc-600 hover:border-white/10 hover:text-zinc-400 font-bold"
                         )}
                       >
                          {e.validado ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                          <span className="text-[9px] font-black uppercase tracking-widest">
                             {e.validado ? 'Certificado' : 'Pendiente'}
                          </span>
                       </button>
                    </td>
                    <td className="px-8 py-6 text-right font-bold">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all font-bold">
                          <Link to={`/editar/${e.id}`} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all font-bold">
                             <Edit2 size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(e.id)}
                            className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all font-bold"
                          >
                             <Trash2 size={16} />
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
