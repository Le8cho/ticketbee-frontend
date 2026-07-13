import { createFileRoute } from '@tanstack/react-router'
import { ClienteDetalle } from '@/features/clientes-tecnico/detail'

export const Route = createFileRoute(
  '/_authenticated/tecnico/clientes/$clienteId'
)({
  component: ClienteDetalle,
})
