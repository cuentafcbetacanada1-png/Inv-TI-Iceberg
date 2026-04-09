import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  Monitor, 
  Cpu, 
  Network, 
  Save, 
  Laptop, 
  Monitor as DesktopIcon, 
  Loader2,
  Cpu as HardwareIcon
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
        const data = await getEquipo(id)
        if (data) setFormData(data)
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    const { error } = await updateEquipo(formData.id, formData)
    if (!error) {
      toast.success('Registro actualizado exitosamente')
      navigate('/')
    } else {
      toast.error('Error al actualizar')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-[#4318ff]" size={40} />
    </div>
  )

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header Estilo Editor */}
      <div className="space-y-1">
         <button 
           onClick={() => navigate(-1)}
           className="flex items-center gap-2 text-xs font-black text-[#a3aed0] uppercase tracking-widest hover:text-[#4318ff] transition-all mb-4"
         >
            <ChevronLeft size={16} />
            Volver a la Matriz
         </button>
         <div className="flex items-center gap-3 text-[#1b2559]">
            <div className="w-8 h-8 rounded-lg bg-[#4318ff]/10 flex items-center justify-center">
               <HardwareIcon size={18} className="text-[#4318ff]" />
            </div>
            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Editor de Telemetría</span>
         </div>
         <h1 className="text-4xl font-black text-[#1b2559] tracking-tighter italic uppercase italic">
            Editar Activo IT
         </h1>
         <p className="text-sm font-bold text-[#a3aed0] uppercase tracking-widest">
            Modificando registro: <span className="text-[#4318ff]">{formData.hostname}</span>
         </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Sección Identidad de Red */}
        <div className="card-soft p-10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#4318ff]" />
           <div className="flex items-center gap-4 mb-10 text-[#1b2559]">
              <Network size={22} className="opacity-40" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Identidad de Red</h3>
           </div>

           <div className="space-y-8">
              <div className="grid gap-2">
                 <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-widest">Hostname (ID Única)</label>
                 <input 
                   disabled
                   value={formData.hostname}
                   className="bg-[#f4f7fe] border-none text-xl font-black text-[#1b2559] italic px-4 py-3 rounded-xl cursor-not-allowed"
                 />
              </div>

              <div className="grid gap-2">
                 <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-widest">IP Local</label>
                 <div className="text-2xl font-black text-[#1b2559] px-1">{formData.ip_local}</div>
              </div>

              <div className="grid gap-2">
                 <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-widest">Usuario del Sistema</label>
                 <div className="flex items-center gap-3 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm w-fit">
                    <User size={16} className="text-[#a3aed0]" />
                    <span className="text-sm font-black text-[#1b2559]">{formData.username}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Sección Especificaciones Hardware */}
        <div className="card-soft p-10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1.5 h-full bg-[#05cd99]" />
           <div className="flex items-center gap-4 mb-10 text-[#1b2559]">
              <Cpu size={22} className="opacity-40" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Especificaciones de Hardware</h3>
           </div>

           <div className="grid grid-cols-2 gap-x-8 gap-y-10">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-widest">Memoria RAM</label>
                 <div className="text-lg font-black text-[#05cd99]">{formData.memoria_ram || '-- GB'}</div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-widest">Marca Equipo</label>
                 <div className="text-lg font-black text-[#1b2559] uppercase">{formData.marca_pc || 'Desconocida'}</div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-widest">Número de Serie</label>
                 <div className="text-lg font-black text-[#1b2559] uppercase">{formData.numero_serie || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-widest">Sistema Operativo</label>
                 <div className="text-lg font-bold text-[#1b2559] uppercase leading-tight">{formData.sistema_operativo || 'Win 11'}</div>
              </div>

              <div className="col-span-2 grid gap-2">
                 <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-widest">Monitores Detectados</label>
                 <div className="p-4 bg-[#f4f7fe]/50 rounded-2xl border border-dashed border-gray-200">
                    <pre className="text-[11px] font-black text-[#1b2559] font-mono whitespace-pre-wrap">
                       {formData.monitores || 'Ninguno detectado'}
                    </pre>
                 </div>
              </div>

              <div className="col-span-2 space-y-4 pt-4 border-t border-gray-50">
                 <label className="text-[10px] font-black text-[#a3aed0] uppercase tracking-widest">Tipo de Chassis</label>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, es_laptop: true, es_escritorio: false})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest",
                        formData.es_laptop 
                          ? "bg-[#4318ff]/5 border-[#4318ff] text-[#4318ff] shadow-lg shadow-[#4318ff]/10" 
                          : "bg-white border-gray-100 text-[#a3aed0] hover:border-gray-200"
                      )}
                    >
                       <Laptop size={18} />
                       Laptop
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, es_laptop: false, es_escritorio: true})}
                      className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-widest",
                        formData.es_escritorio 
                          ? "bg-[#4318ff] border-[#4318ff] text-white shadow-lg shadow-[#4318ff]/20" 
                          : "bg-white border-gray-100 text-[#a3aed0] hover:border-gray-200"
                      )}
                    >
                       <DesktopIcon size={18} />
                       Escritorio
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 flex justify-end gap-4 mt-4">
           <button 
             type="button"
             onClick={() => navigate(-1)}
             className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-[#a3aed0] hover:text-[#1b2559] transition-all"
           >
              Cancelar
           </button>
           <button 
             type="submit"
             className="btn-soft-primary flex items-center gap-3 px-10 shadow-xl"
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
