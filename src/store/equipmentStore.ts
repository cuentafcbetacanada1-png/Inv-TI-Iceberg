import { create } from 'zustand'
import type { Equipo, NewEquipo } from '../types'
import { supabase } from '../services/supabase'

interface EquipmentState {
  equipos: Equipo[]
  isLoading: boolean
  error: string | null
  fetchEquipos: () => Promise<void>
  addEquipo: (equipo: NewEquipo) => Promise<void>
  updateEquipo: (id: string, updates: Partial<Equipo>) => Promise<void>
  deleteEquipo: (id: string) => Promise<void>
  toggleValidation: (id: string, current: boolean) => Promise<void>
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipos: [],
  isLoading: false,
  error: null,

  fetchEquipos: async () => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      set({ error: error.message, isLoading: false })
    } else {
      set({ equipos: data || [], isLoading: false })
    }
  },

  addEquipo: async (equipo) => {
    set({ isLoading: true })
    const { data: { user } } = await supabase.auth.getUser()
    const newEntry = { ...equipo, created_by: user?.id }
    
    const { error } = await supabase
      .from('equipos')
      .insert([newEntry])

    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    } else {
      await get().fetchEquipos()
    }
  },

  updateEquipo: async (id, updates) => {
    set({ isLoading: true })
    const { error } = await supabase
      .from('equipos')
      .update(updates)
      .eq('id', id)

    if (error) {
      set({ error: error.message, isLoading: false })
      throw error
    } else {
      await get().fetchEquipos()
    }
  },

  deleteEquipo: async (id) => {
    set({ isLoading: true })
    const { error } = await supabase
      .from('equipos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting:', error)
      set({ error: error.message, isLoading: false })
      throw error
    } else {
      // Forzar actualización inmediata del estado local para evitar que "parezca" que sigue ahí
      set((state) => ({
        equipos: state.equipos.filter(e => e.id !== id),
        isLoading: false
      }))
      await get().fetchEquipos() // Recargar para sincronizar totalmente
    }
  },

  toggleValidation: async (id, current) => {
    const { error } = await supabase
      .from('equipos')
      .update({ validado: !current })
      .eq('id', id)

    if (error) {
      set({ error: error.message })
      throw error
    } else {
      await get().fetchEquipos()
    }
  },
}))
