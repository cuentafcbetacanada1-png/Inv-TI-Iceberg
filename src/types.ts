export interface Admin {
  id: string
  email: string
}

export interface Equipo {
  id: string
  nombre_usuario: string
  equipo: 'Computador' | 'Portátil'
  caracteristicas: string
  hostname: string
  ip_local?: string
  numero_inventario?: string
  fecha_entrega?: string
  numero_serie?: string
  marca_modelo_cpu?: string
  monitor?: string
  procesador?: string
  almacenamiento?: string
  ram?: string
  sistema_operativo?: string
  ubicacion?: string
  motivo_reemplazo?: string
  fecha_reemplazo?: string
  nuevo_funcionario?: string
  validado: boolean
  created_at: string
  created_by: string
  updated_at: string
}

export type NewEquipo = Omit<Equipo, 'id' | 'created_at' | 'updated_at' | 'created_by'> & { created_by?: string }
