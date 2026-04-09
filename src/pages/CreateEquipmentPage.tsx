import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronLeft, 
  Cpu, 
  Network, 
  Save, 
  Laptop, 
  Monitor, 
  Tag, 
  MapPin, 
  ShieldAlert,
  HardDrive,
  User,
  Zap,
  Server
} from 'lucide-react'
import { useEquipmentStore } from '../store/equipmentStore'
import { toast } from 'react-hot-toast'
import { cn } from '../lib/utils'

const CreateEquipmentPage: React.FC = () => {
  const navigate = useNavigate()
  const { addEquipo } = useEquipmentStore()
  
  const [formData, setFormData] = useState({
    hostname: '', username: '', ip_local: '', marca_pc: '', modelo: '', memoria_ram: '', disco: '', sistema_operativo: '', numero_serie: '', caracteristicas_pc: '', es_laptop: false, es_escritorio: true, monitores: '', validado: true,
    ip_switch: '', puerto_switch: '', vlan: '', ubicacion_fisica: '', codigo_activo: '', estado_garantia: '', notas: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addEquipo(formData)
      toast.success('Nodo IT inyectado con éxito')
      navigate('/inventario')
    } catch {
      toast.error('Error al registrar el activo')
    }
  }

  const InputField = ({ label, icon: Icon, value, onChange, placeholder, colSpan = "col-span-1" }: any) => (
    <div className={cn("space-y-2", colSpan)}>
      <label className="text-[10px] font-black text-[#4e564e] uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-[#00ff88] opacity-60" />}
        {label}
      </label>
      <input
        className="w-full bg-[#090a09] border border-[#0e312a] text-sm text-white px-5 py-4 rounded-2xl outline-none focus:border-[#00ff88] transition-all font-black placeholder:text-[#0e312a]/50 shadow-inner"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )

  return (
    <div className="space-y-12 animate-in pb-20 font-sans text-white">
      <header className="space-y-3">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-bold text-[#4e564e] hover:text-[#00ff88] transition-all uppercase tracking-widest group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1" /> Volver
         </button>
         <h1 className="text-5xl font-black italic tracking-tighter uppercase">Nuevo <span className="text-[#00ff88]">Equipo IT</span></h1>
         <div className="h-1 w-20 bg-[#00ff88] rounded-full" />
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Hardware y Red */}
        <div className="space-y-10">
           <div className="card-matrix p-8 border-[#1a1c1a]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-[#00ff88] mb-8">Identificación de Red</h3>
              <div className="grid grid-cols-2 gap-6">
                 <InputField label="Nombre Equipo" value={formData.hostname} onChange={(e: any) => setFormData({...formData, hostname: e.target.value})} colSpan="col-span-2" />
                 <InputField label="IP Local" value={formData.ip_local} onChange={(e: any) => setFormData({...formData, ip_local: e.target.value})} />
                 <InputField icon={User} label="Responsable" value={formData.username} onChange={(e: any) => setFormData({...formData, username: e.target.value})} />
              </div>
           </div>
           <div className="card-matrix p-8 border-[#1a1c1a]">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-[#00ff88] mb-8">Especificaciones Técnicas</h3>
              <div className="grid grid-cols-2 gap-6">
                 <InputField icon={Cpu} label="Memoria RAM" value={formData.memoria_ram} onChange={(e: any) => setFormData({...formData, memoria_ram: e.target.value})} />
                 <InputField icon={HardDrive} label="Almacenamiento" value={formData.disco} onChange={(e: any) => setFormData({...formData, disco: e.target.value})} />
                 <InputField label="CPU / Procesador" value={formData.caracteristicas_pc} onChange={(e: any) => setFormData({...formData, caracteristicas_pc: e.target.value})} colSpan="col-span-2" />
              </div>
           </div>
        </div>

        {/* Infraestructura y Gestión */}
        <div className="space-y-10">
           <div className="card-matrix p-8 border-indigo-500/10">
              <div className="flex items-center gap-3 mb-8">
                 <Server size={18} className="text-indigo-500" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-indigo-400">Infraestructura Crítica</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputField label="IP Switch" value={formData.ip_switch} onChange={(e: any) => setFormData({...formData, ip_switch: e.target.value})} />
                 <InputField label="Puerto Switch" value={formData.puerto_switch} onChange={(e: any) => setFormData({...formData, puerto_switch: e.target.value})} />
                 <InputField label="VLAN Asignada" value={formData.vlan} onChange={(e: any) => setFormData({...formData, vlan: e.target.value})} colSpan="col-span-2" />
              </div>
           </div>
           <div className="card-matrix p-8 border-amber-500/10">
              <div className="flex items-center gap-3 mb-8">
                 <MapPin size={18} className="text-amber-500" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-amber-500">Gestión Física y Garantía</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputField label="Ubicación" value={formData.ubicacion_fisica} onChange={(e: any) => setFormData({...formData, ubicacion_fisica: e.target.value})} />
                 <InputField label="Código Activo" value={formData.codigo_activo} onChange={(e: any) => setFormData({...formData, codigo_activo: e.target.value})} />
                 <InputField icon={ShieldAlert} label="Estado Garantía" value={formData.estado_garantia} onChange={(e: any) => setFormData({...formData, estado_garantia: e.target.value})} colSpan="col-span-2" />
              </div>
           </div>
           <button type="submit" className="w-full btn-matrix flex items-center justify-center gap-3 py-5 text-[11px] font-black italic tracking-widest shadow-[0_10px_30px_rgba(0,255,136,0.3)]">
              <Save size={20} /> Inyectar Activo IT
           </button>
        </div>
      </form>
    </div>
  )
}

export default CreateEquipmentPage
