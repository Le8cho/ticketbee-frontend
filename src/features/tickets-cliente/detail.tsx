import { useState } from 'react'
import { format } from 'date-fns'
import { getRouteApi } from '@tanstack/react-router'
import { Wallet } from '@mercadopago/sdk-react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCrearPreferenciaMutation } from '@/api/payments'
import {
  useConfirmarRecepcionMutation,
  useReabrirTicketMutation,
  useTicketQuery,
} from '@/api/tickets'
import { handleServerError } from '@/lib/handle-server-error'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { AdjuntosSection } from '@/features/ticket-adjuntos'

const route = getRouteApi('/_authenticated/cliente/tickets/$ticketId')

export function TicketDetalleCliente() {
  const { ticketId } = route.useParams()
  const navigate = route.useNavigate()
  const { data: ticket, isLoading, isError } = useTicketQuery(ticketId)

  const [recepcionOpen, setRecepcionOpen] = useState(false)
  const [reabrirOpen, setReabrirOpen] = useState(false)
  const [preferenceId, setPreferenceId] = useState<string | null>(null)

  const confirmarRecepcion = useConfirmarRecepcionMutation()
  const reabrir = useReabrirTicketMutation()
  const crearPreferencia = useCrearPreferenciaMutation()

  const handlePagar = () => {
    crearPreferencia
      .mutateAsync(ticketId)
      .then(({ preference_id }) => setPreferenceId(preference_id))
      .catch(handleServerError)
  }

  const handleConfirmarRecepcion = () => {
    confirmarRecepcion
      .mutateAsync(ticketId)
      .then(() => {
        toast.success('Recepción confirmada. ¡Gracias por confiar en TechFix!')
        setRecepcionOpen(false)
      })
      .catch(handleServerError)
  }

  const handleReabrir = () => {
    reabrir
      .mutateAsync(ticketId)
      .then(() => {
        toast.success('Ticket reabierto por garantía.')
        setReabrirOpen(false)
      })
      .catch(handleServerError)
  }

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
          onClick={() => navigate({ to: '/cliente/tickets' })}
        >
          <ArrowLeft /> Volver a mis tickets
        </Button>

        {isLoading && (
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Loader2 className='animate-spin' /> Cargando…
          </div>
        )}
        {isError && (
          <p className='text-muted-foreground'>No se encontró el ticket.</p>
        )}

        {ticket && (
          <>
            <Card>
              <CardHeader>
                <div className='flex flex-wrap items-center gap-2'>
                  <CardTitle className='text-xl'>
                    {ticket.dispositivo_marca && ticket.dispositivo_modelo
                      ? `${ticket.dispositivo_marca} ${ticket.dispositivo_modelo}`
                      : `Ticket #${ticket.ticket_id.slice(0, 8)}`}
                  </CardTitle>
                  <Badge
                    variant='outline'
                    className={cn(estadoTicketBadgeClass[ticket.estado])}
                  >
                    {estadoTicketLabels[ticket.estado]}
                  </Badge>
                </div>
                <CardDescription>
                  {ticket.servicio_nombre ?? 'Servicio'} · Creado el{' '}
                  {format(new Date(ticket.creado_en), 'dd/MM/yyyy HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent className='grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2'>
                <div>
                  <span className='text-muted-foreground'>Descripción: </span>
                  {ticket.descripcion ?? '—'}
                </div>
                <div>
                  <span className='text-muted-foreground'>Precio final: </span>
                  {ticket.precio_final ? `S/ ${ticket.precio_final}` : '—'}
                </div>
              </CardContent>
            </Card>

            <div className='flex flex-wrap gap-2'>
              {ticket.estado === 'EN_ESPERA_PAGO' && !preferenceId && (
                <Button
                  onClick={handlePagar}
                  disabled={crearPreferencia.isPending}
                >
                  {crearPreferencia.isPending && (
                    <Loader2 className='animate-spin' />
                  )}
                  Pagar
                </Button>
              )}
              {ticket.estado === 'EN_PROGRESO' &&
                ticket.confirmado_tecnico &&
                !ticket.confirmado_cliente && (
                  <Button onClick={() => setRecepcionOpen(true)}>
                    Confirmar recepción
                  </Button>
                )}
              {ticket.estado === 'FINALIZADO' && (
                <Button variant='outline' onClick={() => setReabrirOpen(true)}>
                  Reportar incidente (garantía)
                </Button>
              )}
            </div>

            {preferenceId && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Completar el pago</CardTitle>
                  <CardDescription>
                    Elegí tu método de pago para continuar.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Wallet initialization={{ preferenceId }} />
                </CardContent>
              </Card>
            )}

            <AdjuntosSection
              ticketId={ticketId}
              puedeSubir={ticket.estado === 'EN_PROGRESO'}
            />

            <ConfirmDialog
              open={recepcionOpen}
              onOpenChange={setRecepcionOpen}
              title='Confirmar recepción'
              desc='Confirmá que ya recibiste tu equipo y que el servicio quedó conforme. El ticket pasará a Finalizado.'
              confirmText='Confirmar recepción'
              isLoading={confirmarRecepcion.isPending}
              handleConfirm={handleConfirmarRecepcion}
            />
            <ConfirmDialog
              open={reabrirOpen}
              onOpenChange={setReabrirOpen}
              title='Reportar incidente por garantía'
              desc='Esto reabre el ticket para que el técnico revise el mismo problema nuevamente, siempre que la garantía siga vigente.'
              confirmText='Reportar incidente'
              isLoading={reabrir.isPending}
              handleConfirm={handleReabrir}
            />
          </>
        )}
      </Main>
    </>
  )
}
