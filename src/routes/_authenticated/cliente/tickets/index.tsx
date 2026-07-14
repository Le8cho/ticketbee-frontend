import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TicketsCliente } from '@/features/tickets-cliente'

const ticketsSearchSchema = z.object({
  estado: z
    .enum([
      'EN_REVISION',
      'EN_ESPERA_PAGO',
      'EN_PROGRESO',
      'FINALIZADO',
      'RECHAZADO',
      'ARCHIVADO',
      'CANCELADO',
    ])
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute('/_authenticated/cliente/tickets/')({
  validateSearch: ticketsSearchSchema,
  component: TicketsCliente,
})
