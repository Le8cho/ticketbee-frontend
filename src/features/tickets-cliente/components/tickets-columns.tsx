import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { type TicketListItem } from '@/api/tickets'
import { estadoTicketBadgeClass, estadoTicketLabels } from '@/lib/ticket-estado'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'

export const ticketsColumns: ColumnDef<TicketListItem>[] = [
  {
    id: 'dispositivo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dispositivo' />
    ),
    cell: ({ row }) => {
      const { dispositivo_marca, dispositivo_modelo } = row.original
      const label =
        dispositivo_marca && dispositivo_modelo
          ? `${dispositivo_marca} ${dispositivo_modelo}`
          : '—'
      return <LongText className='max-w-40 ps-3'>{label}</LongText>
    },
    meta: { className: 'ps-3' },
    enableHiding: false,
  },
  {
    accessorKey: 'servicio_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Servicio' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48'>
        {row.getValue('servicio_nombre') ?? '—'}
      </LongText>
    ),
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
