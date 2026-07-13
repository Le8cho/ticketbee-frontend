import { type EstadoTicket } from '@/api/tickets'

export const estadoTicketLabels: Record<EstadoTicket, string> = {
  EN_REVISION: 'En revisión',
  EN_ESPERA_PAGO: 'Espera de pago',
  EN_PROGRESO: 'En progreso',
  FINALIZADO: 'Finalizado',
  RECHAZADO: 'Rechazado',
  ARCHIVADO: 'Archivado',
  CANCELADO: 'Cancelado',
}

export const estadoTicketBadgeClass: Record<EstadoTicket, string> = {
  EN_REVISION: 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300',
  EN_ESPERA_PAGO:
    'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-300',
  EN_PROGRESO:
    'bg-blue-100/40 text-blue-900 dark:text-blue-200 border-blue-300',
  FINALIZADO: 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  RECHAZADO:
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ARCHIVADO: 'bg-neutral-300/40 border-neutral-300',
  CANCELADO: 'bg-neutral-300/40 border-neutral-300 line-through',
}

export const estadoTicketOptions: { label: string; value: EstadoTicket }[] = (
  Object.keys(estadoTicketLabels) as EstadoTicket[]
).map((value) => ({ value, label: estadoTicketLabels[value] }))
