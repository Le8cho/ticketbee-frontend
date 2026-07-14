import { createFileRoute } from '@tanstack/react-router'
import { DispositivosCliente } from '@/features/dispositivos-cliente'

export const Route = createFileRoute('/_authenticated/cliente/dispositivos/')({
  component: DispositivosCliente,
})
