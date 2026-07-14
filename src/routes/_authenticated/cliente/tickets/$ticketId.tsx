import { createFileRoute } from '@tanstack/react-router'
import { TicketDetalleCliente } from '@/features/tickets-cliente/detail'

export const Route = createFileRoute(
  '/_authenticated/cliente/tickets/$ticketId'
)({
  component: TicketDetalleCliente,
})
