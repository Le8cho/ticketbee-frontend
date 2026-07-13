import { createFileRoute } from '@tanstack/react-router'
import { Catalogo } from '@/features/catalogo'

export const Route = createFileRoute('/_authenticated/tecnico/catalogo/')({
  component: Catalogo,
})
