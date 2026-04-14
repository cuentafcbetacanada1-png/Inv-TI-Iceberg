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
            toast.error('No se encontrÃ³ el registro')
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
      <Loader2 className="animate-spin text-[var(--primary)]" size={40} />
      <span className="text-[10px] font-semibold text-[#4e564e] uppercase tracking-widest italic animate-pulse">Sincronizando Ficha TÃ©cnica...</span>
    </div>
  )

  const InputField = ({ label, icon: Icon, value, onChange, colSpan = "col-span-1" }: any) => (
    <div className={cn("space-y-2", colSpan)}>
      <label className="text-[10px] font-semibold text-[#889288] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-[var(--primary)] opacity-70" />}
        {label}
      </label>
      {(label === 'Monitores' || label === 'Matriz de Monitores' || label === 'Visualizadores') ? (
        <textarea
          className="w-full bg-[#090a09]/60 border border-[#0e312a]/40 text-xs text-white px-4 py-3 rounded-xl outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all font-medium placeholder:text-[#0e312a]/50 shadow-inner min-h-[100px] resize-none"
          value={value || ''}
          onChange={onChange}
        />
      ) : (
        <input
          className="w-full bg-[#090a09]/60 border border-[#0e312a]/40 text-xs text-white px-4 py-3 rounded-xl outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all font-medium placeholder:text-[#0e312a]/50 shadow-inner"
          value={value || ''}
          onChange={onChange}
        />
      )}
    </div>
  )

  return (
    <div className="space-y-6 animate-in pb-12 font-sans text-white">
      <header className="space-y-2">
         <button 
           onClick={() => navigate(-1)}
           className="flex items-center gap-2 text-[9px] font-semibold text-[#4e564e] uppercase tracking-[0.2em] hover:text-[var(--primary)] transition-all group"
         >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Inventario
         </button>
         <h1 className="text-2xl font-semibold tracking-tight uppercase text-white/95 leading-none">
            Configurar Computador <span className="text-[var(--primary)]">{formData.hostname}</span>
         </h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
         {/* LADO IZQUIERDO: Identidad */}
         <div className="card-matrix p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 blur-3xl rounded-full" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--primary)]/70 mb-6 flex items-center gap-2">
               <Server size={14} /> GestiÃ³n de Identidad
            </h3>
            <div className="grid grid-cols-2 gap-5 relative z-10">
               <InputField label="Hostname" value={formData.hostname} onChange={(e: any) => setFormData({...formData, hostname: e.target.value})} colSpan="col-span-2" />
               <InputField label="Fabricante" value={formData.marca_pc} onChange={(e: any) => setFormData({...formData, marca_pc: e.target.value})} />
               <InputField label="Modelo" value={formData.modelo} onChange={(e: any) => setFormData({...formData, modelo: e.target.value})} />
               <InputField label="DirecciÃ³n IP Local" value={formData.ip_local} onChange={(e: any) => setFormData({...formData, ip_local: e.target.value})} />
               <InputField icon={UserIcon} label="Administrador" value={formData.username} onChange={(e: any) => setFormData({...formData, username: e.target.value})} />
               <InputField icon={Tag} label="Serial Identificador" value={formData.numero_serie} onChange={(e: any) => setFormData({...formData, numero_serie: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* LADO DERECHO: Hardware */}
         <div className="card-matrix p-6 relative overflow-hidden group border-[#1a1c1a]/60 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-400/70 mb-6 flex items-center gap-2">
               <Cpu size={14} /> ParÃ¡metros de Hardware
            </h3>
            <div className="grid grid-cols-2 gap-5 relative z-10">
               <InputField icon={Cpu} label="RAM Instalada" value={formData.memoria_ram} onChange={(e: any) => setFormData({...formData, memoria_ram: e.target.value})} />
               <InputField icon={HardDrive} label="Almacenamiento" value={formData.disco} onChange={(e: any) => setFormData({...formData, disco: e.target.value})} />
               <InputField label="Especificaciones CPU" value={formData.caracteristicas_pc} onChange={(e: any) => setFormData({...formData, caracteristicas_pc: e.target.value})} colSpan="col-span-2" />
               <InputField label="Sistema Operativo" value={formData.sistema_operativo} onChange={(e: any) => setFormData({...formData, sistema_operativo: e.target.value})} colSpan="col-span-2" />
               <InputField icon={DesktopIcon} label="Matriz de Monitores" value={formData.monitores} onChange={(e: any) => setFormData({...formData, monitores: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* BOTONES DE ACCIÃ“N */}
         <div className="flex flex-col md:flex-row gap-4 col-span-1 lg:col-span-2 mt-2">
            <div className="flex bg-[#0e312a]/20 p-1 rounded-2xl border border-[#0e312a]/50 flex-1">
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, es_laptop: true, es_escritorio: false})}
                 className={cn("flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all font-semibold text-[10px] uppercase tracking-widest", formData.es_laptop ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "text-[#4e564e]")}
               > <Laptop size={16} /> Laptop </button>
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, es_laptop: false, es_escritorio: true})}
                 className={cn("flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all font-semibold text-[10px] uppercase tracking-widest", formData.es_escritorio ? "bg-[var(--primary)] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]" : "text-[#4e564e]")}
               > <DesktopIcon size={16} /> EstaciÃ³n PC </button>
            </div>
            <button 
              type="submit" 
              className="flex-[1.4] py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-black text-xs font-semibold uppercase tracking-[0.3em] hover:scale-[1.01] active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,255,136,0.2)] flex items-center justify-center gap-3 group"
            >
               <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
               Actualizar Matriz
            </button>
         </div>
      </form>
    </div>
  )
}

export default EditEquipmentPage
