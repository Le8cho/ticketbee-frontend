import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/tecnico')({
  beforeLoad: () => {
    const rol = useAuthStore.getState().auth.user?.rol
    if (rol !== 'tecnico') {
      throw redirect({ to: '/403' })
    }
  },
  component: Outlet,
})
