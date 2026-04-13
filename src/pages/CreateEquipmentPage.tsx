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
      
      const now = new Date()
      const dia = now.toLocaleDateString('es-ES', { weekday: 'long' })
      const fecha = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
      const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      
      toast.success(`Equipo ${formData.hostname} ha sido agregado correctamente, por Administrador, ${dia}, ${fecha} y ${hora} exactamente`)
      navigate('/inventario')
    } catch {
      toast.error('Error al registrar el activo')
    }
  }

  const InputField = ({ label, icon: Icon, value, onChange, colSpan = "col-span-1" }: any) => (
    <div className={cn("space-y-1.5", colSpan)}>
      <label className="text-[8px] font-bold text-[#4e564e] uppercase tracking-[0.3em] ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={10} className="text-[#00ff88] opacity-60" />}
        {label}
      </label>
      {label === 'Monitores' ? (
        <textarea
          className="w-full bg-[#090a09]/50 border border-[#0e312a]/30 text-[10px] text-white px-3 py-2 rounded-xl outline-none focus:border-[#00ff88] transition-all font-semibold placeholder:text-[#0e312a]/50 shadow-inner min-h-[60px] resize-none"
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          className="w-full bg-[#090a09]/50 border border-[#0e312a]/30 text-[10px] text-white px-3 py-2.5 rounded-xl outline-none focus:border-[#00ff88] transition-all font-semibold placeholder:text-[#0e312a]/50 shadow-inner"
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  )

  return (
    <div className="space-y-6 animate-in pb-10 font-sans text-white">
      <header className="space-y-2">
         <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[8px] font-bold text-[#4e564e] hover:text-[#00ff88] transition-all uppercase tracking-widest group">
            <ChevronLeft size={12} className="group-hover:-translate-x-1" /> Volver
         </button>
         <h1 className="text-3xl font-bold italic tracking-tighter uppercase">Nuevo <span className="text-[#00ff88]">Equipo</span></h1>
         <div className="h-0.5 w-12 bg-[#00ff88]/30 rounded-full" />
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
         {/* LADO IZQUIERDO: Red */}
         <div className="card-matrix p-6 border-[#1a1c1a]/50">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] italic text-[#00ff88]/70 mb-6">Identificación</h3>
            <div className="grid grid-cols-2 gap-4">
               <InputField label="Hostname" value={formData.hostname} onChange={(e: any) => setFormData({...formData, hostname: e.target.value})} colSpan="col-span-2" />
               <InputField label="Marca" value={formData.marca_pc} onChange={(e: any) => setFormData({...formData, marca_pc: e.target.value})} />
               <InputField label="Modelo" value={formData.modelo} onChange={(e: any) => setFormData({...formData, modelo: e.target.value})} />
               <InputField label="IP Local" value={formData.ip_local} onChange={(e: any) => setFormData({...formData, ip_local: e.target.value})} />
               <InputField icon={User} label="Responsable" value={formData.username} onChange={(e: any) => setFormData({...formData, username: e.target.value})} />
               <InputField icon={Tag} label="S/N" value={formData.numero_serie} onChange={(e: any) => setFormData({...formData, numero_serie: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* LADO DERECHO: Hardware */}
         <div className="card-matrix p-6 border-[#1a1c1a]/50">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] italic text-[#00ff88]/70 mb-6">Especificaciones</h3>
            <div className="grid grid-cols-2 gap-4">
               <InputField icon={Cpu} label="RAM" value={formData.memoria_ram} onChange={(e: any) => setFormData({...formData, memoria_ram: e.target.value})} />
               <InputField icon={HardDrive} label="Disco" value={formData.disco} onChange={(e: any) => setFormData({...formData, disco: e.target.value})} />
               <InputField label="Procesador" value={formData.caracteristicas_pc} onChange={(e: any) => setFormData({...formData, caracteristicas_pc: e.target.value})} colSpan="col-span-2" />
               <InputField label="SO" value={formData.sistema_operativo} onChange={(e: any) => setFormData({...formData, sistema_operativo: e.target.value})} colSpan="col-span-2" />
               <InputField icon={Monitor} label="Monitores" value={formData.monitores} onChange={(e: any) => setFormData({...formData, monitores: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* BOTÓN DE ACCIÓN */}
         <button type="submit" className="w-full btn-matrix flex items-center justify-center gap-2 py-4 text-[10px] font-bold italic tracking-widest shadow-[0_5px_20px_rgba(0,255,136,0.2)] col-span-1 lg:col-span-2">
            <Save size={16} /> Registrar Activo
         </button>

      </form>
    </div>
  )
}

export default CreateEquipmentPage
