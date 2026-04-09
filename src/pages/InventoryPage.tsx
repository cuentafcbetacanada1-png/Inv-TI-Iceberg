import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Edit2, 
  Trash2, 
  Monitor, 
  Laptop,
  Loader2,
  RefreshCcw,
  Plus,
  FileSpreadsheet,
  Zap,
  AlertCircle
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
    const searchString = `${e.username} ${e.hostname} ${e.numero_serie || ''} ${e.marca_pc || ''}`.toLowerCase()
    const matchesSearch = searchString.includes(searchTerm.toLowerCase())
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

      <div className="card-matrix overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#121412] text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">
                <th className="px-6 py-5 text-left">Equipo</th>
                <th className="px-6 py-5 text-left">Usuario</th>
                <th className="px-6 py-5 text-left">IP</th>
                <th className="px-6 py-5 text-left">Hardware</th>
                <th className="px-6 py-5 text-right">Mando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0e312a]">
              {isLoading && filteredEquipos.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center animate-pulse tracking-widest font-black text-[#4e564e]">Sincronizando...</td></tr>
              ) : filteredEquipos.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center italic font-black text-[#4e564e]">Sin Registros</td></tr>
              ) : (
                filteredEquipos.map((e) => (
                  <tr key={e.id} className="group hover:bg-[#00ff88]/5 transition-all">
                    <td className="px-6 py-6">
                       <div className="flex items-center gap-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", e.es_laptop ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20")}>
                             {e.es_laptop ? <Laptop size={18} /> : <Monitor size={18} />}
                          </div>
                          <span className="text-sm font-black italic tracking-tighter uppercase">{e.hostname}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-xs font-bold uppercase">{e.username}</td>
                    <td className="px-6 py-6 font-mono text-[10px] text-[#00ff88]">{e.ip_local}</td>
                    <td className="px-6 py-6">
                       <div className="text-[10px] font-black italic truncate max-w-[150px]">{e.caracteristicas_pc}</div>
                    </td>
                    <td className="px-6 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/editar/${e.id}`)}
                            className="p-3 bg-[#121412] border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] rounded-xl transition-all"
                          > <Edit2 size={16} /> </button>
                          
                          {/* BOTON DE BORRADO DE ALTA PRIORIDAD */}
                          <button 
                            type="button"
                            onClick={(ev) => {
                                ev.preventDefault();
                                ev.stopPropagation();
                                handleActionDelete(e.id, e.hostname);
                            }}
                            className="p-3 bg-red-500 text-white rounded-xl hover:bg-white hover:text-red-600 transition-all shadow-xl relative z-50 cursor-pointer"
                            title="Eliminar de Matriz"
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
