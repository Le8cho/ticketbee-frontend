import { createFileRoute } from '@tanstack/react-router'
import { TicketDetalleTecnico } from '@/features/tickets-tecnico/detail'

export const Route = createFileRoute(
  '/_authenticated/tecnico/tickets/$ticketId'
)({
  component: TicketDetalleTecnico,
})
