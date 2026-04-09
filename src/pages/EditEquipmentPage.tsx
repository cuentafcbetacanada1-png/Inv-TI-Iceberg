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
  ShieldCheck
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
      <span className="text-xs font-black text-[#4e564e] uppercase tracking-widest">Cargando datos del equipo...</span>
    </div>
  )

  return (
    <div className="space-y-10 animate-in pb-20">
      {/* Header en Español */}
      <div className="space-y-2">
         <button 
           onClick={() => navigate(-1)}
           className="flex items-center gap-2 text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em] hover:text-[#00ff88] transition-all mb-4 group"
         >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Panel
         </button>
         <div className="flex items-center gap-3 text-[#00ff88]">
            <Cpu size={18} className="neon-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Gestión de Inventario IT</span>
         </div>
         <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">
            Editar Equipo
         </h1>
         <p className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.4em]">
            Identificador: <span className="text-[#00ff88]">{formData.hostname}</span>
         </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Identidad de Red */}
        <div className="card-matrix p-10 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00ff88]" />
           <div className="flex items-center gap-4 mb-10 text-white">
              <Network size={22} className="text-[#00ff88] opacity-50" />
              <h3 className="text-xs font-black uppercase tracking-[0.3em]">Identidad de Red</h3>
           </div>

           <div className="space-y-8">
              <div className="grid gap-2">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest">Nombre del Equipo</label>
                 <input 
                   disabled
                   value={formData.hostname}
                   className="bg-[#090a09] border border-[#0e312a] text-xl font-black text-[#00ff88] italic px-6 py-4 rounded-2xl cursor-not-allowed opacity-80"
                 />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="grid gap-2">
                    <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest">Dirección IP</label>
                    <div className="text-2xl font-black text-white italic">{formData.ip_local || '--.---.--.--'}</div>
                 </div>
                 <div className="grid gap-2">
                    <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest">Usuario</label>
                    <div className="flex items-center gap-2 text-white font-bold italic">
                       <UserIcon size={14} className="text-[#4e564e]" />
                       {formData.username}
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
              <h3 className="text-xs font-black uppercase tracking-[0.3em]">Ficha de Hardware</h3>
           </div>

           <div className="grid grid-cols-2 gap-x-8 gap-y-8">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest">Memoria RAM</label>
                 <div className="text-lg font-black text-[#00ff88] italic">{formData.memoria_ram || '-- GB'}</div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest">Marca</label>
                 <div className="text-lg font-black text-white uppercase italic">{formData.marca_pc || '--'}</div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest">Número de Serie</label>
                 <div className="text-lg font-black text-white uppercase italic">{formData.numero_serie || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest">Sis. Operativo</label>
                 <div className="text-sm font-bold text-white uppercase italic">{formData.sistema_operativo || 'Desconocido'}</div>
              </div>

              <div className="col-span-2 grid gap-2">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest">Monitores</label>
                 <div className="p-4 bg-[#090a09] border border-[#0e312a] rounded-2xl text-[10px] font-black text-white/60 font-mono whitespace-pre-wrap">
                    {formData.monitores || 'Sin información'}
                 </div>
              </div>

              <div className="col-span-2 space-y-4 pt-4 border-t border-[#0e312a]">
                 <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest">Tipo de Equipo</label>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, es_laptop: true, es_escritorio: false})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest",
                        formData.es_laptop 
                          ? "bg-[#00ff88]/10 border-[#00ff88] text-[#00ff88] shadow-lg shadow-[#00ff88]/10" 
                          : "bg-[#090a09] border-[#0e312a] text-[#4e564e] hover:border-[#00ff88]/30"
                      )}
                    >
                       <Laptop size={16} />
                       Laptop
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, es_laptop: false, es_escritorio: true})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest",
                        formData.es_escritorio 
                          ? "bg-[#00ff88] border-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20" 
                          : "bg-[#090a09] border-[#0e312a] text-[#4e564e] hover:border-[#00ff88]/30"
                      )}
                    >
                       <DesktopIcon size={16} />
                       Escritorio
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 flex justify-end gap-6 pt-6">
           <button 
             type="button"
             onClick={() => navigate(-1)}
             className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-[#4e564e] hover:text-white transition-all"
           >
              Cancelar
           </button>
           <button 
             type="submit"
             className="btn-matrix flex items-center gap-3 px-12"
           >
              <Save size={18} />
              Guardar Cambios
           </button>
        </div>
      </form>
    </div>
  )
}

export default EditEquipmentPage
