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
    <div className={cn("space-y-2", colSpan)}>
      <label className="text-[10px] font-semibold text-[#889288] uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-[#00ff88] opacity-70" />}
        {label}
      </label>
      {(label === 'Monitores' || label === 'Visualizadores') ? (
        <textarea
          className="w-full bg-[#090a09]/60 border border-[#0e312a]/40 text-xs text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]/20 transition-all font-medium placeholder:text-[#0e312a]/50 shadow-inner min-h-[100px] resize-none"
          value={value}
          onChange={onChange}
        />
      ) : (
        <input
          className="w-full bg-[#090a09]/60 border border-[#0e312a]/40 text-xs text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]/20 transition-all font-medium placeholder:text-[#0e312a]/50 shadow-inner"
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  )

  return (
    <div className="space-y-6 animate-in pb-12 font-sans text-white">
      <header className="space-y-2">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[9px] font-semibold text-[#4e564e] hover:text-[#00ff88] transition-all uppercase tracking-[0.2em] group">
            <ChevronLeft size={14} className="group-hover:-translate-x-1" /> Volver al Inventario
         </button>
         <h1 className="text-2xl font-bold tracking-tight uppercase text-white/95 leading-none">
            Nuevo <span className="text-[#00ff88]">Registro de Red</span>
         </h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
         {/* LADO IZQUIERDO: Identidad */}
         <div className="card-matrix p-6 border-[#1a1c1a]/60 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 blur-3xl rounded-full" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#00ff88]/70 mb-6 flex items-center gap-2">
               <Zap size={14} /> Identidad del Equipo
            </h3>
            <div className="grid grid-cols-2 gap-5 relative z-10">
               <InputField label="Hostname" value={formData.hostname} onChange={(e: any) => setFormData({...formData, hostname: e.target.value})} colSpan="col-span-2" />
               <InputField label="Marca" value={formData.marca_pc} onChange={(e: any) => setFormData({...formData, marca_pc: e.target.value})} />
               <InputField label="Modelo" value={formData.modelo} onChange={(e: any) => setFormData({...formData, modelo: e.target.value})} />
               <InputField label="IP Local" value={formData.ip_local} onChange={(e: any) => setFormData({...formData, ip_local: e.target.value})} />
               <InputField icon={User} label="Responsable" value={formData.username} onChange={(e: any) => setFormData({...formData, username: e.target.value})} />
               <InputField icon={Tag} label="Serial / S.N." value={formData.numero_serie} onChange={(e: any) => setFormData({...formData, numero_serie: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* LADO DERECHO: Hardware */}
         <div className="card-matrix p-6 border-[#1a1c1a]/60 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-400/70 mb-6 flex items-center gap-2">
               <Cpu size={14} /> Matriz de Hardware
            </h3>
            <div className="grid grid-cols-2 gap-5 relative z-10">
               <InputField icon={Cpu} label="Memoria RAM" value={formData.memoria_ram} onChange={(e: any) => setFormData({...formData, memoria_ram: e.target.value})} />
               <InputField icon={HardDrive} label="Almacenamiento" value={formData.disco} onChange={(e: any) => setFormData({...formData, disco: e.target.value})} />
               <InputField label="Arquitectura" value={formData.caracteristicas_pc} onChange={(e: any) => setFormData({...formData, caracteristicas_pc: e.target.value})} colSpan="col-span-2" />
               <InputField label="Sistema Operativo" value={formData.sistema_operativo} onChange={(e: any) => setFormData({...formData, sistema_operativo: e.target.value})} colSpan="col-span-2" />
               <InputField icon={Monitor} label="Visualizadores" value={formData.monitores} onChange={(e: any) => setFormData({...formData, monitores: e.target.value})} colSpan="col-span-2" />
            </div>
         </div>

         {/* BOTÓN DE ACCIÓN */}
         <button type="submit" className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-[#00ff88] to-[#10ef87] text-black text-xs font-bold uppercase tracking-[0.3em] hover:scale-[1.01] active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,255,136,0.2)] flex items-center justify-center gap-3 col-span-1 lg:col-span-2 group">
            <Save size={18} className="group-hover:rotate-12 transition-transform" /> 
            Finalizar y Registrar
         </button>

      </form>
    </div>
  )
}

export default CreateEquipmentPage
