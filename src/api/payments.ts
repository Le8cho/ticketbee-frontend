import { useMutation } from '@tanstack/react-query'
import { httpClient, unwrap } from './http-client'

export interface PreferenceResponse {
  preference_id: string
}

const crearPreferencia = (ticketId: string) =>
  unwrap<PreferenceResponse>(
    httpClient.post('/api/v1/payments/preference', { ticket_id: ticketId })
  )

export function useCrearPreferenciaMutation() {
  return useMutation({ mutationFn: crearPreferencia })
}
