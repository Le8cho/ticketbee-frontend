import { useMeQuery } from '@/api/auth'
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

export function ClientePerfil() {
  const { data: perfil, isLoading } = useMeQuery(true)

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
          <h2 className='text-2xl font-bold tracking-tight'>Mi perfil</h2>
          <p className='text-muted-foreground'>Tus datos de cuenta.</p>
        </div>

        {isLoading && <p className='text-muted-foreground'>Cargando…</p>}

        {perfil && (
          <Card className='max-w-md'>
            <CardHeader>
              <CardTitle>{perfil.nombre}</CardTitle>
              <CardDescription>{perfil.email}</CardDescription>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              Cliente desde el{' '}
              {new Date(perfil.creado_en).toLocaleDateString('es-PE')}
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
