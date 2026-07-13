import { useQuery } from '@tanstack/react-query'
import { httpClient, unwrap } from './http-client'

export interface Tecnico {
  tecnico_id: string
  nombre: string
  email: string
}

const obtenerTecnico = (tecnicoId: string) =>
  unwrap<Tecnico>(httpClient.get(`/api/v1/tecnicos/${tecnicoId}`))

export function useTecnicoQuery(tecnicoId: string) {
  return useQuery({
    queryKey: ['tecnicos', tecnicoId],
    queryFn: () => obtenerTecnico(tecnicoId),
    enabled: !!tecnicoId,
  })
}
