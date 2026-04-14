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
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic animate-pulse">Sincronizando Ficha Técnica...</span>
    </div>
  )

  const InputField = ({ label, icon: Icon, value, onChange, colSpan = "col-span-1" }: any) => (
    <div className={cn("space-y-2", colSpan)}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-blue-600 opacity-70" />}
        {label}
      </label>
      {(label === 'Monitores' || label === 'Matriz de Monitores' || label === 'Visualizadores') ? (
        <textarea
          className="w-full bg-white border border-slate-200 text-xs text-slate-800 px-4 py-3 rounded-xl outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-200 shadow-sm min-h-[100px] resize-none"
          value={value || ''}
          onChange={onChange}
        />
      ) : (
        <input
          className="w-full bg-white border border-slate-200 text-xs text-slate-800 px-4 py-3 rounded-xl outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-50 transition-all font-bold placeholder:text-slate-200 shadow-sm"
          value={value || ''}
          onChange={onChange}
        />
      )}
    </div>
  )

  return (
    <div className="space-y-6 animate-in pb-12 font-sans text-slate-800">
      <header className="space-y-2">
         <button 
           onClick={() => navigate(-1)}
           className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-normal hover:text-blue-600 transition-all group"
         >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Inventario
         </button>
         <h1 className="text-2xl font-extrabold tracking-tight uppercase text-slate-800 leading-none">
            Configurar Computador <span className="text-blue-600">{formData.hostname}</span>
         </h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
         {/* LADO IZQUIERDO: Identidad */}
         <div className="card-matrix p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
            <h3 className="text-[11px] font-semibold uppercase tracking-normal text-blue-600/70 mb-6 flex items-center gap-2">
               <Server size={14} /> Gestión de Identidad
            </h3>
            <div className="grid grid-cols-2 gap-5 relative z-10">
               <InputField label="Hostname" value={formData.hostname} onChange={(e: any) => setFormData({...formData, hostname: e.target.value})} colSpan="col-span-2" />
               <InputField label="Fabricante" value={formData.marca_pc} onChange={(e: any) => setFormData({...formData, marca_pc: e.target.value})} />
               <InputField label="Modelo" value={formData.modelo} onChange={(e: any) => setFormData({...formData, modelo: e.target.value})} />
               <InputField label="Dirección IP Local" value={formData.ip_local} onChange={(e: any) => setFormData({...formData, ip_local: e.target.value})} />
               <InputField icon={UserIcon} label="Administrador" value={formData.username} onChange={(e: any) => setFormData({...formData, username: e.target.value})} />
               <InputField icon={Tag} label="Serial Identificador" value={formData.numero_serie} onChange={(e: any) => setFormData({...formData, numero_serie: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* LADO DERECHO: Hardware */}
         <div className="card-matrix p-6 relative overflow-hidden group border-[#1a1c1a]/60 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
            <h3 className="text-[11px] font-semibold uppercase tracking-normal text-indigo-400/70 mb-6 flex items-center gap-2">
               <Cpu size={14} /> Parámetros de Hardware
            </h3>
            <div className="grid grid-cols-2 gap-5 relative z-10">
               <InputField icon={Cpu} label="RAM Instalada" value={formData.memoria_ram} onChange={(e: any) => setFormData({...formData, memoria_ram: e.target.value})} />
               <InputField icon={HardDrive} label="Almacenamiento" value={formData.disco} onChange={(e: any) => setFormData({...formData, disco: e.target.value})} />
               <InputField label="Especificaciones CPU" value={formData.caracteristicas_pc} onChange={(e: any) => setFormData({...formData, caracteristicas_pc: e.target.value})} colSpan="col-span-2" />
               <InputField label="Sistema Operativo" value={formData.sistema_operativo} onChange={(e: any) => setFormData({...formData, sistema_operativo: e.target.value})} colSpan="col-span-2" />
               <InputField icon={DesktopIcon} label="Matriz de Monitores" value={formData.monitores} onChange={(e: any) => setFormData({...formData, monitores: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* BOTONES DE ACCIÓN */}
         <div className="flex flex-col md:flex-row gap-4 col-span-1 lg:col-span-2 mt-2">
            <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-200 flex-1">
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, es_laptop: true, es_escritorio: false})}
                 className={cn("flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest", formData.es_laptop ? "bg-amber-500 text-white shadow-lg" : "text-slate-400")}
               > <Laptop size={16} /> Laptop </button>
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, es_laptop: false, es_escritorio: true})}
                 className={cn("flex-1 py-3 flex items-center justify-center gap-2 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest", formData.es_escritorio ? "bg-blue-600 text-white shadow-lg" : "text-slate-400")}
               > <DesktopIcon size={16} /> Estación PC </button>
            </div>
            <button 
              type="submit" 
              className="flex-[1.4] py-4 rounded-2xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 group"
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
