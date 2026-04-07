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
  sku?: string
  modelo?: string
  validado?: boolean
  created_at: string
  updated_at: string
}

export type NewEquipo = Omit<Equipo, 'id' | 'created_at' | 'updated_at'>
