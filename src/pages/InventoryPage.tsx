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
    const urlSearch = searchParams.get('search') || ''
    setSearchTerm(urlSearch)
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

  const handleActionDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`ATENCIÓN: ¿Desea eliminar definitivamente el equipo [${name}]?`);
    if (confirmed) {
      try {
        await deleteEquipo(id);
        toast.success(`Equipo ${name} eliminado correctamente`);
      } catch (err: any) {
        toast.error(`Fallo en la matriz: ${err.message || 'Error Desconocido'}`);
      }
    }
  }

  const exportToCSV = () => {
    if (equipos.length === 0) return toast.error('No hay datos para exportar')
    const headers = [
      'HOSTNAME', 'USUARIO', 'IP LOCAL', 'SISTEMA OPERATIVO', 
      'PROCESADOR', 'RAM', 'ALMACENAMIENTO', 
      'MARCA EQUIPO', 'MODELO EQUIPO', 'S/N EQUIPO',
      'MONITOR 1 MODELO', 'MONITOR 1 SERIAL',
      'MONITOR 2 MODELO', 'MONITOR 2 SERIAL',
      'FECHA REGISTRO'
    ]

    const rows = equipos.map(e => {
      const monitorList = (e.monitores || '').split('\n')
      const parseMonitor = (str: string) => {
        const parts = str.split('|')
        const model = parts[0]?.replace('Modelo:', '').trim() || ''
        const serial = parts[1]?.replace('S/N:', '').trim() || ''
        return { model, serial }
      }
      const m1 = monitorList[0] ? parseMonitor(monitorList[0]) : { model: '', serial: '' }
      const m2 = monitorList[1] ? parseMonitor(monitorList[1]) : { model: '', serial: '' }

      return [
        e.hostname, e.username, e.ip_local, e.sistema_operativo,
        e.caracteristicas_pc?.replace(/,/g, ' '), e.memoria_ram, e.disco,
        e.marca_pc, e.modelo, e.numero_serie,
        m1.model, m1.serial, m2.model, m2.serial,
        new Date(e.created_at).toLocaleString()
      ]
    })

    const csvContent = "\uFEFF" + [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `REPORTE_INVENTARIO_ICEBERG_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Reporte Excel (CSV) generado con éxito')
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
    <div className="space-y-12 animate-in pb-20 font-sans text-white">
      {/* Header Sección Principal */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-[#00ff88]/10 relative">
        <div className="space-y-4">
           <div className="flex items-center gap-3 text-[#00ff88] font-black text-[11px] uppercase tracking-[0.5em]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88] shadow-[0_0_15px_#00ff88] animate-pulse" />
              <span>Sistemas de Control Iceberg</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
              Nodos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-emerald-400">Red</span>
           </h1>
           <p className="text-[#4e564e] text-xs font-bold uppercase tracking-[0.2em]">Visualización en tiempo real de la infraestructura tecnológica.</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <button onClick={exportToCSV} className="px-8 py-5 rounded-2xl bg-[#121412]/50 border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] hover:border-[#00ff88]/30 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest backdrop-blur-xl group">
              <FileSpreadsheet size={18} className="group-hover:scale-110 transition-transform" /> Exportar Reporte
           </button>
           <button onClick={handleRefresh} disabled={isRefreshing} className="px-8 py-5 rounded-2xl bg-[#121412]/50 border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest backdrop-blur-xl">
              <RefreshCcw size={18} className={isRefreshing ? "animate-spin" : "hover:rotate-180 transition-transform duration-500"} /> Sincronizar
           </button>
           <Link to="/crear" className="btn-matrix flex items-center gap-3 px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,255,136,0.15)]">
              <Plus size={20} /> Nuevo Activo
           </Link>
        </div>
      </header>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col lg:flex-row gap-8 items-center bg-[#0d0f0d] p-3 rounded-[2.5rem] border border-[#0e312a]/50">
         <div className="relative flex-1 w-full group">
            <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4e564e] group-focus-within:text-[#00ff88] transition-colors" />
            <input
              placeholder="ESCANEAR BASE DE DATOS (HOSTNAME, USUARIO, SERIE...)"
              value={searchTerm}
              onChange={(e) => {
                const val = e.target.value;
                setSearchTerm(val);
                const params = new URLSearchParams(window.location.search);
                if (val) params.set('search', val);
                else params.delete('search');
                navigate({ search: params.toString() }, { replace: true });
              }}
              className="w-full bg-[#121412]/30 border-none rounded-[2rem] pl-16 pr-8 py-6 text-xs outline-none focus:ring-1 ring-[#00ff88]/20 transition-all font-black uppercase tracking-[0.15em] text-[#00ff88] placeholder:text-[#2a2f2a]"
            />
         </div>
         <div className="flex items-center gap-3 p-2 bg-black/40 rounded-[1.8rem] border border-white/5">
            {['todos', 'laptops', 'desktops'].map(f => (
              <button 
                key={f} onClick={() => setFilterTech(f as any)}
                className={cn(
                  "px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300", 
                  filterTech === f ? "bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.2)]" : "text-[#4e564e] hover:text-white"
                )}
              > {f} </button>
            ))}
         </div>
      </div>

      {/* Grilla de Equipos */}
      <div className="grid grid-cols-1 gap-10">
         {isLoading && equipos.length === 0 ? (
           <div className="col-span-full flex flex-col items-center justify-center py-40 space-y-6">
              <div className="relative">
                <Loader2 size={64} className="text-[#00ff88] animate-spin opacity-20" />
                <Zap size={24} className="text-[#00ff88] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-[11px] font-black text-[#00ff88] uppercase tracking-[0.5em] animate-pulse">Iniciando Sincronización...</p>
           </div>
         ) : filteredEquipos.length > 0 ? (
           filteredEquipos.map((e: any) => (
             <div key={e.id} onClick={() => navigate(`/editar/${e.id}`)} className="group relative" >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00ff88]/0 via-[#00ff88]/10 to-[#00ff88]/0 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <div className="card-matrix relative bg-[#090a09]/80 backdrop-blur-2xl border border-[#0e312a] hover:border-[#00ff88]/40 transition-all duration-500 p-10 rounded-[2.5rem] overflow-hidden">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                      <div className="lg:col-span-4 flex items-center gap-8">
                         <div className={cn(
                           "w-24 h-24 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 group-hover:scale-110",
                           e.es_laptop ? "bg-amber-500/5 border-amber-500/10 text-amber-500" : "bg-[#00ff88]/5 border-[#00ff88]/10 text-[#00ff88]"
                         )}>
                            {e.es_laptop ? <Laptop size={44} strokeWidth={1.5} /> : <DesktopIcon size={44} strokeWidth={1.5} />}
                         </div>
                         <div className="space-y-3">
                            <h3 className="text-3xl font-black italic uppercase tracking-tighter group-hover:text-[#00ff88] transition-colors leading-none">{e.hostname}</h3>
                            <div className="flex items-center gap-3">
                               <span className="text-[9px] font-bold text-white uppercase px-3 py-1 bg-[#121412] border border-[#0e312a] rounded-lg">{e.codigo_activo || 'S/N ACTIVO'}</span>
                               <span className="text-[9px] font-black text-[#00ff88] uppercase px-3 py-1 bg-[#00ff88]/10 rounded-lg flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" /> ONLINE</span>
                            </div>
                         </div>
                      </div>
                      <div className="lg:col-span-6 grid grid-cols-2 gap-x-12 gap-y-6 lg:border-l lg:border-[#0e312a] lg:pl-12 lg:py-4">
                         <div>
                            <p className="text-[9px] font-black text-[#4e564e] uppercase flex items-center gap-2 mb-1"><Zap size={10} className="text-[#00ff88]" /> Arquitectura</p>
                            <p className="text-xs font-bold text-white/90 truncate uppercase">{e.caracteristicas_pc || 'CPU GENÉRICO'}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-[#4e564e] uppercase mb-1">Memoria / Disco</p>
                            <p className="text-xs font-bold text-zinc-400 uppercase">{e.memoria_ram || 'N/A'} • {e.disco || 'N/A'}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-[#00ff88] uppercase mb-1">Entorno O.S.</p>
                            <p className="text-xs font-bold text-white/70 truncate uppercase">{e.sistema_operativo}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase flex items-center gap-2 mb-1"><Server size={10} /> Monitores</p>
                            <p className="text-[10px] font-bold text-white/60 uppercase whitespace-pre-line leading-tight">{e.monitores || 'Integrada'}</p>
                         </div>
                      </div>
                      <div className="lg:col-span-2 flex items-center justify-end gap-4">
                         <button onClick={(evt) => { evt.stopPropagation(); navigate(`/editar/${e.id}`); }} className="w-14 h-14 bg-[#1a1c1a] hover:bg-[#00ff88] text-[#4e564e] hover:text-black rounded-2xl transition-all border border-[#0e312a] flex items-center justify-center group/btn"><Edit2 size={20} /></button>
                         <button onClick={(ev) => { ev.stopPropagation(); handleActionDelete(e.id, e.hostname); }} className="w-14 h-14 bg-[#1a1c1a] hover:bg-red-500 text-[#4e564e] hover:text-white rounded-2xl transition-all border border-[#0e312a] flex items-center justify-center group/btn"><Trash2 size={20} /></button>
                      </div>
                   </div>
                </div>
             </div>
           ))
         ) : (
           <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-[#0e312a] rounded-[3rem] space-y-6 bg-[#090a09]/50">
              <ShieldAlert size={60} className="text-[#0e312a]" />
              <p className="text-[12px] font-black text-[#4e564e] uppercase tracking-[0.5em]">No se detectan activos</p>
           </div>
         )}
      </div>
    </div>
  )
}

export default InventoryPage
