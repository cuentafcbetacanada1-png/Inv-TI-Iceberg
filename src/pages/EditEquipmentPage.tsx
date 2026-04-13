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
  Microchip,
  MapPin,
  Server,
  Tag,
  ShieldAlert
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
      
      const now = new Date()
      const dia = now.toLocaleDateString('es-ES', { weekday: 'long' })
      const fecha = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
      const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      
      toast.success(`Equipo ${formData.hostname} ha sido actualizado correctamente, por Administrador, ${dia}, ${fecha} y ${hora} exactamente`)
      navigate('/inventario')
    } catch (err: any) {
      console.error('Error al actualizar:', err)
      toast.error('Fallo al actualizar el nodo')
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-vh-60 space-y-4">
      <Loader2 className="animate-spin text-[#00ff88]" size={40} />
      <span className="text-[10px] font-black text-[#4e564e] uppercase tracking-widest italic animate-pulse">Sincronizando Ficha Técnica...</span>
    </div>
  )

  const InputField = ({ label, icon: Icon, value, onChange, colSpan = "col-span-1" }: any) => (
    <div className={cn("space-y-1", colSpan)}>
      <label className="text-[7px] font-bold text-[#4e564e] uppercase tracking-[0.3em] ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={8} className="text-[#00ff88] opacity-60" />}
        {label}
      </label>
      {label === 'Monitores' ? (
        <textarea
          className="w-full bg-[#090a09]/50 border border-[#0e312a]/30 text-[9px] text-white px-2.5 py-1.5 rounded-lg outline-none focus:border-[#00ff88] transition-all font-semibold placeholder:text-[#0e312a]/50 shadow-inner min-h-[50px] resize-none"
          value={value || ''}
          onChange={onChange}
        />
      ) : (
        <input
          className="w-full bg-[#090a09]/50 border border-[#0e312a]/30 text-[9px] text-white px-2.5 py-1.5 rounded-lg outline-none focus:border-[#00ff88] transition-all font-semibold placeholder:text-[#0e312a]/50 shadow-inner"
          value={value || ''}
          onChange={onChange}
        />
      )}
    </div>
  )

  return (
    <div className="space-y-4 animate-in pb-10 font-sans text-white">
      <header className="space-y-1">
         <button 
           onClick={() => navigate(-1)}
           className="flex items-center gap-1 text-[7px] font-bold text-[#4e564e] uppercase tracking-[0.2em] hover:text-[#00ff88] transition-all group"
         >
            <ChevronLeft size={10} className="group-hover:-translate-x-1 transition-transform" />
            Atrás
         </button>
         <h1 className="text-xl font-bold tracking-tighter italic uppercase">
            Editar <span className="text-[#00ff88]">{formData.hostname}</span>
         </h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
         {/* LADO IZQUIERDO: Red */}
         <div className="card-matrix p-4 relative overflow-hidden group">
            <h3 className="text-[8px] font-bold uppercase tracking-[0.3em] italic text-[#00ff88]/70 mb-4">Conectividad Nodo</h3>
            <div className="grid grid-cols-2 gap-3">
               <InputField label="Hostname" value={formData.hostname} onChange={(e: any) => setFormData({...formData, hostname: e.target.value})} colSpan="col-span-2" />
               <InputField label="Marca" value={formData.marca_pc} onChange={(e: any) => setFormData({...formData, marca_pc: e.target.value})} />
               <InputField label="Modelo" value={formData.modelo} onChange={(e: any) => setFormData({...formData, modelo: e.target.value})} />
               <InputField label="IP Local" value={formData.ip_local} onChange={(e: any) => setFormData({...formData, ip_local: e.target.value})} />
               <InputField icon={UserIcon} label="Usuario" value={formData.username} onChange={(e: any) => setFormData({...formData, username: e.target.value})} />
               <InputField icon={Tag} label="Serial No." value={formData.numero_serie} onChange={(e: any) => setFormData({...formData, numero_serie: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* LADO DERECHO: Hardware */}
         <div className="card-matrix p-4 relative overflow-hidden group border-[#1a1c1a]/50">
            <h3 className="text-[8px] font-bold uppercase tracking-[0.3em] italic text-[#00ff88]/70 mb-4">Componentes Hardware</h3>
            <div className="grid grid-cols-2 gap-3">
               <InputField icon={Cpu} label="RAM" value={formData.memoria_ram} onChange={(e: any) => setFormData({...formData, memoria_ram: e.target.value})} />
               <InputField icon={HardDrive} label="Disco" value={formData.disco} onChange={(e: any) => setFormData({...formData, disco: e.target.value})} />
               <InputField label="Procesador" value={formData.caracteristicas_pc} onChange={(e: any) => setFormData({...formData, caracteristicas_pc: e.target.value})} colSpan="col-span-2" />
               <InputField label="Sistema Operativo" value={formData.sistema_operativo} onChange={(e: any) => setFormData({...formData, sistema_operativo: e.target.value})} colSpan="col-span-2" />
               <InputField icon={DesktopIcon} label="Monitores Seriales" value={formData.monitores} onChange={(e: any) => setFormData({...formData, monitores: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* BOTONES DE ACCIÓN */}
         <div className="flex gap-3 col-span-1 lg:col-span-2">
            <div className="flex bg-[#0e312a]/20 p-0.5 rounded-lg border border-[#0e312a]/50 flex-1">
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, es_laptop: true, es_escritorio: false})}
                 className={cn("flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md transition-all font-bold text-[8px] uppercase", formData.es_laptop ? "bg-amber-500 text-black shadow-lg" : "text-[#4e564e]")}
               > <Laptop size={12} /> Laptop </button>
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, es_laptop: false, es_escritorio: true})}
                 className={cn("flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md transition-all font-bold text-[8px] uppercase", formData.es_escritorio ? "bg-[#00ff88] text-black shadow-lg" : "text-[#4e564e]")}
               > <DesktopIcon size={12} /> PC </button>
            </div>
            <button 
              type="submit" 
              className="flex-[1.2] btn-matrix flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold italic tracking-widest"
            >
               <Save size={14} /> Aplicar Cambios
            </button>
         </div>
      </form>
    </div>
  )
}

export default EditEquipmentPage
