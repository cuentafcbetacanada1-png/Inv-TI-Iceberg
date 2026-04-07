import React, { useState } from 'react'
import { 
  Laptop, 
  Monitor, 
  User, 
  Hash, 
  ChevronLeft,
  Terminal,
  ShieldCheck,
  ArrowRight,
  Info,
  Cpu,
  Globe,
  PlusCircle,
  Settings
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { useNavigate, Link } from 'react-router-dom'
import { cn } from '../lib/utils'

const CreateEquipmentPage: React.FC = () => {
  const { addEquipo } = useEquipmentStore()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    equipo: 'Portátil' as 'Portátil' | 'Computador',
    hostname: '',
    caracteristicas: '',
    validado: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!formData.nombre_usuario || !formData.hostname) {
         toast.error('Nombre y Hostname son requeridos')
         return
      }
      await addEquipo(formData)
      toast.success('Nuevo equipo registrado en el sistema')
      navigate('/inventario')
    } catch (error) {
      toast.error('Fallo en la propagación del nuevo activo')
    }
  }

  return (
    <div className="space-y-10 animate-in max-w-7xl mx-auto font-bold text-zinc-400">
      <header className="flex flex-col gap-4 pb-6 border-b border-white/5 relative font-bold">
        <Link to="/inventario" className="flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-primary-500 transition-all uppercase tracking-[0.2em] w-fit group font-bold">
           <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Cancelar Operación
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 font-bold">
          <div className="space-y-1 font-bold">
             <div className="flex items-center gap-2 text-primary-500 font-black text-[10px] uppercase tracking-[0.3em]">
                <PlusCircle size={12} />
                <span>Inicialización de Recurso</span>
             </div>
             <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Registrar Nuevo Equipo</h1>
             <p className="text-sm text-zinc-500 max-w-xl font-bold">Despliegue de una nueva unidad IT en el inventario corporativo y telemetría activa.</p>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/10 px-4 py-2 rounded-xl backdrop-blur-md font-bold">
             <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-widest block mb-1">Estado de Sesión</span>
             <span className="text-[11px] font-black text-emerald-400 italic uppercase">Canal Seguro Activo</span>
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
                       <Hash size={12} className="text-primary-500" /> Identificador de Red (Hostname)
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
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Caracteristicas del Equipo</h3>
                 </div>

                 <div className="space-y-3 font-bold">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Cpu size={12} className="text-emerald-500" /> Especificaciones Base
                    </label>
                    <textarea
                      value={formData.caracteristicas}
                      onChange={(e) => setFormData({ ...formData, caracteristicas: e.target.value })}
                      className="input-v10 min-h-[180px] resize-none bg-white/[0.03] border-white/10 font-mono text-[11px] leading-relaxed italic placeholder:text-zinc-800 font-bold"
                      placeholder="Detalles de hardware, RAM, CPU..."
                    />
                 </div>

                 <div className="space-y-3 pt-4 font-bold">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.1em] block mb-2">Protocolo de Certificación</span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, validado: !formData.validado})}
                      className={cn(
                        "w-full p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 group/status font-bold",
                        formData.validado 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10" 
                          : "bg-white/[0.02] border-white/5 text-zinc-600 hover:border-white/10"
                      )}
                    >
                       <div className="flex items-center gap-4 font-bold">
                          <ShieldCheck className={cn("w-6 h-6", formData.validado ? "text-emerald-400 animate-pulse" : "text-zinc-800")} />
                          <div className="flex flex-col text-left font-bold">
                              <span className="text-[11px] font-black uppercase tracking-[0.1em]">Pre-Certificar Equipo</span>
                              <span className="text-[9px] font-bold tracking-widest opacity-60 uppercase italic">Validación Automática</span>
                          </div>
                       </div>
                       <div className={cn(
                         "w-12 h-6 rounded-full relative transition-all duration-500 p-1 flex items-center font-bold",
                         formData.validado ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-zinc-800"
                       )}>
                          <div className={cn(
                            "w-4 h-4 rounded-full bg-white shadow-xl transition-transform duration-300",
                            formData.validado ? "translate-x-6" : "translate-x-0"
                          )} />
                       </div>
                    </button>
                 </div>
              </div>
           </div>

           <div className="card-premium p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-zinc-900 to-zinc-950 font-bold">
              <div className="flex items-center gap-3 font-bold">
                 <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center border border-white/5">
                    <Settings size={18} className="text-zinc-600" />
                 </div>
                 <div className="flex flex-col font-bold">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Validación de Red</span>
                    <span className="text-[11px] font-black text-zinc-400 uppercase italic">Estado: Esperando Ejecución</span>
                 </div>
              </div>
              <div className="flex gap-4 w-full md:w-auto font-bold">
                 <button type="button" onClick={() => navigate('/inventario')} className="flex-1 md:flex-none px-8 py-3 rounded-xl border border-white/5 text-xs font-black text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-all uppercase tracking-widest leading-none bg-transparent font-bold">Cerrar</button>
                 <button type="submit" className="flex-1 md:flex-none btn-v10-primary px-10 font-bold">
                    Inicializar Equipo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </form>

        <aside className="lg:col-span-4 space-y-8 font-bold">
           <div className="card-premium p-8 space-y-6 relative overflow-hidden font-bold">
              <div className="flex items-center gap-4 mb-6 font-bold">
                 <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                    <Info className="w-6 h-6 text-primary-500" />
                 </div>
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Guía de Inserción</h4>
              </div>
              <ul className="space-y-6 font-bold">
                 {[
                   { t: 'Nomenclatura Estratégica', d: 'Utilice el estándar ICE-REG para nombres de host administrativos.' },
                   { t: 'Chequeo de Integridad', d: 'Verifique redundancia de red antes de activar el switch de integridad.' },
                   { t: 'Hardware Antiguo', d: 'Si es un equipo de baja gama, documentar el año de fabricación en las especificaciones.' }
                 ].map((item, i) => (
                    <li key={i} className="space-y-2 group/tip font-bold">
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover/tip:text-primary-500 transition-colors">{'>>'} {item.t}</span>
                       <p className="text-[11px] text-zinc-600 tracking-tight leading-relaxed italic group-hover/tip:text-zinc-400 transition-colors pl-4 border-l border-white/5 font-bold">{item.d}</p>
                    </li>
                 ))}
              </ul>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-[80px] pointer-events-none" />
           </div>
           
           <div className="card-premium p-8 border-dashed border-white/10 flex flex-col items-center justify-center text-center group hover:bg-emerald-500/[0.02] hover:border-emerald-500/30 transition-all duration-700 font-bold">
              <PlusCircle size={32} className="text-zinc-800 mb-4 group-hover:text-emerald-500/50 transition-colors duration-700" />
              <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.2em] group-hover:text-emerald-500/70 transition-colors font-bold">
                 Registro de Garantía Iceberg IT
              </p>
           </div>
        </aside>
      </div>
    </div>
  )
}

export default CreateEquipmentPage
