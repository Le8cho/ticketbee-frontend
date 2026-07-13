import { create } from 'zustand'

export type Rol = 'cliente' | 'tecnico'

export interface AuthUser {
  id: string
  nombre: string
  email: string
  rol: Rol
}

interface AuthState {
  auth: {
    user: AuthUser | null
    accessToken: string
    /** true una vez que ya se resolvió (o se confirmó ausente) la sesión de Supabase al arrancar la app. */
    isHydrated: boolean
    setSession: (accessToken: string, user: AuthUser) => void
    /** Limpia el estado local. No cierra la sesión de Supabase — para eso usar signOut() de api/auth-session.ts. */
    clear: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: null,
    accessToken: '',
    isHydrated: false,
    setSession: (accessToken, user) =>
      set((state) => ({
        auth: { ...state.auth, accessToken, user, isHydrated: true },
      })),
    clear: () =>
      set((state) => ({
        auth: { ...state.auth, accessToken: '', user: null, isHydrated: true },
      })),
  },
}))
