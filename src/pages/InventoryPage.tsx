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
    <div className="space-y-6 animate-in pb-10 font-sans text-white">
      {/* Header Sección Principal - Ultra Compacto */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#0e312a]/50 relative">
        <div className="space-y-1">
           <div className="flex items-center gap-2 text-[#00ff88] font-semibold text-[9px] uppercase tracking-[0.4em]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] shadow-[0_0_10px_#00ff88] animate-pulse" />
              <span className="text-glow">Sistemas Iceberg</span>
           </div>
           <h1 className="text-2xl md:text-3xl font-bold tracking-tighter italic uppercase leading-tight text-white/90">
              Gestión de <span className="text-[#00ff88]">Inventario</span>
           </h1>
        </div>
        <div className="flex flex-wrap gap-2 text-white">
           <button onClick={exportToExcel} className="px-5 py-3 rounded-xl bg-[#121412]/30 border border-[#0e312a]/30 text-[#4e564e] hover:text-[#00ff88] transition-all flex items-center gap-2 font-semibold text-[8px] uppercase tracking-widest backdrop-blur-xl group hover:border-[#00ff88]/30">
              <FileSpreadsheet size={14} /> Reporte Excel
           </button>
           <button onClick={handleRefresh} disabled={isRefreshing} className="px-5 py-3 rounded-xl bg-[#121412]/30 border border-[#0e312a]/30 text-[#4e564e] hover:text-[#00ff88] transition-all flex items-center gap-2 font-semibold text-[8px] uppercase tracking-widest hover:border-[#00ff88]/30">
              <RefreshCcw size={14} className={isRefreshing ? "animate-spin" : ""} /> Sync
           </button>
           <Link to="/crear" className="btn-matrix flex items-center gap-2 px-6 py-3 text-[9px] font-bold uppercase tracking-widest">
              <Plus size={16} /> Agregar
           </Link>
        </div>
      </header>

      {/* Barra de Búsqueda y Filtros Compacta */}
      <div className="flex flex-col lg:flex-row gap-2 items-center bg-[#0d0f0d]/50 p-1.5 rounded-xl border border-[#0e312a]/30 backdrop-blur-md">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#4e564e]" />
            <input
              placeholder="BUSCAR EQUIPO..."
              value={searchTerm}
              onChange={(e) => {
                const val = e.target.value;
                setSearchTerm(val);
                const params = new URLSearchParams(window.location.search);
                if (val) params.set('search', val);
                else params.delete('search');
                navigate({ search: params.toString() }, { replace: true });
              }}
              className="w-full bg-transparent border-none rounded-lg pl-9 pr-4 py-2 text-[9px] outline-none focus:ring-0 transition-all font-semibold uppercase tracking-widest text-[#00ff88] placeholder:text-[#2a302a]"
            />
         </div>
         <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-lg">
            {['todos', 'laptops', 'desktops'].map(f => (
              <button 
                key={f} onClick={() => setFilterTech(f as any)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[7px] font-bold uppercase tracking-widest transition-all", 
                  filterTech === f ? "bg-gradient-to-r from-[#00ff88] to-[#10ef87] text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]" : "text-[#4e564e] hover:text-white"
                )}
              > {f} </button>
            ))}
         </div>
      </div>

      {/* Grilla de Equipos - Densidad ULTRA Alta */}
      <div className="grid grid-cols-1 gap-2 text-white">
         {isLoading && equipos.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 size={24} className="text-[#00ff88] animate-spin opacity-30" />
              <p className="text-[8px] font-semibold text-[#00ff88] uppercase tracking-[0.3em] opacity-50">Accediendo...</p>
           </div>
         ) : filteredEquipos.length > 0 ? (
           filteredEquipos.map((e: any) => (
             <div key={e.id} onClick={() => navigate(`/editar/${e.id}`)} className="group relative">
                <div className="card-matrix relative bg-[#090a09]/50 backdrop-blur-xl border border-[#0e312a]/20 hover:border-[#00ff88]/30 transition-all duration-300 p-3 rounded-2xl overflow-hidden cursor-pointer shadow-xl">
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      
                      {/* Identidad Mini */}
                      <div className="lg:col-span-3 flex items-center gap-3">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-inner shrink-0",
                           e.es_laptop ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-[#00ff88]/10 border-[#00ff88]/20 text-[#00ff88]"
                         )}>
                            {e.es_laptop ? <Laptop size={20} /> : <DesktopIcon size={20} />}
                         </div>
                         <div className="space-y-0.5 min-w-0">
                            <h3 className="text-base font-bold italic uppercase tracking-tighter group-hover:text-[#00ff88] transition-colors leading-tight truncate">{e.hostname}</h3>
                            <div className="flex items-center gap-1.5">
                               <span className="text-[7px] font-semibold text-white/30 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 uppercase truncate">{e.codigo_activo || 'S/N ACT'}</span>
                               <span className="flex items-center gap-1 text-[7px] font-bold text-[#00ff88] uppercase opacity-70"><div className="w-0.5 h-0.5 rounded-full bg-[#00ff88] animate-pulse" /> ON</span>
                            </div>
                         </div>
                      </div>

                      {/* Hardware Ultra Compacto */}
                      <div className="lg:col-span-1 lg:border-l lg:border-[#0e312a]/30 lg:pl-4 overflow-hidden">
                          <p className="text-[7px] font-bold text-[#4e564e] uppercase mb-0.5">Marca</p>
                          <p className="text-[8.5px] font-semibold text-zinc-400 truncate uppercase leading-tight">{e.marca_pc || 'Generic'}</p>
                      </div>

                      <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-4 lg:border-l lg:border-[#0e312a]/30 lg:pl-6 py-0.5">
                         <div className="overflow-hidden">
                            <p className="text-[7px] font-bold text-[#4e564e] uppercase flex items-center gap-1.5 mb-0.5"><Zap size={8} className="text-[#00ff88]/50" /> Procesador</p>
                            <p className="text-[8.5px] font-semibold text-zinc-300 truncate uppercase leading-tight">{e.caracteristicas_pc || 'GENERIC'}</p>
                         </div>
                         <div className="overflow-hidden">
                            <p className="text-[7px] font-bold text-[#4e564e] uppercase mb-0.5">Sistema</p>
                            <p className="text-[8.5px] font-semibold text-white/40 truncate uppercase leading-tight">{e.sistema_operativo?.replace('Microsoft ', '')}</p>
                         </div>
                         <div className="overflow-hidden hidden md:block">
                            <p className="text-[7px] font-bold text-[#4e564e] uppercase mb-0.5">Memoria/Disco</p>
                            <p className="text-[8.5px] font-semibold text-zinc-500 uppercase leading-tight">{e.memoria_ram || 'N/A'} • {e.disco || 'N/A'}</p>
                         </div>
                      </div>

                      {/* Acciones Micro */}
                      <div className="lg:col-span-2 flex items-center justify-end gap-1.5">
                         <button onClick={(evt) => { evt.stopPropagation(); navigate(`/editar/${e.id}`); }} className="w-8 h-8 bg-white/5 hover:bg-[#00ff88] text-white/30 hover:text-black rounded-lg transition-all border border-white/5 flex items-center justify-center backdrop-blur-md shadow-lg group/btn hover:scale-105 active:scale-95"><Edit2 size={12} /></button>
                         <button onClick={(ev) => { ev.stopPropagation(); handleActionDelete(e.id, e.hostname); }} className="w-8 h-8 bg-white/5 hover:bg-red-500 text-white/30 hover:text-white rounded-lg transition-all border border-white/5 flex items-center justify-center backdrop-blur-md shadow-lg group/btn hover:scale-105 active:scale-95"><Trash2 size={12} /></button>
                      </div>

                   </div>
                </div>
             </div>
           ))
         ) : (
           <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[#0e312a]/50 rounded-2xl space-y-3 bg-[#090a09]/20 backdrop-blur-sm">
              <ShieldAlert size={32} className="text-[#0e312a]" />
              <p className="text-[9px] font-semibold text-[#4e564e] uppercase tracking-[0.4em] italic">Cero registros</p>
           </div>
         )}
      </div>
   )
}

export default InventoryPage
