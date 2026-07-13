import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient, unwrap } from './http-client'

export type SubidoPor = 'TECNICO' | 'CLIENTE'

export interface Adjunto {
  adjunto_id: string
  ticket_id: string
  nombre: string
  tipo_mime: string
  tamanio_bytes: number
  subido_por: SubidoPor
  subido_en: string
}

const listarAdjuntos = (ticketId: string) =>
  unwrap<Adjunto[]>(httpClient.get(`/api/v1/tickets/${ticketId}/adjuntos`))

const subirAdjunto = (ticketId: string, archivo: File) => {
  const form = new FormData()
  form.append('archivo', archivo)
  return unwrap<{ adjunto: Adjunto; url: string }>(
    httpClient.post(`/api/v1/tickets/${ticketId}/adjuntos`, form)
  )
}

const obtenerUrlAdjunto = (adjuntoId: string) =>
  unwrap<{ url: string }>(httpClient.get(`/api/v1/adjuntos/${adjuntoId}/url`))

const eliminarAdjunto = (adjuntoId: string) =>
  httpClient.delete(`/api/v1/adjuntos/${adjuntoId}`)

export function useAdjuntosQuery(ticketId: string) {
  return useQuery({
    queryKey: ['tickets', ticketId, 'adjuntos'],
    queryFn: () => listarAdjuntos(ticketId),
    enabled: !!ticketId,
  })
}

export function useSubirAdjuntoMutation(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (archivo: File) => subirAdjunto(ticketId, archivo),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['tickets', ticketId, 'adjuntos'],
      }),
  })
}

export function useUrlAdjuntoQuery(adjuntoId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['adjuntos', adjuntoId, 'url'],
    queryFn: () => obtenerUrlAdjunto(adjuntoId),
    enabled,
  })
}

/** Para el botón "Ver" — pide la SAS URL bajo demanda en vez de precargarla por fila. */
export function useObtenerUrlAdjuntoMutation() {
  return useMutation({ mutationFn: obtenerUrlAdjunto })
}

export function useEliminarAdjuntoMutation(ticketId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarAdjunto,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ['tickets', ticketId, 'adjuntos'],
      }),
  })
}
