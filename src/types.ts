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
  validado: boolean
  created_at: string
  created_by: string
  updated_at: string
}

export type NewEquipo = Omit<Equipo, 'id' | 'created_at' | 'updated_at' | 'created_by'> & { created_by?: string }
