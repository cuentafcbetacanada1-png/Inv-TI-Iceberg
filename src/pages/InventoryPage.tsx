import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Edit2, 
  Trash2, 
  Monitor as DesktopIcon, 
  Laptop,
  Loader2,
  RefreshCcw,
  Plus,
  FileSpreadsheet,
  Zap,
  AlertCircle,
  Server,
  ShieldAlert
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'

const InventoryPage: React.FC = () => {
  const { equipos, fetchEquipos, deleteEquipo, isLoading } = useEquipmentStore()
  const [searchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTech, setFilterTech] = useState<'todos' | 'laptops' | 'desktops'>('todos')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigate = useNavigate()

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

  // FUNCIÓN DE BORRADO REFORZADA
  const handleActionDelete = async (id: string, name: string) => {
    // 1. Confirmación de seguridad
    const confirmed = window.confirm(`ATENCIÓN: ¿Desea eliminar definitivamente el equipo [${name}]?`);
    
    if (confirmed) {
      try {
        console.log('--- INICIANDO PURGA DE ACTIVO IT ---');
        console.log('ID objetivo:', id);
        
        // Llamada directa al store
        await deleteEquipo(id);
        
        // Mensaje de éxito manual por si falla el store
        toast.success(`Equipo ${name} eliminado correctamente`);
      } catch (err: any) {
        console.error('ERROR EN ACCIÓN DE BORRADO:', err);
        toast.error(`Fallo en la matriz: ${err.message || 'Error Desconocido'}`);
      }
    }
  }

  const exportToCSV = () => {
    if (equipos.length === 0) return toast.error('No hay datos para exportar')
    const headers = ['Hostname', 'Usuario', 'IP Local', 'Serie', 'Marca', 'Modelo', 'RAM', 'Disco', 'SO', 'Características', 'Implementado']
    const rows = equipos.map(e => [
      e.hostname, e.username, e.ip_local, e.numero_serie, e.marca_pc, e.modelo, e.memoria_ram, e.disco, e.sistema_operativo, e.caracteristicas_pc?.replace(/,/g, ';'), new Date(e.created_at).toLocaleDateString()
    ])
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `inventario_it_iceberg_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Reporte CSV generado')
  }

  const filteredEquipos = equipos.filter(e => {
    const searchString = `${e.username || ''} ${e.hostname || ''} ${e.numero_serie || ''} ${e.marca_pc || ''}`.toLowerCase()
    const matchesSearch = searchString.includes(searchTerm.toLowerCase()) ||
        (e.ip_local?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.vlan?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.ip_switch?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (e.codigo_activo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    if (filterTech === 'laptops') return matchesSearch && e.es_laptop
    if (filterTech === 'desktops') return matchesSearch && e.es_escritorio
    return matchesSearch
  })

  return (
    <div className="space-y-8 animate-in pb-10 font-sans text-white">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#0e312a]">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[#00ff88] font-black text-[10px] uppercase tracking-[0.4em]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse" />
              <span>Gestión de Activos IT</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase">Inventario <span className="text-[#00ff88]">Iceberg IT</span></h1>
        </div>
        <div className="flex flex-wrap gap-3">
           <button onClick={exportToCSV} className="px-6 py-4 rounded-2xl bg-[#121412] border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
              <FileSpreadsheet size={16} /> Exportar CSV
           </button>
           <button onClick={handleRefresh} disabled={isRefreshing} className="px-6 py-4 rounded-2xl bg-[#121412] border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
              <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} /> Actualizar
           </button>
           <Link to="/crear" className="btn-matrix flex items-center gap-3 px-8 text-[10px] font-black uppercase tracking-widest">
              <Plus size={18} /> Añadir Equipo
           </Link>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-center">
         <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4e564e]" />
            <input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121412] border border-[#0e312a] rounded-2xl pl-14 pr-4 py-5 text-sm outline-none focus:border-[#00ff88]/40 transition-all font-bold uppercase tracking-widest shadow-inner"
            />
         </div>
         <div className="flex items-center gap-2 p-1 bg-[#121412] border border-[#0e312a] rounded-2xl">
            {['todos', 'laptops', 'desktops'].map(f => (
              <button 
                key={f} onClick={() => setFilterTech(f as any)}
                className={cn("px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", filterTech === f ? "bg-[#00ff88] text-black" : "text-[#4e564e]")}
              > {f} </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {isLoading && equipos.length === 0 ? (
           <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={48} className="text-[#00ff88] animate-spin" />
              <p className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.4em] animate-pulse">Sincronizando Matriz...</p>
           </div>
         ) : filteredEquipos.length > 0 ? (
           filteredEquipos.map((e: any) => (
             <div 
               key={e.id}
               onClick={() => navigate(`/editar/${e.id}`)}
               className="card-matrix group cursor-pointer hover:border-[#00ff88]/30 transition-all p-8 relative overflow-hidden"
             >
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00ff88]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                   
                   {/* Equipo y ID */}
                   <div className="lg:col-span-4 flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center border transition-all",
                        e.es_laptop ? "bg-amber-500/5 border-amber-500/10 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.05)]" : "bg-[#00ff88]/5 border-[#00ff88]/10 text-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.05)]"
                      )}>
                         {e.es_laptop ? <Laptop size={28} strokeWidth={2.5} /> : <DesktopIcon size={28} strokeWidth={2.5} />}
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter line-clamp-1 group-hover:text-[#00ff88] transition-colors">{e.hostname}</h3>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_5px_#00ff88]" />
                         </div>
                         <p className="text-[9px] font-black text-[#4e564e] uppercase tracking-[0.2em] flex items-center gap-2">
                           ACTIVO: <span className="text-white font-mono">{e.codigo_activo || 'PENDIENTE'}</span>
                         </p>
                      </div>
                   </div>

                   {/* Datos de Hardware */}
                   <div className="lg:col-span-6 grid grid-cols-2 gap-4 border-l border-r border-[#0e312a] px-8 py-1">
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-[#4e564e] uppercase tracking-widest">Hardware</p>
                         <p className="text-[10px] font-bold text-white/90 truncate">{e.caracteristicas_pc}</p>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[9px] font-black text-[#4e564e] uppercase tracking-widest">RAM / Disco</p>
                         <p className="text-[10px] font-bold text-zinc-400">{e.memoria_ram || 'N/A'} - {e.disco || 'N/A'}</p>
                      </div>
                      <div className="col-span-1 pt-2 border-t border-[#0e312a]/50">
                         <p className="text-[9px] font-black text-[#00ff88] uppercase tracking-widest">S.O.</p>
                         <p className="text-[10px] font-bold text-white/70 truncate uppercase">{e.sistema_operativo}</p>
                      </div>
                      <div className="col-span-1 pt-2 border-t border-[#0e312a]/50">
                         <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Monitores</p>
                         <p className="text-[10px] font-bold text-white/70 truncate uppercase">{e.monitores || 'Standar'}</p>
                      </div>
                   </div>


                   {/* Acciones Rápidas */}
                   <div className="lg:col-span-2 flex items-center justify-end gap-3 px-4">
                      <button 
                        onClick={(evt) => { evt.stopPropagation(); navigate(`/editar/${e.id}`); }}
                        className="p-4 bg-[#1a1c1a] hover:bg-[#00ff88] text-[#4e564e] hover:text-black rounded-2xl transition-all border border-[#0e312a] hover:border-[#00ff88] shadow-lg"
                      > <Edit2 size={18} /> </button>
                      <button 
                        onClick={(ev) => { ev.stopPropagation(); handleActionDelete(e.id, e.hostname); }}
                        className="p-4 bg-[#1a1c1a] hover:bg-red-500 text-[#4e564e] hover:text-white rounded-2xl transition-all border border-[#0e312a] hover:border-red-500 shadow-lg"
                      > <Trash2 size={18} /> </button>
                   </div>

                </div>
             </div>
           ))
         ) : (
           <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-[#0e312a] rounded-[2.5rem] space-y-4">
              <ShieldAlert size={48} className="text-[#0e312a]" />
              <p className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.4em]">Sin nodos en el sector</p>
           </div>
         )}
      </div>
    </div>
  )
}

export default InventoryPage
