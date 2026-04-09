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
      toast.success('Matriz de datos actualizada')
      navigate('/inventario')
    } catch {
      toast.error('Fallo al actualizar el nodo')
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="animate-spin text-[#00ff88]" size={40} />
      <span className="text-xs font-black text-[#4e564e] uppercase tracking-widest italic animate-pulse">Consultando Ficha Técnica...</span>
    </div>
  )

  const InputField = ({ label, icon: Icon, value, onChange, placeholder, colSpan = "col-span-1" }: any) => (
    <div className={cn("space-y-2", colSpan)}>
      <label className="text-[9px] font-black text-[#4e564e] uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-[#00ff88] opacity-50" />}
        {label}
      </label>
      <input
        className="w-full bg-[#090a09] border border-[#0e312a] text-sm text-white px-5 py-4 rounded-2xl outline-none focus:border-[#00ff88] transition-all font-bold placeholder:text-[#0e312a] shadow-inner"
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
      />
    </div>
  )

  return (
    <div className="space-y-10 animate-in pb-20 font-sans text-white">
      {/* Header */}
      <header className="space-y-2">
         <button 
           onClick={() => navigate(-1)}
           className="flex items-center gap-2 text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em] hover:text-[#00ff88] transition-all mb-4 group"
         >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Inventario
         </button>
         <div className="flex items-center gap-3 text-[#00ff88]">
            <Zap size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Control Maestro de Activo</span>
         </div>
         <h1 className="text-5xl font-black tracking-tighter italic uppercase truncate max-w-2xl">
            {formData.hostname} <span className="text-[#00ff88] opacity-20">// ID</span>
         </h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Identidad de Red y Hardware */}
        <div className="space-y-10">
           <div className="card-matrix p-10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00ff88]" />
              <div className="flex items-center gap-4 mb-10">
                 <Network size={22} className="text-[#4e564e]" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-[#00ff88]">Parámetros de Red</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputField label="Hostname" value={formData.hostname} onChange={(e: any) => setFormData({...formData, hostname: e.target.value})} colSpan="col-span-2" />
                 <InputField label="Dirección IP Local" value={formData.ip_local} onChange={(e: any) => setFormData({...formData, ip_local: e.target.value})} />
                 <InputField icon={UserIcon} label="Usuario" value={formData.username} onChange={(e: any) => setFormData({...formData, username: e.target.value})} />
              </div>
           </div>

           <div className="card-matrix p-10 relative overflow-hidden group border-[#1a1c1a]">
              <div className="flex items-center gap-4 mb-10">
                 <Cpu size={22} className="text-[#4e564e]" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-[#00ff88]">Ficha de Hardware</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputField icon={Tag} label="Marca / Modelo" value={formData.marca_pc} onChange={(e: any) => setFormData({...formData, marca_pc: e.target.value})} />
                 <InputField icon={ShieldCheck} label="Nro de Serie" value={formData.numero_serie} onChange={(e: any) => setFormData({...formData, numero_serie: e.target.value})} />
                 <InputField icon={Microchip} label="RAM" value={formData.memoria_ram} onChange={(e: any) => setFormData({...formData, memoria_ram: e.target.value})} />
                 <InputField icon={HardDrive} label="Disco" value={formData.disco} onChange={(e: any) => setFormData({...formData, disco: e.target.value})} />
                 <InputField label="Procesador / Características" value={formData.caracteristicas_pc} onChange={(e: any) => setFormData({...formData, caracteristicas_pc: e.target.value})} colSpan="col-span-2" />
                 <InputField label="Sistema Operativo" value={formData.sistema_operativo} onChange={(e: any) => setFormData({...formData, sistema_operativo: e.target.value})} colSpan="col-span-2" />
              </div>
           </div>
        </div>

        {/* Infraestructura Avanzada y Gestión */}
        <div className="space-y-10">
           {/* MÓDULO RED AVANZADA (IP SWITCH / VLAN) */}
           <div className="card-matrix p-10 relative overflow-hidden group border-indigo-500/20">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
              <div className="flex items-center gap-4 mb-10 text-white">
                 <Server size={22} className="text-indigo-500" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-indigo-400">Infraestructura Crítica</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputField label="IP Switch" placeholder="10.0.X.X" value={formData.ip_switch} onChange={(e: any) => setFormData({...formData, ip_switch: e.target.value})} />
                 <InputField label="Puerto Switch" placeholder="Giga 0/1" value={formData.puerto_switch} onChange={(e: any) => setFormData({...formData, puerto_switch: e.target.value})} />
                 <InputField label="VLAN Asignada" value={formData.vlan} onChange={(e: any) => setFormData({...formData, vlan: e.target.value})} colSpan="col-span-2" />
              </div>
           </div>

           {/* MÓDULO GESTIÓN DE ACTIVOS (UBICACIÓN / GARANTÍA) */}
           <div className="card-matrix p-10 relative overflow-hidden group border-amber-500/20">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
              <div className="flex items-center gap-4 mb-10 text-white">
                 <MapPin size={22} className="text-amber-500" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-amber-500">Gestión Física y Garantía</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputField icon={MapPin} label="Ubicación Física" value={formData.ubicacion_fisica} onChange={(e: any) => setFormData({...formData, ubicacion_fisica: e.target.value})} />
                 <InputField icon={Tag} label="Código de Activo" value={formData.codigo_activo} onChange={(e: any) => setFormData({...formData, codigo_activo: e.target.value})} />
                 <InputField icon={ShieldAlert} label="Vigencia Garantía" value={formData.estado_garantia} onChange={(e: any) => setFormData({...formData, estado_garantia: e.target.value})} colSpan="col-span-2" />
              </div>
           </div>

           <div className="card-matrix p-10 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, es_laptop: true, es_escritorio: false})}
                   className={cn(
                     "flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest italic",
                     formData.es_laptop ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-black/50 border-[#0e312a] text-[#4e564e]"
                   )}
                 >
                    <Laptop size={18} /> Laptop
                 </button>
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, es_laptop: false, es_escritorio: true})}
                   className={cn(
                     "flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest italic",
                     formData.es_escritorio ? "bg-[#00ff88] border-[#00ff88] text-black shadow-lg" : "bg-black/50 border-[#0e312a] text-[#4e564e]"
                   )}
                 >
                    <DesktopIcon size={18} /> Escritorio
                 </button>
              </div>
           </div>

           <div className="flex gap-6 items-center">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-[#4e564e] hover:text-white transition-all border border-[#0e312a]"
              > Descartar </button>
              <button 
                type="submit"
                className="flex-[2] btn-matrix flex items-center justify-center gap-3 py-6 text-[10px] font-black italic tracking-widest"
              >
                 <ShieldCheck size={20} /> Actualizar Matriz IT
              </button>
           </div>
        </div>
      </form>
    </div>
  )
}

export default EditEquipmentPage
