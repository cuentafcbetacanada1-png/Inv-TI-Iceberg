import React, { useState } from 'react'
import { 
  Laptop, 
  Monitor, 
  User, 
  ChevronLeft,
  Terminal,
  ArrowRight,
  Info,
  Globe,
  PlusCircle
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { cn } from '../lib/utils'

const CreateEquipmentPage: React.FC = () => {
  const { addEquipo } = useEquipmentStore()
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
    sistema_operativo: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!formData.hostname) {
        toast.error('El Hostname es obligatorio')
        return
      }
      await addEquipo(formData)
      toast.success('Nuevo activo registrado')
      navigate('/inventario')
    } catch (error) {
      toast.error('Error al registrar equipo')
    }
  }

  return (
    <div className="space-y-10 animate-in max-w-5xl mx-auto font-bold">
      <header className="flex flex-col gap-4 pb-6 border-b border-white/5 font-bold">
        <Link to="/inventario" className="flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-primary-500 transition-all uppercase tracking-widest w-fit group">
           <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Cancelar
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 font-bold">
          <div className="space-y-1 font-bold">
             <div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-[0.3em]">
                <PlusCircle size={12} />
                <span>Registro Manual de Activo</span>
             </div>
             <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Nuevo Equipo</h1>
             <p className="text-sm text-zinc-500 font-bold uppercase tracking-tight">Alta manual de hardware en la matriz centralizada.</p>
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
                       placeholder="PC-NUEVO"
                     />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">IP Local</label>
                     <input
                       type="text"
                       value={formData.ip_local}
                       onChange={(e) => setFormData({ ...formData, ip_local: e.target.value })}
                       className="input-v10 font-mono text-zinc-400"
                       placeholder="192.168.1.XX"
                     />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Usuario asignado</label>
                     <div className="relative font-bold">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="input-v10 pl-10 text-sm font-bold"
                          placeholder="Nombre del usuario..."
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Hardware Module */}
            <div className="card-premium p-8 space-y-6 border-l-4 border-l-emerald-500/50 font-bold">
               <div className="flex items-center gap-3 pb-4 border-b border-white/5 font-bold">
                  <Terminal size={18} className="text-emerald-400" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">Ficha Técnica</h3>
               </div>

               <div className="grid grid-cols-2 gap-4 font-bold">
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Memoria RAM</label>
                     <input type="text" value={formData.memoria_ram} onChange={(e) => setFormData({ ...formData, memoria_ram: e.target.value })} className="input-v10 text-xs" placeholder="Ej: 8GB" />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">Marca PC</label>
                     <input type="text" value={formData.marca_pc} onChange={(e) => setFormData({ ...formData, marca_pc: e.target.value })} className="input-v10 text-xs uppercase" />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">S/N</label>
                     <input type="text" value={formData.numero_serie} onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })} className="input-v10 text-xs font-mono uppercase" />
                  </div>
                  <div className="space-y-2 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block">S.O.</label>
                     <input type="text" value={formData.sistema_operativo} onChange={(e) => setFormData({ ...formData, sistema_operativo: e.target.value })} className="input-v10 text-[10px] font-bold" placeholder="Windows..." />
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
               <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Características Adicionales</label>
            </div>
            <textarea
              value={formData.caracteristicas_pc}
              onChange={(e) => setFormData({ ...formData, caracteristicas_pc: e.target.value })}
              className="input-v10 min-h-[100px] font-mono text-[11px] text-zinc-400 italic"
              placeholder="Especificaciones técnicas detalladas..."
            />
         </div>

         <div className="flex items-center justify-between p-8 bg-zinc-900/50 rounded-3xl border border-white/5 font-bold font-bold font-bold">
            <div className="flex flex-col font-bold">
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Estado del Registro</span>
               <span className="text-[11px] font-bold text-zinc-400 tracking-tighter uppercase italic">Listo para despliegue en matriz</span>
            </div>
            <div className="flex gap-4 font-bold">
               <button type="button" onClick={() => navigate('/inventario')} className="px-6 py-2.5 text-xs font-black text-zinc-600 hover:text-zinc-300 transition-all uppercase tracking-widest">Salir</button>
               <button type="submit" className="btn-v10-primary px-10 font-bold">
                  Registrar Activo <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
         </div>
      </form>
    </div>
  )
}

export default CreateEquipmentPage
