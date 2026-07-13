import { getRouteApi } from '@tanstack/react-router'
import { useTicketsQuery } from '@/api/tickets'
import { estadoTicketOptions } from '@/lib/ticket-estado'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import { TicketsTable } from './components/tickets-table'

const route = getRouteApi('/_authenticated/tecnico/tickets/')

export function TicketsTecnico() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data, isLoading } = useTicketsQuery({
    estado: search.estado,
    garantia_vencida: search.garantia_vencida,
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
          <h2 className='text-2xl font-bold tracking-tight'>Tickets</h2>
          <p className='text-muted-foreground'>
            Todos los tickets creados por los clientes.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-4'>
          <Select
            value={search.estado ?? 'all'}
            onValueChange={(value) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  estado: value === 'all' ? undefined : (value as never),
                }),
              })
            }
          >
            <SelectTrigger className='h-8 w-52'>
              <SelectValue placeholder='Estado' />
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
          <div className='flex items-center gap-2'>
            <Checkbox
              id='garantia_vencida'
              checked={search.garantia_vencida ?? false}
              onCheckedChange={(checked) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    garantia_vencida: checked === true ? true : undefined,
                  }),
                })
              }
            />
            <Label htmlFor='garantia_vencida'>Garantía vencida</Label>
          </div>
        </div>

        <TicketsTable data={data ?? []} isLoading={isLoading} />
      </Main>
    </>
  )
}
