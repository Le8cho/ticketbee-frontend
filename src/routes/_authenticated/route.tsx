import { createFileRoute, redirect } from '@tanstack/react-router'
import { ensureAuthReady } from '@/api/auth-session'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    await ensureAuthReady()
    const { accessToken } = useAuthStore.getState().auth
    if (!accessToken) {
      throw redirect({ to: '/sign-in', search: { redirect: location.href } })
    }
  },
  component: AuthenticatedLayout,
})
