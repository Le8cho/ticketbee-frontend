import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PagoResultado } from '@/features/pago-resultado'

const pagoResultadoSearchSchema = z
  .object({
    external_reference: z.string().optional().catch(undefined),
    collection_status: z.string().optional().catch(undefined),
    status: z.string().optional().catch(undefined),
    payment_id: z.string().optional().catch(undefined),
  })
  .passthrough()

export const Route = createFileRoute('/_authenticated/cliente/pago-fallido/')({
  validateSearch: pagoResultadoSearchSchema,
  component: () => <PagoResultado exito={false} />,
})
