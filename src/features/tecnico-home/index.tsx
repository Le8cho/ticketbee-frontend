import { useAuthStore } from '@/stores/auth-store'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

export function TecnicoHome() {
  const nombre = useAuthStore((state) => state.auth.user?.nombre)

  return (
    <>
      <Header>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <h1 className='text-2xl font-bold tracking-tight'>Welcome, {nombre}</h1>
        <p className='mt-2 text-muted-foreground'>
          Technician panel — clientes, dispositivos, tickets, and catálogo are
          added in the next phase.
        </p>
      </Main>
    </>
  )
}
