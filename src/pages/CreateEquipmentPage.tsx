import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  Cpu, 
  Network, 
  Laptop, 
  Monitor as DesktopIcon,
  Zap,
  HardDrive,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { cn } from '../lib/utils'

const CreateEquipmentPage: React.FC = () => {
  const navigate = useNavigate()
  const { addEquipo } = useEquipmentStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    hostname: '',
    username: '',
    ip_local: '',
    disco: '',
    modelo: '',
    marca_pc: '',
    memoria_ram: '',
    sistema_operativo: '',
    es_escritorio: false,
    es_laptop: false,
    caracteristicas_pc: '',
    monitores: '',
    numero_serie: '',
    validado: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addEquipo(formData)
      toast.success('Dispositivo registrado correctamente')
      navigate('/')
    } catch {
      toast.error('Fallo en el servidor al registrar')
    }
    setLoading(false)
  }

  const Loader2 = () => (
    <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )

  return (
    <div className="space-y-10 animate-in pb-20 font-sans">
      {/* Header en Español */}
      <div className="space-y-2">
         <button 
           onClick={() => navigate(-1)}
           className="flex items-center gap-2 text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em] hover:text-[#00ff88] transition-all mb-4 group"
         >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Panel
         </button>
         <div className="flex items-center gap-3 text-[#00ff88]">
            <Zap size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 italic">Alta de Nuevo Activo IT</span>
         </div>
         <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">
            Nuevo Equipo
         </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Identidad de Red */}
        <div className="card-matrix p-10 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00ff88]/20 group-hover:bg-[#00ff88] transition-all duration-500" />
           <div className="flex items-center gap-4 mb-10">
              <Network size={22} className="text-[#00ff88] opacity-50" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Datos de Conexión</h3>
           </div>

           <div className="space-y-8">
              <div className="grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em]">Nombre del Host</label>
                 <input 
                   required
                   placeholder="Ej: PC-USUARIO-01"
                   value={formData.hostname}
                   onChange={e => setFormData({...formData, hostname: e.target.value})}
                   className="bg-[#090a09] border border-[#0e312a] text-xl font-black text-[#00ff88] italic px-6 py-4 rounded-2xl focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88] shadow-inner outline-none transition-all placeholder:text-[#0e312a] placeholder:italic"
                 />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="grid gap-3">
                    <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em]">Dirección IP Local</label>
                    <input 
                      placeholder="192.168.1.XX"
                      value={formData.ip_local}
                      onChange={e => setFormData({...formData, ip_local: e.target.value})}
                      className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-white px-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none"
                    />
                 </div>
                 <div className="grid gap-3">
                    <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em]">Usuario Asignado</label>
                    <div className="relative">
                       <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4e564e]" />
                       <input 
                         placeholder="Ej: sgarcia"
                         value={formData.username}
                         onChange={e => setFormData({...formData, username: e.target.value})}
                         className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-white pl-10 pr-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none w-full"
                       />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Ficha Técnica Hardware */}
        <div className="card-matrix p-10 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00ff88]/20 group-hover:bg-[#00ff88] transition-all duration-500" />
           <div className="flex items-center gap-4 mb-10">
              <Cpu size={22} className="text-[#00ff88] opacity-50" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white italic">Ficha Técnica</h3>
           </div>

           <div className="grid grid-cols-2 gap-x-8 gap-y-8">
              <div className="grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em]">Memoria RAM Total</label>
                 <input 
                   placeholder="Ej: 16 GB"
                   value={formData.memoria_ram}
                   onChange={e => setFormData({...formData, memoria_ram: e.target.value})}
                   className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-white px-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none"
                 />
              </div>
              <div className="grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em]">Marca del Equipo</label>
                 <input 
                   placeholder="DELL, HP, LENOVO..."
                   value={formData.marca_pc}
                   onChange={e => setFormData({...formData, marca_pc: e.target.value})}
                   className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-white px-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none placeholder:text-zinc-800"
                 />
              </div>

              <div className="grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em]">Disco (Capacidad)</label>
                 <div className="relative">
                    <HardDrive size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4e564e]" />
                    <input 
                      placeholder="Ej: 512 GB SSD"
                      value={formData.disco}
                      onChange={e => setFormData({...formData, disco: e.target.value})}
                      className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-[#00ff88] pl-10 pr-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none w-full"
                    />
                 </div>
              </div>

              <div className="grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em]">Nro de Serie / Service Tag</label>
                 <input 
                   placeholder="Manual S/N..."
                   value={formData.numero_serie}
                   onChange={e => setFormData({...formData, numero_serie: e.target.value})}
                   className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-white px-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none uppercase placeholder:lowercase placeholder:text-zinc-800"
                 />
              </div>

              <div className="col-span-2 space-y-4 pt-4 border-t border-[#0e312a]">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em]">Arquitectura física</label>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, es_laptop: true, es_escritorio: false})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-[0.2em] italic",
                        formData.es_laptop 
                          ? "bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88] shadow-lg shadow-[#00ff88]/10" 
                          : "bg-[#090a09] border-[#0e312a] text-[#4e564e] hover:border-[#00ff88]/30"
                      )}
                    >
                       <Laptop size={18} />
                       Laptop
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, es_laptop: false, es_escritorio: true})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-[0.2em] italic",
                        formData.es_escritorio 
                          ? "bg-[#00ff88] border-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20" 
                          : "bg-[#090a09] border-[#0e312a] text-[#4e564e] hover:border-[#00ff88]/30"
                      )}
                    >
                       <DesktopIcon size={18} />
                       Escritorio
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 flex justify-end gap-6 pt-4">
           <button 
             type="button"
             onClick={() => navigate(-1)}
             className="px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-[#4e564e] hover:text-white transition-all"
           >
              Cancelar
           </button>
           <button 
             type="submit"
             disabled={loading}
             className="btn-matrix flex items-center gap-3 px-12 group"
           >
              {loading ? (
                <Loader2 />
              ) : (
                <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
              )}
              Registrar Equipo
           </button>
        </div>
      </form>
    </div>
  )
}

export default CreateEquipmentPage
