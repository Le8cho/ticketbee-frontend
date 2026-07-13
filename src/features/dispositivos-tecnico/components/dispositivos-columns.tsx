import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { type Dispositivo } from '@/api/dispositivos'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'

export const dispositivosColumns: ColumnDef<Dispositivo>[] = [
  {
    id: 'marcaModelo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dispositivo' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-3 font-medium'>
        {row.original.marca} {row.original.modelo}
      </LongText>
    ),
    meta: { className: 'ps-3' },
    enableHiding: false,
  },
  {
    id: 'tipo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => <div>{row.original.tipo_dispositivo.nombre}</div>,
  },
  {
    accessorKey: 'numero_serie',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='N° de serie' />
    ),
    cell: ({ row }) => (
      <div className='text-nowrap'>{row.getValue('numero_serie') ?? '—'}</div>
    ),
  },
  {
    accessorKey: 'activo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline'>
        {row.getValue('activo') ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
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
