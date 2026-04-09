import { create } from 'zustand'
import type { Equipo, NewEquipo } from '../types'
import { supabase } from '../services/supabase'
import { toast } from 'react-hot-toast'

interface EquipmentState {
  equipos: Equipo[]
  isLoading: boolean
  error: string | null
  fetchEquipos: () => Promise<void>
  addEquipo: (equipo: NewEquipo) => Promise<void>
  updateEquipo: (id: string, updates: Partial<Equipo>) => Promise<void>
  getEquipo: (id: string) => Promise<Equipo | null>
  deleteEquipo: (id: string) => Promise<void>
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
      console.error('Error fetching:', error)
      set({ error: error.message, isLoading: false })
    } else {
      set({ equipos: data || [], isLoading: false })
    }
  },

  addEquipo: async (nuevoEquipo) => {
    set({ isLoading: true })
    const { error } = await supabase.from('equipos').insert([nuevoEquipo])
    if (error) {
      console.error('Error adding:', error)
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
      console.error('Error updating:', error)
      set({ error: error.message, isLoading: false })
      throw error
    } else {
      await get().fetchEquipos()
    }
  },

  getEquipo: async (id) => {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error getting equipment:', error)
      return null
    }
    return data
  },

  deleteEquipo: async (id: string) => {
    // 1. Borrado LOCAL inmediato (para que la UI reaccione como antes)
    const backupEquipos = get().equipos;
    set((state) => ({
      equipos: state.equipos.filter(e => e.id !== id),
      isLoading: true
    }))

    // 2. Intento de borrado en BASE DE DATOS
    try {
      const { error, count } = await supabase
        .from('equipos')
        .delete({ count: 'exact' })
        .eq('id', id)

      if (error) {
        throw error;
      }

      // Si count es 0, significa que no se encontró el ID o RLS lo bloqueó silenciosamente
      if (count === 0) {
        console.warn('Supabase no eliminó ninguna fila. Verifique políticas RLS.');
      }

      toast.success('Registro eliminado de la Matriz')
    } catch (err: any) {
      console.error('FALLO CRITICO BASE DE DATOS:', err)
      
      // Si falla el DB, pero el usuario quiere "limpiar", le avisamos
      toast.error(`Error de Base de Datos: ${err.message || 'Permiso denegado'}`)
      
      // Opcional: Si quieres que SIEMPRE se borre de la vista aunque falle la DB, no restauramos el backup.
      // Pero para ser honestos, si falla la DB, el registro volverá al refrescar.
      // Restauramos si falla para que el usuario sepa que no se borró realmente.
      set({ equipos: backupEquipos })
    } finally {
      set({ isLoading: false })
    }
  },
}))
