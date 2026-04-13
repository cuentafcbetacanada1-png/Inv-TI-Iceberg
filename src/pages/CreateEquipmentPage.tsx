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
    <div className={cn("space-y-1", colSpan)}>
      <label className="text-[7px] font-bold text-[#4e564e] uppercase tracking-[0.3em] ml-1 flex items-center gap-1.5">
        {Icon && <Icon size={8} className="text-[#00ff88] opacity-60" />}
        {label}
      </label>
      {label === 'Monitores' ? (
        <textarea
          className="w-full bg-[#090a09]/50 border border-[#0e312a]/30 text-[9px] text-white px-2.5 py-1.5 rounded-lg outline-none focus:border-[#00ff88] transition-all font-semibold placeholder:text-[#0e312a]/50 shadow-inner min-h-[50px] resize-none"
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          className="w-full bg-[#090a09]/50 border border-[#0e312a]/30 text-[9px] text-white px-2.5 py-1.5 rounded-lg outline-none focus:border-[#00ff88] transition-all font-semibold placeholder:text-[#0e312a]/50 shadow-inner"
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  )

  return (
    <div className="space-y-4 animate-in pb-10 font-sans text-white">
      <header className="space-y-1">
         <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[7px] font-bold text-[#4e564e] hover:text-[#00ff88] transition-all uppercase tracking-widest group">
            <ChevronLeft size={10} className="group-hover:-translate-x-1" /> Retroceder
         </button>
         <h1 className="text-xl font-bold italic tracking-tighter uppercase">Nuevo <span className="text-[#00ff88]">Registro</span></h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
         {/* LADO IZQUIERDO: Red */}
         <div className="card-matrix p-4 border-[#1a1c1a]/50">
            <h3 className="text-[8px] font-bold uppercase tracking-[0.3em] italic text-[#00ff88]/70 mb-4">Núcleo Identidad</h3>
            <div className="grid grid-cols-2 gap-3">
               <InputField label="Hostname" value={formData.hostname} onChange={(e: any) => setFormData({...formData, hostname: e.target.value})} colSpan="col-span-2" />
               <InputField label="Marca" value={formData.marca_pc} onChange={(e: any) => setFormData({...formData, marca_pc: e.target.value})} />
               <InputField label="Modelo" value={formData.modelo} onChange={(e: any) => setFormData({...formData, modelo: e.target.value})} />
               <InputField label="IP Local" value={formData.ip_local} onChange={(e: any) => setFormData({...formData, ip_local: e.target.value})} />
               <InputField icon={User} label="Asignado" value={formData.username} onChange={(e: any) => setFormData({...formData, username: e.target.value})} />
               <InputField icon={Tag} label="Serial" value={formData.numero_serie} onChange={(e: any) => setFormData({...formData, numero_serie: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* LADO DERECHO: Hardware */}
         <div className="card-matrix p-4 border-[#1a1c1a]/50">
            <h3 className="text-[8px] font-bold uppercase tracking-[0.3em] italic text-[#00ff88]/70 mb-4">Especificaciones Hardware</h3>
            <div className="grid grid-cols-2 gap-3">
               <InputField icon={Cpu} label="RAM" value={formData.memoria_ram} onChange={(e: any) => setFormData({...formData, memoria_ram: e.target.value})} />
               <InputField icon={HardDrive} label="Disco" value={formData.disco} onChange={(e: any) => setFormData({...formData, disco: e.target.value})} />
               <InputField label="Arquitectura CPU" value={formData.caracteristicas_pc} onChange={(e: any) => setFormData({...formData, caracteristicas_pc: e.target.value})} colSpan="col-span-2" />
               <InputField label="OS Matrix" value={formData.sistema_operativo} onChange={(e: any) => setFormData({...formData, sistema_operativo: e.target.value})} colSpan="col-span-2" />
               <InputField icon={Monitor} label="Visualizadores (Monitores)" value={formData.monitores} onChange={(e: any) => setFormData({...formData, monitores: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* BOTÓN DE ACCIÓN */}
         <button type="submit" className="w-full btn-matrix flex items-center justify-center gap-2 py-3 text-[9px] font-bold italic tracking-widest shadow-[0_5px_20px_rgba(0,255,136,0.1)] col-span-1 lg:col-span-2">
            <Save size={14} /> Ejecutar Registro Activo
         </button>

      </form>
    </div>
  )
}

export default CreateEquipmentPage
