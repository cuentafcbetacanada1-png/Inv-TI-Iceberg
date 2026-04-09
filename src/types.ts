export interface Admin {
  id: string
  email: string
}

export interface Equipo {
  id: string
  hostname: string
  username: string
  ip_local: string
  caracteristicas_pc: string
  numero_serie: string
  marca_pc: string
  es_escritorio: boolean
  es_laptop: boolean
  memoria_ram: string
  sistema_operativo: string
  disco?: string
  modelo?: string
  monitores?: string
  validado?: boolean
  // Campos de Red e Infraestructura
  ip_switch?: string
  puerto_switch?: string
  vlan?: string
  // Campos de Gestión de Activos
  ubicacion_fisica?: string
  codigo_activo?: string
  estado_garantia?: string
  created_at: string
  updated_at: string
}

export type NewEquipo = Omit<Equipo, 'id' | 'created_at' | 'updated_at'>
