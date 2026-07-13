import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/cliente')({
  beforeLoad: () => {
    const rol = useAuthStore.getState().auth.user?.rol
    if (rol !== 'cliente') {
      throw redirect({ to: '/403' })
    }
  },
  component: Outlet,
})
