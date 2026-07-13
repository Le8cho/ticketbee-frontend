import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { type TicketListItem } from '@/api/tickets'
import { estadoTicketBadgeClass, estadoTicketLabels } from '@/lib/ticket-estado'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'

export const ticketsColumns: ColumnDef<TicketListItem>[] = [
  {
    accessorKey: 'ticket_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ticket' />
    ),
    cell: ({ row }) => (
      <div className='ps-3 font-mono text-xs'>
        {row.getValue<string>('ticket_id').slice(0, 8)}
      </div>
    ),
    meta: { className: 'ps-3' },
    enableHiding: false,
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const estado = row.original.estado
      return (
        <Badge variant='outline' className={cn(estadoTicketBadgeClass[estado])}>
          {estadoTicketLabels[estado]}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'precio_base',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio base' />
    ),
    cell: ({ row }) => {
      const value = row.getValue('precio_base')
      return <div>{value ? `S/ ${value}` : '—'}</div>
    },
  },
  {
    accessorKey: 'precio_final',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Precio final' />
    ),
    cell: ({ row }) => {
      const value = row.getValue('precio_final')
      return <div>{value ? `S/ ${value}` : '—'}</div>
    },
  },
  {
    accessorKey: 'creado_en',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Creado' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>
        {format(new Date(row.getValue('creado_en')), 'dd/MM/yyyy')}
      </div>
    ),
  },
]
