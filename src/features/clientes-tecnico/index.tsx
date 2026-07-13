import { getRouteApi } from '@tanstack/react-router'
import { useClientesQuery } from '@/api/clientes'
import { estadoTicketOptions } from '@/lib/ticket-estado'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ClientesTable } from './components/clientes-table'

const route = getRouteApi('/_authenticated/tecnico/clientes/')

const tipoServicioOptions = [
  { value: 'PREVENTIVO', label: 'Preventivo' },
  { value: 'CORRECTIVO', label: 'Correctivo' },
  { value: 'SUSCRIPCION_SOFTWARE', label: 'Suscripción software' },
]

export function ClientesTecnico() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading } = useClientesQuery({
    estado_ticket: search.estado_ticket,
    distrito: search.distrito || undefined,
    tipo_ultimo_ticket: search.tipo_ultimo_ticket,
  })

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Clientes</h2>
          <p className='text-muted-foreground'>
            Clientes registrados, su distrito y el estado de su último ticket.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='Filtrar por distrito…'
            value={search.distrito ?? ''}
            onChange={(e) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  distrito: e.target.value || undefined,
                }),
              })
            }
            className='h-8 w-48'
          />
          <Select
            value={search.estado_ticket ?? 'all'}
            onValueChange={(value) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  estado_ticket: value === 'all' ? undefined : (value as never),
                }),
              })
            }
          >
            <SelectTrigger className='h-8 w-52'>
              <SelectValue placeholder='Estado del ticket' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Cualquier estado</SelectItem>
              {estadoTicketOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={search.tipo_ultimo_ticket ?? 'all'}
            onValueChange={(value) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  tipo_ultimo_ticket:
                    value === 'all' ? undefined : (value as never),
                }),
              })
            }
          >
            <SelectTrigger className='h-8 w-56'>
              <SelectValue placeholder='Tipo de último servicio' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Cualquier tipo</SelectItem>
              {tipoServicioOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ClientesTable data={data ?? []} isLoading={isLoading} />
      </Main>
    </>
  )
}
