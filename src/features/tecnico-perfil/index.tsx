import { useTecnicoQuery } from '@/api/tecnicos'
import { useAuthStore } from '@/stores/auth-store'
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

export function TecnicoPerfil() {
  const userId = useAuthStore((state) => state.auth.user?.id)
  const { data: tecnico, isLoading } = useTecnicoQuery(userId ?? '')

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
          <p className='text-muted-foreground'>Tus datos como técnico.</p>
        </div>

        {isLoading && <p className='text-muted-foreground'>Cargando…</p>}

        {tecnico && (
          <Card className='max-w-md'>
            <CardHeader>
              <CardTitle>{tecnico.nombre}</CardTitle>
              <CardDescription>{tecnico.email}</CardDescription>
            </CardHeader>
            <CardContent className='text-sm text-muted-foreground'>
              ID: {tecnico.tecnico_id}
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}
