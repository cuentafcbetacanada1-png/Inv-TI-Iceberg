import { create } from 'zustand'

export interface User {
  id: string
  email?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: any | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
}

import { supabase } from '../services/supabase'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  }
}))
