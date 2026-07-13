import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ClientesTecnico } from '@/features/clientes-tecnico'

const clientesSearchSchema = z.object({
  estado_ticket: z
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
  distrito: z.string().optional().catch(undefined),
  fecha_desde: z.string().optional().catch(undefined),
  tipo_ultimo_ticket: z
    .enum(['PREVENTIVO', 'CORRECTIVO', 'SUSCRIPCION_SOFTWARE'])
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute('/_authenticated/tecnico/clientes/')({
  validateSearch: clientesSearchSchema,
  component: ClientesTecnico,
})
