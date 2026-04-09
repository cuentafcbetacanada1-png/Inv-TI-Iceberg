import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
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

  const exportToExcel = async () => {
    if (equipos.length === 0) return toast.error('No hay datos para exportar')
    
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Inventario IT')

    const headerStyle = {
      font: { bold: true, italic: true, size: 11, name: 'Segoe UI' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9E9E9' } },
      alignment: { vertical: 'middle', horizontal: 'center' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }

    const columns = [
      { header: 'HOSTNAME', key: 'hostname', width: 22 },
      { header: 'USUARIO', key: 'username', width: 18 },
      { header: 'IP LOCAL', key: 'ip_local', width: 18 },
      { header: 'SISTEMA OPERATIVO', key: 'sistema_operativo', width: 35 },
      { header: 'PROCESADOR', key: 'caracteristicas_pc', width: 45 },
      { header: 'RAM', key: 'memoria_ram', width: 12 },
      { header: 'ALMACENAMIENTO', key: 'disco', width: 28 },
      { header: 'MARCA EQUIPO', key: 'marca_pc', width: 18 },
      { header: 'MODELO EQUIPO', key: 'modelo', width: 22 },
      { header: 'S/N EQUIPO', key: 'numero_serie', width: 20 },
      { header: 'MONITOR 1 MODELO', key: 'm1_model', width: 25 },
      { header: 'MONITOR 1 SERIAL', key: 'm1_serial', width: 22 },
      { header: 'MONITOR 2 MODELO', key: 'm2_model', width: 25 },
      { header: 'MONITOR 2 SERIAL', key: 'm2_serial', width: 22 },
      { header: 'FECHA REGISTRO', key: 'created_at', width: 22 }
    ]

    worksheet.columns = columns

    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.style = headerStyle as any;
    })

    equipos.forEach(e => {
      const monitorList = (e.monitores || '').split('\n')
      const parseMonitor = (str: string) => {
        const parts = str.split('|')
        const model = parts[0]?.replace('Modelo:', '').trim() || ''
        const serial = parts[1]?.replace('S/N:', '').trim() || ''
        return { model, serial }
      }
      const m1 = monitorList[0] ? parseMonitor(monitorList[0]) : { model: '', serial: '' }
      const m2 = monitorList[1] ? parseMonitor(monitorList[1]) : { model: '', serial: '' }

      const row = worksheet.addRow({
        hostname: e.hostname,
        username: e.username,
        ip_local: e.ip_local,
        sistema_operativo: e.sistema_operativo,
        caracteristicas_pc: e.caracteristicas_pc,
        memoria_ram: e.memoria_ram,
        disco: e.disco,
        marca_pc: e.marca_pc,
        modelo: e.modelo,
        numero_serie: e.numero_serie,
        m1_model: m1.model,
        m1_serial: m1.serial,
        m2_model: m2.model,
        m2_serial: m2.serial,
        created_at: new Date(e.created_at).toLocaleString()
      })

      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' }
        cell.font = { size: 10, name: 'Segoe UI' }
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        }
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(data, `REPORTE_INVENTARIO_ICEBERG_${new Date().toISOString().split('T')[0]}.xlsx`)
    
    toast.success('Excel Ejecutivo generado con éxito')
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
    <div className="space-y-8 animate-in pb-12 font-sans text-white">
      {/* Header Sección Principal - Compacto */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#00ff88]/10 relative">
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-[#00ff88] font-black text-[10px] uppercase tracking-[0.4em]">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse" />
              <span>Nodos Iceberg IT</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase leading-tight">
              Control de <span className="text-[#00ff88] drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">Inventario</span>
           </h1>
        </div>
        <div className="flex flex-wrap gap-3">
           <button onClick={exportToExcel} className="px-6 py-4 rounded-xl bg-[#121412]/50 border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] transition-all flex items-center gap-2.5 font-bold text-[9px] uppercase tracking-widest backdrop-blur-xl group">
              <FileSpreadsheet size={16} /> Exportar Reporte
           </button>
           <button onClick={handleRefresh} disabled={isRefreshing} className="px-6 py-4 rounded-xl bg-[#121412]/50 border border-[#0e312a] text-[#4e564e] hover:text-[#00ff88] transition-all flex items-center gap-2.5 font-bold text-[9px] uppercase tracking-widest">
              <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} /> Sincronizar
           </button>
           <Link to="/crear" className="btn-matrix flex items-center gap-2 px-8 py-4 text-[9px] font-bold uppercase tracking-widest">
              <Plus size={18} /> Nuevo Activo
           </Link>
        </div>
      </header>

      {/* Barra de Búsqueda y Filtros - Más densa */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-[#0d0f0d]/80 p-2 rounded-2xl border border-[#0e312a]/50">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4e564e]" />
            <input
              placeholder="ESCANEAR HOSTNAME, USUARIO O S/N..."
              value={searchTerm}
              onChange={(e) => {
                const val = e.target.value;
                setSearchTerm(val);
                const params = new URLSearchParams(window.location.search);
                if (val) params.set('search', val);
                else params.delete('search');
                navigate({ search: params.toString() }, { replace: true });
              }}
              className="w-full bg-transparent border-none rounded-xl pl-12 pr-4 py-4 text-[11px] outline-none focus:ring-1 ring-[#00ff88]/10 transition-all font-bold uppercase tracking-widest text-[#00ff88] placeholder:text-[#2a302a]"
            />
         </div>
         <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl">
            {['todos', 'laptops', 'desktops'].map(f => (
              <button 
                key={f} onClick={() => setFilterTech(f as any)}
                className={cn(
                  "px-6 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", 
                  filterTech === f ? "bg-[#00ff88] text-black" : "text-[#4e564e] hover:text-white"
                )}
              > {f} </button>
            ))}
         </div>
      </div>

      {/* Grilla de Equipos - Más eficiente */}
      <div className="grid grid-cols-1 gap-4">
         {isLoading && equipos.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 size={40} className="text-[#00ff88] animate-spin opacity-40" />
              <p className="text-[10px] font-black text-[#00ff88] uppercase tracking-[0.4em]">Cargando Matriz...</p>
           </div>
         ) : filteredEquipos.length > 0 ? (
           filteredEquipos.map((e: any) => (
             <div key={e.id} onClick={() => navigate(`/editar/${e.id}`)} className="group relative">
                <div className="card-matrix relative bg-[#090a09]/80 backdrop-blur-xl border border-[#0e312a] hover:border-[#00ff88]/30 transition-all duration-300 p-6 rounded-2xl overflow-hidden cursor-pointer">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      
                      {/* Lado Izquierdo: Identidad */}
                      <div className="lg:col-span-4 flex items-center gap-5">
                         <div className={cn(
                           "w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300",
                           e.es_laptop ? "bg-amber-500/5 border-amber-500/10 text-amber-500" : "bg-[#00ff88]/5 border-[#00ff88]/10 text-[#00ff88]"
                         )}>
                            {e.es_laptop ? <Laptop size={28} /> : <DesktopIcon size={28} />}
                         </div>
                         <div className="space-y-1">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter group-hover:text-[#00ff88] transition-colors leading-none">{e.hostname}</h3>
                            <div className="flex items-center gap-2">
                               <span className="text-[8px] font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded uppercase border border-white/5">{e.codigo_activo || 'S/N ACT'}</span>
                               <span className="flex items-center gap-1 text-[8px] font-black text-[#00ff88] uppercase opacity-70"><div className="w-1 h-1 rounded-full bg-[#00ff88]" /> ONLINE</span>
                            </div>
                         </div>
                      </div>

                      {/* Centro: Hardware */}
                      <div className="lg:col-span-6 grid grid-cols-2 gap-4 lg:border-l lg:border-white/5 lg:pl-8">
                         <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[#4e564e] uppercase flex items-center gap-1.5"><Zap size={8} /> CPU</p>
                            <p className="text-[10px] font-bold text-white/80 truncate uppercase">{e.caracteristicas_pc || 'GENERIC'}</p>
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[#4e564e] uppercase">MEM / DISK</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase">{e.memoria_ram || 'N/A'} • {e.disco || 'N/A'}</p>
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-[#00ff88]/60 uppercase">OPERATING SYSTEM</p>
                            <p className="text-[10px] font-bold text-white/60 truncate uppercase">{e.sistema_operativo}</p>
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-indigo-400/60 uppercase">MONITORS</p>
                            <p className="text-[9px] font-bold text-white/40 uppercase truncate">{e.monitores || 'Internal'}</p>
                         </div>
                      </div>

                      {/* Derecha: Acciones */}
                      <div className="lg:col-span-2 flex items-center justify-end gap-2">
                         <button onClick={(evt) => { evt.stopPropagation(); navigate(`/editar/${e.id}`); }} className="w-10 h-10 bg-[#1a1c1a] hover:bg-[#00ff88] text-[#4e564e] hover:text-black rounded-lg transition-all border border-[#0e312a] flex items-center justify-center group/btn"><Edit2 size={16} /></button>
                         <button onClick={(ev) => { ev.stopPropagation(); handleActionDelete(e.id, e.hostname); }} className="w-10 h-10 bg-[#1a1c1a] hover:bg-red-500 text-[#4e564e] hover:text-white rounded-lg transition-all border border-[#0e312a] flex items-center justify-center group/btn"><Trash2 size={16} /></button>
                      </div>

                   </div>
                </div>
             </div>
           ))
         ) : (
           <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#0e312a] rounded-2xl space-y-4 bg-[#090a09]/30">
              <ShieldAlert size={40} className="text-[#0e312a]" />
              <p className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.3em]">Cero equipos detectados</p>
           </div>
         )}
      </div>
    </div>
  )
}

export default InventoryPage
