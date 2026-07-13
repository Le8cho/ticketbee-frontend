import { format } from 'date-fns'
import { getRouteApi } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useClienteProfileQuery } from '@/api/clientes'
import { estadoTicketBadgeClass, estadoTicketLabels } from '@/lib/ticket-estado'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

const route = getRouteApi('/_authenticated/tecnico/clientes/$clienteId')

export function ClienteDetalle() {
  const { clienteId } = route.useParams()
  const navigate = route.useNavigate()
  const {
    data: cliente,
    isLoading,
    isError,
  } = useClienteProfileQuery(clienteId)

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <Button
          variant='ghost'
          size='sm'
          className='w-fit'
          onClick={() => navigate({ to: '/tecnico/clientes' })}
        >
          <ArrowLeft /> Volver a clientes
        </Button>

        {isLoading && (
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Loader2 className='animate-spin' /> Cargando…
          </div>
        )}

        {isError && (
          <p className='text-muted-foreground'>No se encontró el cliente.</p>
        )}

        {cliente && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>{cliente.nombre}</CardTitle>
                <CardDescription>
                  {cliente.email} · {cliente.distrito}
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground'>
                <span>
                  Registrado el{' '}
                  {format(new Date(cliente.creado_en), 'dd/MM/yyyy')}
                </span>
                <span>{cliente.activo ? 'Activo' : 'Inactivo'}</span>
              </CardContent>
            </Card>

            <div>
              <h3 className='mb-2 text-lg font-semibold'>
                Dispositivos ({cliente.dispositivos.length})
              </h3>
              <div className='flex flex-col gap-4'>
                {cliente.dispositivos.length === 0 && (
                  <p className='text-muted-foreground'>
                    Este cliente no tiene dispositivos registrados.
                  </p>
                )}
                {cliente.dispositivos.map((dispositivo) => (
                  <Card key={dispositivo.dispositivo_id}>
                    <CardHeader>
                      <CardTitle className='text-base'>
                        {dispositivo.marca} {dispositivo.modelo}
                        {!dispositivo.activo && (
                          <Badge variant='outline' className='ms-2'>
                            Inactivo
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {dispositivo.tipo_nombre ?? 'Sin tipo'}
                        {dispositivo.numero_serie
                          ? ` · N/S ${dispositivo.numero_serie}`
                          : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {dispositivo.tickets.length === 0 ? (
                        <p className='text-sm text-muted-foreground'>
                          Sin tickets.
                        </p>
                      ) : (
                        <div className='flex flex-col gap-2'>
                          {dispositivo.tickets.map((ticket) => (
                            <div
                              key={ticket.ticket_id}
                              className='flex flex-wrap items-center gap-2 text-sm'
                            >
                              <Badge
                                variant='outline'
                                className={cn(
                                  'capitalize',
                                  estadoTicketBadgeClass[ticket.estado]
                                )}
                              >
                                {estadoTicketLabels[ticket.estado]}
                              </Badge>
                              <span>
                                {ticket.servicio_nombre ?? 'Servicio'}
                              </span>
                              <span className='text-muted-foreground'>
                                {format(
                                  new Date(ticket.creado_en),
                                  'dd/MM/yyyy'
                                )}
                              </span>
                              {ticket.precio_final != null && (
                                <span className='text-muted-foreground'>
                                  S/ {ticket.precio_final}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </Main>
    </>
  )
}
