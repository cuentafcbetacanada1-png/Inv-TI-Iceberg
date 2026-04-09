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
  FileSpreadsheet,
  Zap
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
      } catch (err: any) {
        // El error ya lo maneja el store con un toast descriptivo, 
        // pero aquí podemos añadir un log extra si queremos.
        console.error('Fallo en UI al borrar:', err)
      }
    }
  }

  const exportToCSV = () => {
    if (equipos.length === 0) return toast.error('No hay datos para exportar')
    
    const headers = ['Hostname', 'Usuario', 'IP Local', 'Serie', 'Marca', 'Modelo', 'RAM', 'Disco', 'SO', 'Características', 'Implementado']
    const rows = equipos.map(e => [
      e.hostname,
      e.username,
      e.ip_local,
      e.numero_serie,
      e.marca_pc,
      e.modelo,
      e.memoria_ram,
      e.disco,
      e.sistema_operativo,
      e.caracteristicas_pc?.replace(/,/g, ';'),
      new Date(e.created_at).toLocaleDateString()
    ])

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `inventario_it_iceberg_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
    <div className="space-y-8 animate-in pb-10 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#0e312a]">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[#00ff88] font-black text-[10px] uppercase tracking-[0.4em]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse" />
              <span>Gestión de Activos IT</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase drop-shadow-2xl font-sans">Inventario <span className="text-[#00ff88]">Iceberg IT</span></h1>
           <p className="text-sm text-[#4e564e] font-bold uppercase tracking-widest italic">Visibilidad total de la infraestructura.</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <button 
             onClick={exportToCSV}
             className="px-6 py-4 rounded-2xl bg-[#121412] border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl group"
           >
              <FileSpreadsheet size={16} className="group-hover:rotate-12 transition-transform" />
              Exportar CSV
           </button>
           <button 
             onClick={handleRefresh}
             disabled={isRefreshing || isLoading}
             className="px-6 py-4 rounded-2xl bg-[#121412] border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl"
           >
              <RefreshCcw size={16} className={cn(isRefreshing && "animate-spin")} />
              Actualizar
           </button>
           <Link to="/crear" className="btn-matrix flex items-center gap-3 px-8 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,136,0.2)]">
              <Plus size={18} />
              Añadir Equipo
           </Link>
        </div>
      </header>

      {/* Controles de Filtrado */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
         <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4e564e] group-focus-within:text-[#00ff88] transition-colors" />
            <input
              type="text"
              placeholder="Buscar por usuario, host, serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121412] border border-[#0e312a] rounded-2xl pl-14 pr-4 py-5 text-sm text-white outline-none focus:border-[#00ff88]/40 transition-all font-bold uppercase tracking-widest placeholder:text-[#0e312a] shadow-inner"
            />
         </div>
         <div className="flex items-center gap-2 p-1 bg-[#121412] border border-[#0e312a] rounded-2xl">
            <button 
              onClick={() => setFilterTech('todos')}
              className={cn("px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", filterTech === 'todos' ? "bg-[#00ff88] text-black shadow-lg" : "text-[#4e564e] hover:text-white")}
            >
               Todos
            </button>
            <button 
              onClick={() => setFilterTech('laptops')}
              className={cn("px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", filterTech === 'laptops' ? "bg-[#00ff88] text-black shadow-lg" : "text-[#4e564e] hover:text-white")}
            >
               Laptops
            </button>
            <button 
              onClick={() => setFilterTech('desktops')}
              className={cn("px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", filterTech === 'desktops' ? "bg-[#00ff88] text-black shadow-lg" : "text-[#4e564e] hover:text-white")}
            >
               PCs
            </button>
         </div>
      </div>

      <div className="card-matrix overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#121412]">
                <th className="px-6 py-5 text-left text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">Equipo</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">Usuario</th>
                <th className="px-6 py-5 text-left text-[10px) font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">IP Local</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">Hardware</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">Capacidad</th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-[#4e564e] uppercase tracking-widest border-b border-[#0e312a]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0e312a]">
              {isLoading && filteredEquipos.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-24 text-center">
                      <Loader2 className="w-8 h-8 text-[#00ff88] animate-spin mx-auto mb-4" />
                      <p className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest italic animate-pulse">Consultando la Matriz...</p>
                   </td>
                </tr>
              ) : filteredEquipos.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-8 py-24 text-center">
                      <Zap size={30} className="text-[#0e312a] mx-auto mb-4" />
                      <p className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest italic">Sin registros para este filtro</p>
                   </td>
                </tr>
              ) : (
                filteredEquipos.map((e) => (
                  <tr key={e.id} className="group hover:bg-white/[0.01] transition-colors font-sans px-4">
                    <td className="px-6 py-6 border-b border-[#0e312a]">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                            e.es_laptop ? "bg-amber-500/5 border-amber-500/10 text-amber-500" : "bg-[#00ff88]/5 border-[#00ff88]/10 text-[#00ff88]"
                          )}>
                             {e.es_laptop ? <Laptop size={18} /> : <Monitor size={18} />}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-black text-white uppercase italic tracking-tighter">{e.hostname}</span>
                             <span className="text-[9px] font-black text-[#4e564e] uppercase">{e.marca_pc}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-6 border-b border-[#0e312a]">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-white uppercase">{e.username}</span>
                          <span className="text-[9px] font-black text-[#4e564e] uppercase tracking-tighter italic">Nro: {e.numero_serie || 'S/N'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6 border-b border-[#0e312a]">
                       <code className="text-[10px] font-black text-[#00ff88] bg-[#00ff88]/5 px-2.5 py-1.5 rounded-lg border border-[#00ff88]/10 shadow-[0_0_15px_rgba(0,255,136,0.05)]">
                          {e.ip_local}
                       </code>
                    </td>
                     <td className="px-6 py-6 border-b border-[#0e312a]">
                        <div className="flex flex-col max-w-[200px]">
                           <span className="text-[10px] font-black text-white italic truncate" title={e.caracteristicas_pc}>{e.caracteristicas_pc || 'Procesador Genérico'}</span>
                           <span className="text-[9px] font-bold text-[#4e564e] uppercase mt-0.5">{e.sistema_operativo}</span>
                        </div>
                     </td>
                    <td className="px-6 py-6 border-b border-[#0e312a]">
                       <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                             <div className="h-1 flex-1 bg-[#0e312a] rounded-full overflow-hidden">
                                <div className="h-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" style={{ width: '100%' }} />
                             </div>
                             <span className="text-[9px] font-black text-[#00ff88] uppercase tracking-tighter">{e.memoria_ram}</span>
                          </div>
                          <span className="text-[9px] font-black text-[#4e564e] uppercase italic">{e.disco || 'SSD/HDD N/A'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-right border-b border-[#0e312a]">
                       <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <Link 
                            to={`/editar/${e.id}`}
                            className="p-3 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-2xl text-[#00ff88] hover:bg-[#00ff88] hover:text-black transition-all shadow-lg"
                          >
                             <Edit2 size={16} />
                          </Link>
                          <button 
                            onClick={(event) => {
                               event.stopPropagation();
                               handleDelete(e.id);
                            }}
                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
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
