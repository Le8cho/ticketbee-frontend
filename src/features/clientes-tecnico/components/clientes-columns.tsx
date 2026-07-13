import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { type ClienteListItem } from '@/api/clientes'
import { estadoTicketBadgeClass, estadoTicketLabels } from '@/lib/ticket-estado'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'

export const clientesColumns: ColumnDef<ClienteListItem>[] = [
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-3 font-medium'>
        {row.getValue('nombre')}
      </LongText>
    ),
    meta: { className: 'ps-3' },
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'distrito',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Distrito' />
    ),
    cell: ({ row }) => <div>{row.getValue('distrito')}</div>,
  },
  {
    accessorKey: 'tickets_activos',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tickets activos' />
    ),
    cell: ({ row }) => (
      <div className='text-center'>{row.getValue('tickets_activos')}</div>
    ),
  },
  {
    accessorKey: 'ultimo_ticket_estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Último ticket' />
    ),
    cell: ({ row }) => {
      const estado = row.original.ultimo_ticket_estado
      if (!estado) return <span className='text-muted-foreground'>—</span>
      return (
        <Badge
          variant='outline'
          className={cn('capitalize', estadoTicketBadgeClass[estado])}
        >
          {estadoTicketLabels[estado]}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'creado_en',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Registrado' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>
        {format(new Date(row.getValue('creado_en')), 'dd/MM/yyyy')}
      </div>
    ),
  },
]
