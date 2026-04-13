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
        
        const now = new Date()
        const dia = now.toLocaleDateString('es-ES', { weekday: 'long' })
        const fecha = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
        const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        
        toast.success(`Equipo ${name} ha sido eliminado correctamente, por Administrador, ${dia}, ${fecha} y ${hora} exactamente`);
      } catch (err: any) {
        toast.error(`Fallo en la matriz: ${err.message || 'Error Desconocido'}`);
      }
    }
  }

  // ... exportToExcel function (omitted for brevity, keeping same logic) ...
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
    <div className="space-y-6 animate-in pb-12 font-sans text-white">
      {/* Header Sección Principal */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-[#0e312a]/50 relative">
        <div className="space-y-1">
           <div className="flex items-center gap-2 text-[#00ff88] font-semibold text-[10px] uppercase tracking-[0.3em]">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_12px_#00ff88] animate-pulse" />
              <span className="text-glow">Red Iceberg</span>
           </div>
           <h1 className="text-2xl font-bold tracking-tight uppercase text-white/95 leading-none">
              Control de <span className="text-[#00ff88]">Inventario</span>
           </h1>
        </div>
        <div className="flex flex-wrap gap-2 text-white">
           <button onClick={exportToExcel} className="px-6 py-2.5 rounded-xl bg-[#121412]/30 border border-[#0e312a]/30 text-[#889288] hover:text-[#00ff88] transition-all flex items-center gap-2 font-semibold text-[10px] uppercase tracking-widest backdrop-blur-xl group hover:border-[#00ff88]/30 shrink-0">
              <FileSpreadsheet size={16} /> Exportar Reporte
           </button>
           <button onClick={handleRefresh} disabled={isRefreshing} className="px-6 py-2.5 rounded-xl bg-[#121412]/30 border border-[#0e312a]/30 text-[#889288] hover:text-[#00ff88] transition-all flex items-center gap-2 font-semibold text-[10px] uppercase tracking-widest hover:border-[#00ff88]/30 shrink-0">
              <RefreshCcw size={16} className={isRefreshing ? "animate-spin" : ""} /> Sincronizar
           </button>
           <Link to="/crear" className="btn-matrix flex items-center gap-2 px-8 py-2.5 text-[10px] font-semibold uppercase tracking-widest shrink-0 shadow-lg">
              <Plus size={18} /> Nuevo Nodo
           </Link>
        </div>
      </header>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col lg:flex-row gap-3 items-center bg-[#0d0f0d]/50 p-2 rounded-2xl border border-[#0e312a]/30 backdrop-blur-md">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4e564e]" />
            <input
              placeholder="IDENTIFICAR EQUIPO..."
              value={searchTerm}
              onChange={(e) => {
                const val = e.target.value;
                setSearchTerm(val);
                const params = new URLSearchParams(window.location.search);
                if (val) params.set('search', val);
                else params.delete('search');
                navigate({ search: params.toString() }, { replace: true });
              }}
              className="w-full bg-transparent border-none rounded-xl pl-10 pr-4 py-3 text-[11px] outline-none focus:ring-0 transition-all font-semibold uppercase tracking-widest text-[#00ff88] placeholder:text-[#2a302a]"
            />
         </div>
         <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl">
            {['todos', 'laptops', 'desktops'].map(f => (
              <button 
                key={f} onClick={() => setFilterTech(f as any)}
                className={cn(
                  "px-5 py-2 rounded-lg text-[9px] font-semibold uppercase tracking-widest transition-all", 
                  filterTech === f ? "bg-gradient-to-r from-[#00ff88] to-[#10ef87] text-black" : "text-[#4e564e] hover:text-white"
                )}
              > {f} </button>
            ))}
         </div>
      </div>

      {/* Grilla de Equipos */}
      <div className="grid grid-cols-1 gap-3 text-white">
         {isLoading && equipos.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-8 h-8 border-2 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin shadow-[0_0_15px_#00ff8820]" />
              <p className="text-[10px] font-semibold text-[#00ff88] uppercase tracking-[0.4em] opacity-50">Consultando Matriz...</p>
           </div>
         ) : filteredEquipos.length > 0 ? (
           filteredEquipos.map((e: any) => (
             <div key={e.id} onClick={() => navigate(`/editar/${e.id}`)} className="group relative">
                <div className="card-matrix relative bg-[#090a09]/40 backdrop-blur-md border border-[#0e312a]/30 hover:border-[#00ff88]/50 transition-all p-4 rounded-2xl cursor-pointer">
                   <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                      
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                         <div className={cn(
                           "w-12 h-12 rounded-xl flex items-center justify-center border transition-all shrink-0 shadow-inner group-hover:scale-105 duration-300",
                           e.es_laptop ? "bg-amber-500/10 border-amber-500/40 text-amber-500" : "bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88]"
                         )}>
                            {e.es_laptop ? <Laptop size={20} /> : <DesktopIcon size={20} />}
                         </div>
                         <div className="space-y-0.5 min-w-0">
                            <h3 className="text-base font-semibold uppercase tracking-tight group-hover:text-[#00ff88] transition-colors leading-tight truncate">{e.hostname}</h3>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-medium text-white/50 truncate tracking-wide">{e.username}</span>
                               <span className="w-1 h-1 rounded-full bg-white/20" />
                               <span className="text-[9px] font-semibold text-[#00ff88] uppercase opacity-80 tracking-widest">SISTEMA ACTIVO</span>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 items-center flex-[2.5] w-full lg:w-auto">
                         <div className="overflow-hidden">
                             <p className="text-[8px] font-semibold text-[#4e564e] uppercase mb-1 tracking-widest">Fabricante</p>
                             <p className="text-[10px] font-medium text-zinc-300 truncate uppercase leading-tight">{e.marca_pc || 'GENÉRICO'} / {e.modelo || 'S/D'}</p>
                         </div>
                         <div className="overflow-hidden">
                            <p className="text-[8px] font-semibold text-[#4e564e] uppercase mb-1 tracking-widest">Capacidad</p>
                            <p className="text-[10px] font-medium text-zinc-200 truncate uppercase">{e.memoria_ram || 'S/D'} RAM • {e.disco || 'S/D'}</p>
                         </div>
                         <div className="overflow-hidden">
                            <p className="text-[8px] font-semibold text-[#4e564e] uppercase mb-1 tracking-widest">IP de Red</p>
                            <p className="text-[10px] font-semibold text-[#00ff88]/70 truncate uppercase font-mono">{e.ip_local || 'PENDIENTE'}</p>
                         </div>
                         <div className="overflow-hidden hidden lg:block">
                            <p className="text-[8px] font-semibold text-[#4e564e] uppercase mb-1 tracking-widest">Identificador</p>
                            <p className="text-[10px] font-medium text-zinc-500 uppercase truncate">{e.numero_serie || 'N/A'}</p>
                         </div>
                      </div>

                      <div className="flex items-center justify-end gap-2.5 shrink-0">
                         <button onClick={(evt) => { evt.stopPropagation(); navigate(`/editar/${e.id}`); }} className="w-9 h-9 bg-white/5 hover:bg-[#00ff88] text-white/50 hover:text-black rounded-xl transition-all border border-white/5 flex items-center justify-center"><Edit2 size={14} /></button>
                         <button onClick={(ev) => { ev.stopPropagation(); handleActionDelete(e.id, e.hostname); }} className="w-9 h-9 bg-white/5 hover:bg-red-500 text-white/50 hover:text-white rounded-xl transition-all border border-white/5 flex items-center justify-center"><Trash2 size={14} /></button>
                      </div>

                   </div>
                </div>
             </div>
           ))
         ) : (
           <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#0e312a]/50 rounded-3xl space-y-4 bg-[#090a09]/20 backdrop-blur-sm">
              <ShieldAlert size={48} className="text-[#0e312a]" />
              <p className="text-xs font-bold text-[#4e564e] uppercase tracking-[0.5em] italic">Ninguna coincidencia encontrada</p>
           </div>
         )}
      </div>
    </div>
   )
}

export default InventoryPage
