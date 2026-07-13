import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { DispositivosTecnico } from '@/features/dispositivos-tecnico'

const dispositivosSearchSchema = z.object({
  tipo_dispositivo_id: z.number().optional().catch(undefined),
})

export const Route = createFileRoute('/_authenticated/tecnico/dispositivos/')({
  validateSearch: dispositivosSearchSchema,
  component: DispositivosTecnico,
})
