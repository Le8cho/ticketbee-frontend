import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient, unwrap } from './http-client'

export interface TipoDispositivo {
  tipo_dispositivo_id: number
  nombre: string
}

export interface ClienteBasico {
  cliente_id: string
  nombre: string
  email: string
}

export interface Dispositivo {
  dispositivo_id: string
  cliente_id: string
  cliente: ClienteBasico
  tipo_dispositivo_id: number
  tipo_dispositivo: TipoDispositivo
  marca: string
  modelo: string
  numero_serie: string | null
  foto_url: string | null
  activo: boolean
  creado_en: string
  inactivado_en: string | null
}

export interface DispositivoCreate {
  tipo_dispositivo_id: number
  marca: string
  modelo: string
  numero_serie?: string | null
}

export type DispositivoUpdate = Partial<
  Omit<DispositivoCreate, 'tipo_dispositivo_id'>
>

export interface DispositivosFiltros {
  tipo_dispositivo_id?: number
  estado_ticket?: string
  servicio_id?: string
  cliente_id?: string // técnico/admin únicamente, ver security.py
}

const listarTipos = () =>
  unwrap<TipoDispositivo[]>(httpClient.get('/api/v1/dispositivos/tipos'))

const listarDispositivos = (filtros: DispositivosFiltros = {}) =>
  unwrap<Dispositivo[]>(
    httpClient.get('/api/v1/dispositivos', { params: filtros })
  )

const registrarDispositivo = (body: DispositivoCreate) =>
  unwrap<Dispositivo>(httpClient.post('/api/v1/dispositivos', body))

const actualizarDispositivo = (
  dispositivoId: string,
  body: DispositivoUpdate
) =>
  unwrap<Dispositivo>(
    httpClient.patch(`/api/v1/dispositivos/${dispositivoId}`, body)
  )

const eliminarDispositivo = (dispositivoId: string) =>
  httpClient.delete(`/api/v1/dispositivos/${dispositivoId}`)

const subirFotoDispositivo = (dispositivoId: string, foto: File) => {
  const form = new FormData()
  form.append('foto', foto)
  return unwrap<{ url: string }>(
    httpClient.post(`/api/v1/dispositivos/${dispositivoId}/foto`, form)
  )
}

const obtenerFotoDispositivo = (dispositivoId: string) =>
  unwrap<{ url: string }>(
    httpClient.get(`/api/v1/dispositivos/${dispositivoId}/foto`)
  )

export function useTiposDispositivoQuery() {
  return useQuery({ queryKey: ['dispositivos', 'tipos'], queryFn: listarTipos })
}

export function useDispositivosQuery(filtros: DispositivosFiltros = {}) {
  return useQuery({
    queryKey: ['dispositivos', filtros],
    queryFn: () => listarDispositivos(filtros),
  })
}

export function useRegistrarDispositivoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: registrarDispositivo,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['dispositivos'] }),
  })
}

export function useActualizarDispositivoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      dispositivoId,
      body,
    }: {
      dispositivoId: string
      body: DispositivoUpdate
    }) => actualizarDispositivo(dispositivoId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['dispositivos'] }),
  })
}

export function useEliminarDispositivoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: eliminarDispositivo,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['dispositivos'] }),
  })
}

export function useSubirFotoDispositivoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      dispositivoId,
      foto,
    }: {
      dispositivoId: string
      foto: File
    }) => subirFotoDispositivo(dispositivoId, foto),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['dispositivos'] }),
  })
}

export function useFotoDispositivoQuery(
  dispositivoId: string,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['dispositivos', dispositivoId, 'foto'],
    queryFn: () => obtenerFotoDispositivo(dispositivoId),
    enabled,
  })
}
