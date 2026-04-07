import React, { useState, useEffect } from 'react'
import { 
  User, 
  ChevronLeft,
  Terminal,
  ArrowRight,
  Globe,
  Monitor,
  Laptop,
  Cpu,
  RefreshCw,
  Info
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { cn } from '../lib/utils'

const EditEquipmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { equipos, updateEquipo, isLoading } = useEquipmentStore()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    hostname: '',
    username: '',
    ip_local: '',
    caracteristicas_pc: '',
    numero_serie: '',
    marca_pc: '',
    es_escritorio: false,
    es_laptop: false,
    memoria_ram: '',
    sistema_operativo: '',
    sku: ''
  })

  useEffect(() => {
    const equipo = equipos.find(e => e.id === id)
    if (equipo) {
      setFormData({
        hostname: equipo.hostname || '',
        username: equipo.username || '',
        ip_local: equipo.ip_local || '',
        caracteristicas_pc: equipo.caracteristicas_pc || '',
        numero_serie: equipo.numero_serie || '',
        marca_pc: equipo.marca_pc || '',
        es_escritorio: equipo.es_escritorio || false,
        es_laptop: equipo.es_laptop || false,
        memoria_ram: equipo.memoria_ram || '',
        sistema_operativo: equipo.sistema_operativo || '',
        sku: equipo.sku || ''
      })
    }
  }, [id, equipos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      if (!formData.hostname) {
        toast.error('El Hostname es obligatorio')
        return
      }
      await updateEquipo(id, formData)
      toast.success('Matriz Técnica actualizada')
      navigate('/inventario')
    } catch (error) {
      toast.error('Error al guardar cambios')
    }
  }

  if (isLoading && !formData.hostname) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
         <RefreshCw className="w-12 h-12 text-primary-500 animate-spin opacity-20" />
         <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sincronizando con Iceberg Vault...</span>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in max-w-5xl mx-auto font-bold">
      <header className="flex flex-col gap-4 pb-6 border-b border-white/5 font-bold">
        <Link to="/inventario" className="flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-primary-500 transition-all uppercase tracking-widest w-fit group">
           <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Volver a la Matriz
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 font-bold">
          <div className="space-y-1 font-bold">
             <div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-[0.3em]">
                <Cpu size={12} />
                <span>Editor de Telemetría</span>
             </div>
             <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Editar Activo IT</h1>
             <p className="text-sm text-zinc-500 font-bold uppercase tracking-tight">Modificando registro: <span className="text-primary-400">{formData.hostname}</span></p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 font-bold">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
            {/* Identity Module */}
            <div className="card-premium p-8 space-y-6 border-l-4 border-l-primary-500/50 font-bold">
               <div className="flex items-center gap-3 pb-4 border-b border-white/5 font-bold">
                  <Globe size={18} className="text-primary-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Identidad de Red</h3>
               </div>
               
               <div className="space-y-4 font-bold">
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Hostname (ID Única)</label>
                     <input
                       type="text"
                       required
                       value={formData.hostname}
                       onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                       className="input-v10 font-mono font-black italic bg-white/[0.03] text-primary-400 uppercase"
                       placeholder="PC-SENA"
                     />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">IP Local</label>
                     <input
                       type="text"
                       value={formData.ip_local}
                       onChange={(e) => setFormData({ ...formData, ip_local: e.target.value })}
                       className="input-v10 font-mono text-zinc-400"
                       placeholder="192.168.1.1"
                     />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Usuario del Sistema</label>
                     <div className="relative font-bold">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="input-v10 pl-10 text-sm font-bold"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Hardware Module */}
            <div className="card-premium p-8 space-y-6 border-l-4 border-l-emerald-500/50 font-bold">
               <div className="flex items-center gap-3 pb-4 border-b border-white/5 font-bold">
                  <Terminal size={18} className="text-emerald-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Especificaciones de Hardware</h3>
               </div>

               <div className="grid grid-cols-2 gap-4 font-bold">
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Memoria RAM</label>
                     <input type="text" value={formData.memoria_ram} onChange={(e) => setFormData({ ...formData, memoria_ram: e.target.value })} className="input-v10 text-xs text-emerald-400 font-black" />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Marca Equipo</label>
                     <input type="text" value={formData.marca_pc} onChange={(e) => setFormData({ ...formData, marca_pc: e.target.value })} className="input-v10 text-xs uppercase" />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Número de Serie</label>
                     <input type="text" value={formData.numero_serie} onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })} className="input-v10 text-xs font-mono uppercase" />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Sistema Operativo</label>
                     <input type="text" value={formData.sistema_operativo} onChange={(e) => setFormData({ ...formData, sistema_operativo: e.target.value })} className="input-v10 text-[10px] uppercase font-bold" />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">System SKU</label>
                     <input type="text" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} className="input-v10 text-[10px] uppercase font-bold text-primary-400" placeholder="N/D" />
                  </div>
               </div>

               <div className="pt-4 space-y-4 font-bold">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Tipo de Chassis</span>
                  <div className="grid grid-cols-2 gap-3 font-bold">
                     <button type="button" onClick={() => setFormData({...formData, es_laptop: true, es_escritorio: false})}
                       className={cn("p-4 rounded-xl border flex items-center gap-3 transition-all", formData.es_laptop ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-white/[0.02] border-white/5 text-zinc-600")}>
                        <Laptop size={16} /> <span className="text-[9px] font-black uppercase">Laptop</span>
                     </button>
                     <button type="button" onClick={() => setFormData({...formData, es_laptop: false, es_escritorio: true})}
                       className={cn("p-4 rounded-xl border flex items-center gap-3 transition-all", formData.es_escritorio ? "bg-blue-500/10 border-blue-500 text-blue-500" : "bg-white/[0.02] border-white/5 text-zinc-600")}>
                        <Monitor size={16} /> <span className="text-[9px] font-black uppercase">Escritorio</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Characteristics Module */}
         <div className="card-premium p-8 space-y-4 border-l-4 border-l-zinc-500/50 font-bold">
            <div className="flex items-center gap-3 font-bold">
               <Info size={14} className="text-zinc-500" />
               <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Características Detalladas del PC (Telemetría)</label>
            </div>
            <textarea
              value={formData.caracteristicas_pc}
              onChange={(e) => setFormData({ ...formData, caracteristicas_pc: e.target.value })}
              className="input-v10 min-h-[100px] font-mono text-[11px] text-zinc-400 italic"
              placeholder="Detalles capturados por el agente..."
            />
         </div>

         <div className="flex items-center justify-between p-8 bg-zinc-900/50 rounded-3xl border border-white/5 font-bold">
            <div className="flex flex-col font-bold">
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Última actualización</span>
               <span className="text-[11px] font-bold text-zinc-400 tracking-tighter uppercase italic">Control de Telemetría Real-Time activado</span>
            </div>
            <div className="flex gap-4 font-bold">
               <button type="button" onClick={() => navigate('/inventario')} className="px-6 py-2.5 text-xs font-black text-zinc-600 hover:text-zinc-300 transition-all uppercase tracking-widest">Cancelar</button>
               <button type="submit" className="btn-v10-primary px-10 font-bold">
                  Actualizar Registro <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      </form>
    </div>
  )
}

export default EditEquipmentPage
