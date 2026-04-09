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
  Calendar,
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
    hostname: '',
    username: '',
    ip_local: '',
    marca_pc: '',
    modelo: '',
    memoria_ram: '',
    disco: '',
    sistema_operativo: '',
    numero_serie: '',
    caracteristicas_pc: '',
    es_laptop: false,
    es_escritorio: true,
    monitores: '',
    validado: true,
    // Nuevos campos
    ip_switch: '',
    puerto_switch: '',
    vlan: '',
    ubicacion_fisica: '',
    codigo_activo: '',
    estado_garantia: '',
    notas: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addEquipo(formData)
      toast.success('Equipo inyectado en la matriz')
      navigate('/inventario')
    } catch {
      toast.error('Error al registrar el activo')
    }
  }

  const InputField = ({ label, icon: Icon, value, onChange, placeholder, colSpan = "col-span-1" }: any) => (
    <div className={cn("space-y-2", colSpan)}>
      <label className="text-[9px] font-black text-[#4e564e] uppercase tracking-[0.3em] ml-1 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-[#00ff88]" />}
        {label}
      </label>
      <input
        className="w-full bg-[#121412] border border-[#0e312a] text-sm text-white px-5 py-4 rounded-2xl outline-none focus:border-[#00ff88] transition-all font-bold placeholder:text-[#0e312a] shadow-inner"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )

  return (
    <div className="space-y-10 animate-in pb-20 font-sans text-white">
      <header className="space-y-2">
         <button 
           onClick={() => navigate(-1)}
           className="flex items-center gap-2 text-[10px] font-black text-[#4e564e] uppercase tracking-[0.2em] hover:text-[#00ff88] transition-all mb-4 group"
         >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Cancelar y Volver
         </button>
         <div className="flex items-center gap-3 text-[#00ff88]">
            <Zap size={18} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Nuevo Registro Ferroviario</span>
         </div>
         <h1 className="text-5xl font-black tracking-tighter italic uppercase">Alta de <span className="text-[#00ff88]">Equipo</span></h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Sección 1: Identidad y Hardware */}
        <div className="space-y-10">
           <div className="card-matrix p-10 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00ff88]" />
              <div className="flex items-center gap-4 mb-10">
                 <User size={20} className="text-[#4e564e]" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-[#00ff88]">Identidad de Nodo</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                 <InputField label="Nombre Equipo" placeholder="Ej: SENA-01" value={formData.hostname} onChange={(e: any) => setFormData({...formData, hostname: e.target.value})} colSpan="col-span-2" />
                 <InputField label="Usuario" placeholder="Responsable" value={formData.username} onChange={(e: any) => setFormData({...formData, username: e.target.value})} />
                 <InputField label="IP Local" placeholder="192.168.1.100" value={formData.ip_local} onChange={(e: any) => setFormData({...formData, ip_local: e.target.value})} />
              </div>
           </div>

           <div className="card-matrix p-10 relative overflow-hidden group border-[#1a1c1a]">
              <div className="flex items-center gap-4 mb-10">
                 <Cpu size={20} className="text-[#4e564e]" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-[#00ff88]">Especificaciones Base</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputField icon={Tag} label="Marca" placeholder="DELL / HP..." value={formData.marca_pc} onChange={(e: any) => setFormData({...formData, marca_pc: e.target.value})} />
                 <InputField icon={Tag} label="Modelo" placeholder="OptiPlex 3080" value={formData.modelo} onChange={(e: any) => setFormData({...formData, modelo: e.target.value})} />
                 <InputField icon={Cpu} label="RAM" placeholder="Ej: 16 GB" value={formData.memoria_ram} onChange={(e: any) => setFormData({...formData, memoria_ram: e.target.value})} />
                 <InputField icon={HardDrive} label="Disco" placeholder="Ej: 512 GB SSD" value={formData.disco} onChange={(e: any) => setFormData({...formData, disco: e.target.value})} />
                 <InputField label="Características (CPU)" placeholder="Core i7 10th Gen..." value={formData.caracteristicas_pc} onChange={(e: any) => setFormData({...formData, caracteristicas_pc: e.target.value})} colSpan="col-span-2" />
                 <InputField label="Sist. Operativo" placeholder="Windows 11 Pro" value={formData.sistema_operativo} onChange={(e: any) => setFormData({...formData, sistema_operativo: e.target.value})} colSpan="col-span-2" />
              </div>
           </div>
        </div>

        {/* Sección 2: Infraestructura y Activos */}
        <div className="space-y-10">
           <div className="card-matrix p-10 relative overflow-hidden group border-indigo-500/20">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
              <div className="flex items-center gap-4 mb-10">
                 <Server size={20} className="text-indigo-500" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-indigo-400">Infraestructura de Red</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputField label="IP Switch" placeholder="10.0.0.1" value={formData.ip_switch} onChange={(e: any) => setFormData({...formData, ip_switch: e.target.value})} />
                 <InputField label="Puerto Switch" placeholder="GigaEthernet 0/1" value={formData.puerto_switch} onChange={(e: any) => setFormData({...formData, puerto_switch: e.target.value})} />
                 <InputField label="VLAN" placeholder="ID de VLAN (ej: 10)" value={formData.vlan} onChange={(e: any) => setFormData({...formData, vlan: e.target.value})} colSpan="col-span-2" />
              </div>
           </div>

           <div className="card-matrix p-10 relative overflow-hidden group border-amber-500/20">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
              <div className="flex items-center gap-4 mb-10">
                 <MapPin size={20} className="text-amber-500" />
                 <h3 className="text-xs font-black uppercase tracking-[0.3em] italic text-amber-500">Gestión de Activos</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <InputField icon={MapPin} label="Ubicación Física" placeholder="Oficina 304, Piso 3" value={formData.ubicacion_fisica} onChange={(e: any) => setFormData({...formData, ubicacion_fisica: e.target.value})} />
                 <InputField icon={Tag} label="Código de Activo" placeholder="ACT-2024-X" value={formData.codigo_activo} onChange={(e: any) => setFormData({...formData, codigo_activo: e.target.value})} />
                 <InputField icon={ShieldAlert} label="Estado Garantía" placeholder="Ej: Activa hasta 2026" value={formData.estado_garantia} onChange={(e: any) => setFormData({...formData, estado_garantia: e.target.value})} colSpan="col-span-2" />
              </div>
           </div>

           {/* Chassis Type y Notas */}
           <div className="card-matrix p-10 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, es_laptop: true, es_escritorio: false})}
                   className={cn(
                     "flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest italic",
                     formData.es_laptop ? "bg-amber-500/10 border-amber-500 text-amber-500" : "bg-[#090a09] border-[#0e312a] text-[#4e564e]"
                   )}
                 >
                    <Laptop size={18} /> Laptop
                 </button>
                 <button 
                   type="button"
                   onClick={() => setFormData({...formData, es_laptop: false, es_escritorio: true})}
                   className={cn(
                     "flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest italic",
                     formData.es_escritorio ? "bg-[#00ff88] border-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20" : "bg-[#090a09] border-[#0e312a] text-[#4e564e]"
                   )}
                 >
                    <Monitor size={18} /> Escritorio
                 </button>
              </div>
              <InputField label="Notas Adicionales" placeholder="Comentarios del técnico..." value={formData.notas} onChange={(e: any) => setFormData({...formData, notas: e.target.value})} colSpan="col-span-2" />
           </div>

           <div className="flex gap-6">
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-[#4e564e] hover:text-white transition-all border border-[#0e312a]"
              > Abortar </button>
              <button 
                type="submit" 
                className="flex-[2] btn-matrix flex items-center justify-center gap-3 py-5 text-[10px] font-black italic tracking-widest"
              >
                <Save size={18} /> Inyectar Activo IT
              </button>
           </div>
        </div>
      </form>
    </div>
  )
}

export default CreateEquipmentPage
