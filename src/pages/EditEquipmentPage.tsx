import React, { useState, useEffect } from 'react'
import { 
  User, 
  Hash, 
  ChevronLeft,
  Terminal,
  RefreshCw,
  ArrowRight,
  Globe,
  ShieldCheck,
  Laptop,
  Monitor,
  Settings,
  Cpu,
  History,
  Info
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { cn } from '../lib/utils'
import { motion } from 'framer-motion'

const EditEquipmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { equipos, updateEquipo, isLoading } = useEquipmentStore()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    equipo: 'Portátil' as 'Portátil' | 'Computador',
    hostname: '',
    ip_local: '',
    caracteristicas: '',
    validado: false,
    numero_inventario: '',
    fecha_entrega: '',
    numero_serie: '',
    marca_modelo_cpu: '',
    monitor: '',
    procesador: '',
    almacenamiento: '',
    ram: '',
    sistema_operativo: '',
    ubicacion: '',
    motivo_reemplazo: '',
    fecha_reemplazo: '',
    nuevo_funcionario: ''
  })

  useEffect(() => {
    const equipo = equipos.find(e => e.id === id)
    if (equipo) {
      setFormData({
        nombre_usuario: equipo.nombre_usuario || '',
        equipo: equipo.equipo as 'Portátil' | 'Computador' || 'Portátil',
        hostname: equipo.hostname || '',
        ip_local: equipo.ip_local || '',
        caracteristicas: equipo.caracteristicas || '',
        validado: equipo.validado || false,
        numero_inventario: equipo.numero_inventario || '',
        fecha_entrega: equipo.fecha_entrega || '',
        numero_serie: equipo.numero_serie || '',
        marca_modelo_cpu: equipo.marca_modelo_cpu || '',
        monitor: equipo.monitor || '',
        procesador: equipo.procesador || '',
        almacenamiento: equipo.almacenamiento || '',
        ram: equipo.ram || '',
        sistema_operativo: equipo.sistema_operativo || '',
        ubicacion: equipo.ubicacion || '',
        motivo_reemplazo: equipo.motivo_reemplazo || '',
        fecha_reemplazo: equipo.fecha_reemplazo || '',
        nuevo_funcionario: equipo.nuevo_funcionario || ''
      })
    }
  }, [id, equipos])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    try {
      if (!formData.nombre_usuario || !formData.hostname) {
         toast.error('Nombre y Hostname son requeridos')
         return
      }
      await updateEquipo(id, formData)
      toast.success('Equipo actualizado correctamente')
      navigate('/inventario')
    } catch (error) {
      toast.error('Fallo de sincronización con la red')
    }
  }

  if (isLoading && !formData.hostname) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6 font-bold text-zinc-400">
         <div className="relative">
           <RefreshCw className="w-12 h-12 text-primary-500 animate-spin opacity-20" />
           <div className="absolute inset-0 bg-primary-500/20 blur-2xl rounded-full" />
         </div>
         <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">Accediendo a la Base de Datos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in max-w-7xl mx-auto font-bold text-zinc-400">
      <header className="flex flex-col gap-4 pb-6 border-b border-white/5 relative font-bold">
        <Link to="/inventario" className="flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-primary-500 transition-all uppercase tracking-[0.2em] w-fit group">
           <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Volver al Registro
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 font-bold">
          <div className="space-y-1 font-bold">
             <div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-[0.3em]">
                <Settings size={12} />
                <span>Configuración de Activo</span>
             </div>
             <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Editar Equipo</h1>
             <p className="text-sm text-zinc-500 max-w-xl font-bold">Modificación de detalles técnicos y asignación para el equipo seleccionado.</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 px-4 py-2 rounded-xl backdrop-blur-md font-bold">
             <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Referencia Interna</span>
             <span className="text-[11px] font-black text-zinc-400 font-mono italic uppercase">ID_EQUIPO://{id?.slice(0,12)}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start font-bold">
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8 font-bold">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
              {/* Identity Module */}
              <div className="card-premium p-8 space-y-8 border-l-4 border-l-primary-500/50 font-bold">
                 <div className="flex items-center gap-3 pb-4 border-b border-white/5 font-bold">
                    <Globe size={18} className="text-primary-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Identidad del Activo</h3>
                 </div>

                 <div className="space-y-3 font-bold">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                       <User size={12} className="text-primary-500" /> Operador Responsable
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nombre_usuario}
                      onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                      className="input-v10 font-bold tracking-tight bg-white/[0.03] border-white/10"
                      placeholder="Identificación del usuario..."
                    />
                 </div>

                 <div className="space-y-3 font-bold">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Hash size={12} className="text-primary-500" /> Hostname / Alias
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hostname}
                      onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                      className="input-v10 font-mono font-black italic bg-white/[0.03] border-white/10 text-primary-400 uppercase tracking-tighter"
                      placeholder="ICE-EQUIPO-01"
                    />
                 </div>

                 <div className="space-y-4 pt-4 font-bold">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.1em] block mb-2">Clasificación de Hardware</span>
                    <div className="grid grid-cols-2 gap-4 font-bold">
                       {[
                         { id: 'Portátil' as const, icon: Laptop, label: 'Portátil' },
                         { id: 'Computador' as const, icon: Monitor, label: 'Escritorio' }
                       ].map(type => (
                         <button
                           key={type.id}
                           type="button"
                           onClick={() => setFormData({ ...formData, equipo: type.id })}
                           className={cn(
                             "p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-4 relative overflow-hidden group/btn font-bold",
                             formData.equipo === type.id 
                               ? "bg-primary-500/10 border-primary-500 text-white shadow-lg shadow-primary-500/10 font-bold" 
                               : "bg-white/[0.02] border-white/5 text-zinc-600 hover:border-white/10 font-bold"
                           )}
                         >
                            {formData.equipo === type.id && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />}
                            <type.icon className={cn("w-8 h-8 transition-transform group-hover/btn:scale-110", formData.equipo === type.id ? "text-primary-400" : "text-zinc-700")} />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] font-bold">{type.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

               {/* Technical Module */}
               <div className="card-premium p-8 space-y-8 border-l-4 border-l-emerald-500/50 font-bold">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/5 font-bold">
                     <Terminal size={18} className="text-emerald-400" />
                     <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Especificaciones Técnicas</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
                     <div className="space-y-2 font-bold">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Procesador</label>
                        <input type="text" value={formData.procesador} onChange={(e) => setFormData({ ...formData, procesador: e.target.value })} className="input-v10 text-xs" />
                     </div>
                     <div className="space-y-2 font-bold">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">RAM</label>
                        <input type="text" value={formData.ram} onChange={(e) => setFormData({ ...formData, ram: e.target.value })} className="input-v10 text-xs" />
                     </div>
                     <div className="space-y-2 font-bold">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Almacenamiento</label>
                        <input type="text" value={formData.almacenamiento} onChange={(e) => setFormData({ ...formData, almacenamiento: e.target.value })} className="input-v10 text-xs" />
                     </div>
                     <div className="space-y-2 font-bold">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">S.O.</label>
                        <input type="text" value={formData.sistema_operativo} onChange={(e) => setFormData({ ...formData, sistema_operativo: e.target.value })} className="input-v10 text-xs" />
                     </div>
                     <div className="space-y-2 font-bold">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Serial Number</label>
                        <input type="text" value={formData.numero_serie} onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })} className="input-v10 text-xs font-mono uppercase tracking-tighter" />
                     </div>
                     <div className="space-y-2 font-bold">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Monitor</label>
                        <input type="text" value={formData.monitor} onChange={(e) => setFormData({ ...formData, monitor: e.target.value })} className="input-v10 text-xs" />
                     </div>
                  </div>

                  <div className="space-y-3 font-bold">
                     <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Cpu size={12} className="text-emerald-500" /> Log de Telemetría
                     </label>
                     <textarea
                       value={formData.caracteristicas}
                       onChange={(e) => setFormData({ ...formData, caracteristicas: e.target.value })}
                       className="input-v10 min-h-[80px] resize-none font-mono text-[10px] italic font-bold"
                     />
                  </div>
               </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
               {/* Logistics Module */}
               <div className="card-premium p-8 space-y-8 border-l-4 border-l-orange-500/50 font-bold">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/5 font-bold">
                     <Globe size={18} className="text-orange-400" />
                     <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Logística & Ubicación</h3>
                  </div>
                  <div className="space-y-5 font-bold">
                     <div className="space-y-2 font-bold">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Ubicación Actual</label>
                        <input type="text" value={formData.ubicacion} onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })} className="input-v10 text-xs" />
                     </div>
                     <div className="space-y-2 font-bold">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Nº Inventario</label>
                        <input type="text" value={formData.numero_inventario} onChange={(e) => setFormData({ ...formData, numero_inventario: e.target.value })} className="input-v10 text-xs" />
                     </div>
                     <div className="grid grid-cols-2 gap-4 font-bold">
                        <div className="space-y-2 font-bold">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Fecha Entrega</label>
                           <input type="date" value={formData.fecha_entrega} onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })} className="input-v10 text-xs" />
                        </div>
                        <div className="space-y-2 font-bold">
                           <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">IP Local</label>
                           <input type="text" value={formData.ip_local} onChange={(e) => setFormData({ ...formData, ip_local: e.target.value })} className="input-v10 text-xs font-mono" />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Lifecycle Module */}
               <div className="card-premium p-8 space-y-8 border-l-4 border-l-zinc-500/50 font-bold">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/5 font-bold">
                     <History size={18} className="text-zinc-400" />
                     <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Gestión de Activo</h3>
                  </div>
                  <div className="space-y-5 font-bold">
                     <div className="space-y-2 font-bold">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Motivo de Reemplazo</label>
                        <select value={formData.motivo_reemplazo} onChange={(e) => setFormData({ ...formData, motivo_reemplazo: e.target.value })} className="input-v10 text-xs bg-zinc-900">
                           <option value="">Operativo</option>
                           <option value="Daño Técnico">Daño Técnico</option>
                           <option value="Actualización">Actualización</option>
                           <option value="Retiro">Retiro</option>
                        </select>
                     </div>
                     <div className="space-y-2 font-bold">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Estado Certificación</label>
                        <button type="button" onClick={() => setFormData({...formData, validado: !formData.validado})}
                          className={cn("w-full p-4 rounded-xl border flex items-center justify-between transition-all", formData.validado ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-white/[0.02] border-white/5 text-zinc-600")}>
                           <span className="text-[9px] font-black uppercase tracking-widest">{formData.validado ? 'CERTIFICADO' : 'PENDIENTE'}</span>
                           <ShieldCheck className={cn("w-5 h-5", formData.validado ? "text-emerald-400" : "text-zinc-800")} />
                        </button>
                     </div>
                  </div>
               </div>
           </div>

           <div className="card-premium p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-zinc-900 to-zinc-950 font-bold">
              <div className="flex items-center gap-3 font-bold">
                 <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center border border-white/5">
                    <History size={18} className="text-zinc-600" />
                 </div>
                 <div className="flex flex-col font-bold">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sincronización</span>
                    <span className="text-[11px] font-black text-zinc-400 uppercase italic">Última Actividad: Tiempo Real</span>
                 </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto font-bold">
                 <button type="button" onClick={() => navigate('/inventario')} className="flex-1 md:flex-none px-8 py-3 rounded-xl border border-white/5 text-xs font-black text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-all uppercase tracking-widest leading-none bg-transparent font-bold">Descartar</button>
                 <button type="submit" className="flex-1 md:flex-none btn-v10-primary px-10 font-bold">
                    Guardar Cambios <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </form>

        <aside className="lg:col-span-4 space-y-8 font-bold">
           <div className="card-premium p-8 space-y-6 relative overflow-hidden font-bold">
              <div className="flex items-center gap-4 mb-6 font-bold">
                 <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Info className="w-6 h-6 text-orange-500" />
                 </div>
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Directivas IT</h4>
              </div>
              <ul className="space-y-6 font-bold">
                 {[
                   { t: 'Seguridad Operativa', d: 'Toda modificación técnica queda registrada en el log de auditoría central.' },
                   { t: 'Matriz Técnica', d: 'Asegúrese de que el Serial Number coincida con la placa física del activo.' }
                 ].map((item, i) => (
                    <li key={i} className="space-y-2 group/tip font-bold">
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/tip:text-orange-500 transition-colors">{'>>'} {item.t}</span>
                       <p className="text-[11px] text-zinc-600 tracking-tight leading-relaxed italic group-hover/tip:text-zinc-400 transition-colors pl-4 border-l border-white/5 font-bold">{item.d}</p>
                    </li>
                 ))}
              </ul>
           </div>
        </aside>
      </div>
    </div>
  )
}

export default EditEquipmentPage
