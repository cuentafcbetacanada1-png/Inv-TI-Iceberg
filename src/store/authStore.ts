import { create } from 'zustand'
import { supabase } from '../services/supabase'

export interface User {
  id: string
  email?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    if (data.user) {
      set({ user: { id: data.user.id, email: data.user.email } })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  }
}))
