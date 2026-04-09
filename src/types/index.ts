export interface Equipo {
  id: string
  created_at: string
  hostname: string
  username: string
  ip_local: string
  ip_publica?: string
  mac_address?: string
  sistema_operativo?: string
  memoria_ram?: string
  disco?: string
  procesador?: string
  marca_pc?: string
  modelo?: string
  numero_serie?: string
  es_laptop: boolean
  es_escritorio: boolean
  monitores?: string
  caracteristicas_pc?: string
  validado: boolean
  check_date?: string
  
  // INFRAESTRUCTURA DE RED ADICIONAL
  ip_switch?: string
  puerto_switch?: string
  vlan?: string
  
  // GESTIÓN DE ACTIVOS
  ubicacion_fisica?: string
  codigo_activo?: string
  fecha_compra?: string
  estado_garantia?: string
  notas?: string
}

export type NewEquipo = Omit<Equipo, 'id' | 'created_at'>
