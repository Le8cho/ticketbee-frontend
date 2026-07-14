import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { CheckCircle2, XCircle } from 'lucide-react'
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

const exitoRoute = getRouteApi('/_authenticated/cliente/pago-exitoso/')
const fallidoRoute = getRouteApi('/_authenticated/cliente/pago-fallido/')

export function PagoResultado({ exito }: { exito: boolean }) {
  const { external_reference: ticketId } = (
    exito ? exitoRoute : fallidoRoute
  ).useSearch()
  const queryClient = useQueryClient()

  useEffect(() => {
    // El webhook de Mercado Pago procesa el pago de forma asíncrona; al volver
    // del checkout invalidamos el ticket para que refleje el estado apenas llegue.
    queryClient.invalidateQueries({ queryKey: ['tickets'] })
  }, [queryClient])

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col items-center justify-center gap-4'>
        <Card className='w-full max-w-md'>
          <CardHeader className='items-center text-center'>
            {exito ? (
              <CheckCircle2 className='size-12 text-green-600' />
            ) : (
              <XCircle className='size-12 text-destructive' />
            )}
            <CardTitle>
              {exito ? 'Pago realizado' : 'Pago no completado'}
            </CardTitle>
            <CardDescription>
              {exito
                ? 'Estamos confirmando tu pago con Mercado Pago. En unos segundos tu ticket va a pasar a En progreso.'
                : 'El pago no se pudo completar. Podés volver al ticket e intentar de nuevo.'}
            </CardDescription>
          </CardHeader>
          <CardContent className='flex justify-center'>
            {ticketId ? (
              <Button asChild>
                <Link to='/cliente/tickets/$ticketId' params={{ ticketId }}>
                  Ver mi ticket
                </Link>
              </Button>
            ) : (
              <Button asChild variant='outline'>
                <Link to='/cliente/tickets'>Ir a mis tickets</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
