import { createFileRoute } from '@tanstack/react-router'
import { ClienteHome } from '@/features/cliente-home'

export const Route = createFileRoute('/_authenticated/cliente/')({
  component: ClienteHome,
})
