import { createFileRoute } from '@tanstack/react-router'
import { TecnicoPerfil } from '@/features/tecnico-perfil'

export const Route = createFileRoute('/_authenticated/tecnico/perfil/')({
  component: TecnicoPerfil,
})
