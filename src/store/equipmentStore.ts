import { create } from 'zustand'
import type { Equipo, NewEquipo } from '../types'
import { supabase } from '../services/supabase'
import { toast } from 'react-hot-toast'

interface EquipmentState {
  equipos: Equipo[]
  isLoading: boolean
  error: string | null
  fetchEquipos: () => Promise<void>
  getEquipo: (id: string) => Promise<Equipo | null>
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

  getEquipo: async (id: string) => {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      set({ error: error.message })
      return null
    }
    return data
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

  deleteEquipo: async (id: string) => {
    set({ isLoading: true })
    try {
      const { error } = await supabase
        .from('equipos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('ERROR CRITICO AL BORRAR:', error)
        toast.error(`Error de seguridad: ${error.message}`)
        set({ error: error.message, isLoading: false })
        throw error
      }
      
      // Actualización local inmediata
      set((state) => ({
        equipos: state.equipos.filter(e => e.id !== id),
        isLoading: false
      }))
    } catch (err) {
      set({ isLoading: false })
      throw err
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
