import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/connection'

interface AuthState {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signOut: async () => {
    await supabase.auth.signOut()
    // redirect handled by AuthInit listener
  },
}))
