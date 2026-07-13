import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/')({
  beforeLoad: () => {
    const rol = useAuthStore.getState().auth.user?.rol
    if (rol === 'tecnico') throw redirect({ to: '/tecnico' })
    if (rol === 'cliente') throw redirect({ to: '/cliente' })
    throw redirect({ to: '/403' })
  },
})
