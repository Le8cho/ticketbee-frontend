import { createFileRoute } from '@tanstack/react-router'
import { TecnicoHome } from '@/features/tecnico-home'

export const Route = createFileRoute('/_authenticated/tecnico/')({
  component: TecnicoHome,
})
