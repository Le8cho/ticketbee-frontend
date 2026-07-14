import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useTicketsQuery } from '@/api/tickets'
import { estadoTicketOptions } from '@/lib/ticket-estado'
import { Button } from '@/components/ui/button'
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
import { CrearTicketDialog } from './components/crear-ticket-dialog'
import { TicketsTable } from './components/tickets-table'

const route = getRouteApi('/_authenticated/cliente/tickets/')

export function TicketsCliente() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [crearOpen, setCrearOpen] = useState(false)

  const { data, isLoading } = useTicketsQuery({ estado: search.estado })

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Mis tickets</h2>
            <p className='text-muted-foreground'>
              El estado de tus solicitudes de reparación.
            </p>
          </div>
          <Button onClick={() => setCrearOpen(true)}>
            <Plus /> Nuevo ticket
          </Button>
        </div>

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

        <TicketsTable data={data ?? []} isLoading={isLoading} />
      </Main>

      <CrearTicketDialog open={crearOpen} onOpenChange={setCrearOpen} />
    </>
  )
}
