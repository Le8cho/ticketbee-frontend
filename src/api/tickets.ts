import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { EstadoTicket } from './clientes'
import { httpClient, unwrap } from './http-client'

export type { EstadoTicket }

export interface TicketResponse {
  ticket_id: string
  cliente_id: string
  servicio_id: string
  servicio_nombre: string | null
  tecnico_id: string | null
  dispositivo_id: string | null
  dispositivo_marca: string | null
  dispositivo_modelo: string | null
  estado: EstadoTicket
  descripcion: string | null
  precio_base: string | null // Decimal serializado como string
  precio_final: string | null
  motivo_rechazo: string | null // siempre null salvo que quien pregunta sea técnico (intencional, ver plan SD-07)
  confirmado_tecnico: boolean
  confirmado_cliente: boolean
  fecha_finalizacion: string | null
  creado_en: string
  actualizado_en: string | null
}

export interface TicketListItem {
  ticket_id: string
  estado: EstadoTicket
  servicio_id: string
  servicio_nombre: string | null
  dispositivo_id: string | null
  dispositivo_marca: string | null
  dispositivo_modelo: string | null
  precio_base: string | null
  precio_final: string | null
  creado_en: string
}

export interface TicketCrear {
  dispositivo_id: string
  servicio_id: string
  descripcion?: string
}

export interface TicketesFiltros {
  estado?: EstadoTicket
  cliente_id?: string // técnico/admin únicamente
  tipo_dispositivo_id?: number
  servicio_id?: string
  fecha_desde?: string
  garantia_vencida?: boolean // técnico/admin únicamente
}

export interface ArchivarResult {
  ticket_id: string
  cliente_email: string
  cliente_nombre: string
}

export interface GarantiaCreate {
  fecha_inicio: string
  fecha_vencimiento: string
}

export interface GarantiaResult extends ArchivarResult {
  fecha_vencimiento: string
}

const listarTickets = (filtros: TicketesFiltros = {}) =>
  unwrap<TicketListItem[]>(
    httpClient.get('/api/v1/tickets', { params: filtros })
  )

const obtenerTicket = (ticketId: string) =>
  unwrap<TicketResponse>(httpClient.get(`/api/v1/tickets/${ticketId}`))

const crearTicket = (body: TicketCrear) =>
  unwrap<TicketResponse>(httpClient.post('/api/v1/tickets', body))

const confirmarRecepcion = (ticketId: string) =>
  unwrap<TicketResponse>(
    httpClient.patch(`/api/v1/tickets/${ticketId}/confirmar-recepcion`)
  )

const reabrirTicket = (ticketId: string) =>
  unwrap<TicketResponse>(
    httpClient.patch(`/api/v1/tickets/${ticketId}/reabrir`)
  )

const aceptarTicket = (ticketId: string, precioFinal: number) =>
  unwrap<TicketResponse>(
    httpClient.patch(`/api/v1/tickets/${ticketId}/aceptar`, {
      precio_final: precioFinal,
    })
  )

const rechazarTicket = (ticketId: string, motivoRechazo: string) =>
  unwrap<TicketResponse>(
    httpClient.patch(`/api/v1/tickets/${ticketId}/rechazar`, {
      motivo_rechazo: motivoRechazo,
    })
  )

const confirmarEntrega = (ticketId: string) =>
  unwrap<TicketResponse>(
    httpClient.patch(`/api/v1/tickets/${ticketId}/confirmar-entrega`)
  )

const archivarTicket = (ticketId: string) =>
  unwrap<ArchivarResult>(
    httpClient.patch(`/api/v1/tickets/${ticketId}/archivar`)
  )

const registrarGarantia = (ticketId: string, body: GarantiaCreate) =>
  unwrap<GarantiaResult>(
    httpClient.post(`/api/v1/tickets/${ticketId}/garantia`, body)
  )

export function useTicketsQuery(filtros: TicketesFiltros = {}) {
  return useQuery({
    queryKey: ['tickets', filtros],
    queryFn: () => listarTickets(filtros),
  })
}

export function useTicketQuery(ticketId: string) {
  return useQuery({
    queryKey: ['tickets', ticketId],
    queryFn: () => obtenerTicket(ticketId),
    enabled: !!ticketId,
  })
}

function useTicketMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  })
}

export function useCrearTicketMutation() {
  return useTicketMutation(crearTicket)
}

export function useConfirmarRecepcionMutation() {
  return useTicketMutation(confirmarRecepcion)
}

export function useReabrirTicketMutation() {
  return useTicketMutation(reabrirTicket)
}

export function useAceptarTicketMutation() {
  return useTicketMutation(
    ({ ticketId, precioFinal }: { ticketId: string; precioFinal: number }) =>
      aceptarTicket(ticketId, precioFinal)
  )
}

export function useRechazarTicketMutation() {
  return useTicketMutation(
    ({
      ticketId,
      motivoRechazo,
    }: {
      ticketId: string
      motivoRechazo: string
    }) => rechazarTicket(ticketId, motivoRechazo)
  )
}

export function useConfirmarEntregaMutation() {
  return useTicketMutation(confirmarEntrega)
}

export function useArchivarTicketMutation() {
  return useTicketMutation(archivarTicket)
}

export function useRegistrarGarantiaMutation() {
  return useTicketMutation(
    ({ ticketId, body }: { ticketId: string; body: GarantiaCreate }) =>
      registrarGarantia(ticketId, body)
  )
}
