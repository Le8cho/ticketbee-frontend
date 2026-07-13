import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TicketsTecnico } from '@/features/tickets-tecnico'

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
  garantia_vencida: z.boolean().optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/tecnico/tickets/')({
  validateSearch: ticketsSearchSchema,
  component: TicketsTecnico,
})
