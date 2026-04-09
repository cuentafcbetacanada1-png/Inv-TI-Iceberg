import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  Cpu, 
  Network, 
  Save, 
  Laptop, 
  Monitor as DesktopIcon, 
  Loader2,
  HardDrive,
  User as UserIcon,
  ShieldCheck,
  Zap,
  Microchip
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { cn } from '../lib/utils'

const EditEquipmentPage: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEquipo, updateEquipo } = useEquipmentStore()
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (id) {
        try {
          const data = await getEquipo(id)
          if (data) {
            setFormData(data)
          } else {
            toast.error('No se encontró el registro')
            navigate('/')
          }
        } catch (err) {
          toast.error('Error al cargar datos')
          navigate('/')
        } finally {
          setLoading(false)
        }
      }
    }
    fetch()
  }, [id, getEquipo, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    try {
      await updateEquipo(formData.id, formData)
      toast.success('Cambios guardados correctamente')
      navigate('/')
    } catch {
      toast.error('Fallo al actualizar el registro')
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="animate-spin text-[#00ff88]" size={40} />
      <span className="text-xs font-black text-[#4e564e] uppercase tracking-widest">Sincronizando con el nodo...</span>
    </div>
  )

  return (
    <div className="space-y-10 animate-in pb-20 font-sans">
      {/* Header */}
      <div className="space-y-2">
         <button 
           onClick={() => navigate(-1)}
           className="flex items-center gap-2 text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em] hover:text-[#00ff88] transition-all mb-4 group"
         >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Panel General
         </button>
         <div className="flex items-center gap-3 text-[#00ff88]">
            <Zap size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 italic">Editor de Ficha Técnica IT</span>
         </div>
         <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">
            Editar Equipo
         </h1>
         <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.4em]">Identificador:</span>
            <span className="text-sm font-black text-[#00ff88] uppercase italic">{formData.hostname}</span>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Identidad de Red */}
        <div className="card-matrix p-10 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00ff88]" />
           <div className="flex items-center gap-4 mb-10 text-white">
              <Network size={22} className="text-[#00ff88] opacity-50" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] italic">Identidad de Red</h3>
           </div>

           <div className="space-y-8">
              <div className="grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">Nombre del Host</label>
                 <input 
                   required
                   value={formData.hostname}
                   onChange={e => setFormData({...formData, hostname: e.target.value})}
                   className="bg-[#090a09] border border-[#0e312a] text-xl font-black text-[#00ff88] italic px-6 py-4 rounded-2xl focus:border-[#00ff88] outline-none shadow-inner w-full"
                 />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="grid gap-3">
                    <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">Dirección IP</label>
                    <input 
                      value={formData.ip_local}
                      onChange={e => setFormData({...formData, ip_local: e.target.value})}
                      className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-white px-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none"
                    />
                 </div>
                 <div className="grid gap-3">
                    <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">Usuario</label>
                    <div className="relative">
                       <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4e564e]" />
                       <input 
                         value={formData.username}
                         onChange={e => setFormData({...formData, username: e.target.value})}
                         className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-white pl-10 pr-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none w-full"
                       />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Especificaciones Hardware */}
        <div className="card-matrix p-10 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00ff88]/20 group-hover:bg-[#00ff88] transition-all duration-500" />
           <div className="flex items-center gap-4 mb-10 text-white">
              <Cpu size={22} className="text-[#00ff88] opacity-50" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em] italic">Ficha de Hardware</h3>
           </div>

           <div className="grid grid-cols-2 gap-x-8 gap-y-8">
              <div className="grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">Memoria RAM</label>
                 <input 
                   placeholder="Ej: 32 GB"
                   value={formData.memoria_ram}
                   onChange={e => setFormData({...formData, memoria_ram: e.target.value})}
                   className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-[#00ff88] px-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none"
                 />
              </div>
              <div className="grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">Marca</label>
                 <input 
                   placeholder="DELL, ASUS..."
                   value={formData.marca_pc}
                   onChange={e => setFormData({...formData, marca_pc: e.target.value})}
                   className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-white px-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none uppercase"
                 />
              </div>

              <div className="grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">Almacenamiento (Disco)</label>
                 <div className="relative">
                    <HardDrive size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4e564e]" />
                    <input 
                      placeholder="Ej: 512 GB SSD"
                      value={formData.disco}
                      onChange={e => setFormData({...formData, disco: e.target.value})}
                      className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-[#00ff88] pl-10 pr-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none w-full italic"
                    />
                 </div>
              </div>

              <div className="grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">Número de Serie</label>
                 <input 
                   value={formData.numero_serie}
                   onChange={e => setFormData({...formData, numero_serie: e.target.value})}
                   className="bg-[#090a09] border border-[#0e312a] text-sm font-black text-white px-5 py-3.5 rounded-2xl focus:border-[#00ff88] outline-none uppercase"
                 />
              </div>

              <div className="col-span-2 grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">Características (Procesador / CPU)</label>
                 <div className="relative">
                    <Microchip size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4e564e]" />
                    <input 
                      placeholder="Ej: Intel Core i7-10700K @ 3.80GHz"
                      value={formData.caracteristicas_pc}
                      onChange={e => setFormData({...formData, caracteristicas_pc: e.target.value})}
                      className="bg-[#090a09] border border-[#0e312a] text-xs font-bold text-white pl-10 pr-5 py-4 rounded-2xl focus:border-[#00ff88] outline-none w-full"
                    />
                 </div>
              </div>

              <div className="col-span-2 grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">S.O. Instalado</label>
                 <input 
                   value={formData.sistema_operativo}
                   onChange={e => setFormData({...formData, sistema_operativo: e.target.value})}
                   className="bg-[#090a09] border border-[#0e312a] text-xs font-bold text-white px-5 py-4 rounded-2xl focus:border-[#00ff88] outline-none"
                 />
              </div>

              <div className="col-span-2 grid gap-3">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">Monitores Detectados</label>
                 <textarea 
                   rows={3}
                   value={formData.monitores}
                   onChange={e => setFormData({...formData, monitores: e.target.value})}
                   className="bg-[#090a09] border border-[#0e312a] rounded-2xl p-5 text-[10px] font-black text-white/60 font-mono focus:border-[#00ff88] outline-none resize-none"
                 />
              </div>

              <div className="col-span-2 space-y-4 pt-4 border-t border-[#0e312a]">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest px-1">Tipo de Chasis</label>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, es_laptop: true, es_escritorio: false})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest italic",
                        formData.es_laptop 
                          ? "bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88] shadow-lg shadow-[#00ff88]/10" 
                          : "bg-[#090a09] border-[#0e312a] text-[#4e564e] hover:border-[#00ff88]/30"
                      )}
                    >
                       <Laptop size={18} />
                       Laptop Node
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, es_laptop: false, es_escritorio: true})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest italic",
                        formData.es_escritorio 
                          ? "bg-[#00ff88] border-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20" 
                          : "bg-[#090a09] border-[#0e312a] text-[#4e564e] hover:border-[#00ff88]/30"
                      )}
                    >
                       <DesktopIcon size={18} />
                       Escritorio Node
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 flex justify-end gap-6 pt-6">
           <button 
             type="button"
             onClick={() => navigate(-1)}
             className="px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-[#4e564e] hover:text-white transition-all"
           >
              Abortar Cambios
           </button>
           <button 
             type="submit"
             className="btn-matrix flex items-center gap-3 px-12 italic"
           >
              <ShieldCheck size={20} />
              Guardar en Matriz
           </button>
        </div>
      </form>
    </div>
  )
}

export default EditEquipmentPage
