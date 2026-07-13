import { useQuery } from '@tanstack/react-query'
import { httpClient, unwrap } from './http-client'

export type Rol = 'cliente' | 'tecnico'

export interface PerfilOut {
  id: string
  nombre: string
  email: string
  rol: Rol
  creado_en: string
}

export const obtenerMe = () =>
  unwrap<PerfilOut>(httpClient.get('/api/v1/auth/me'))

export function useMeQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: obtenerMe,
    enabled,
    retry: false,
  })
}
