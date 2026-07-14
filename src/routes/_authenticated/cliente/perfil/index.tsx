import { createFileRoute } from '@tanstack/react-router'
import { ClientePerfil } from '@/features/cliente-perfil'

export const Route = createFileRoute('/_authenticated/cliente/perfil/')({
  component: ClientePerfil,
})
