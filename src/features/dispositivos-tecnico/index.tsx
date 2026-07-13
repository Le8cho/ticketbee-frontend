import { getRouteApi } from '@tanstack/react-router'
import {
  useDispositivosQuery,
  useTiposDispositivoQuery,
} from '@/api/dispositivos'
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
import { DispositivosTable } from './components/dispositivos-table'

const route = getRouteApi('/_authenticated/tecnico/dispositivos/')

export function DispositivosTecnico() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { data: tipos } = useTiposDispositivoQuery()
  const { data, isLoading } = useDispositivosQuery({
    tipo_dispositivo_id: search.tipo_dispositivo_id,
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
          <h2 className='text-2xl font-bold tracking-tight'>Dispositivos</h2>
          <p className='text-muted-foreground'>
            Todos los dispositivos activos registrados por los clientes.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Select
            value={search.tipo_dispositivo_id?.toString() ?? 'all'}
            onValueChange={(value) =>
              navigate({
                search: (prev) => ({
                  ...prev,
                  tipo_dispositivo_id:
                    value === 'all' ? undefined : Number(value),
                }),
              })
            }
          >
            <SelectTrigger className='h-8 w-56'>
              <SelectValue placeholder='Tipo de dispositivo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Cualquier tipo</SelectItem>
              {tipos?.map((tipo) => (
                <SelectItem
                  key={tipo.tipo_dispositivo_id}
                  value={tipo.tipo_dispositivo_id.toString()}
                >
                  {tipo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DispositivosTable data={data ?? []} isLoading={isLoading} />
      </Main>
    </>
  )
}
