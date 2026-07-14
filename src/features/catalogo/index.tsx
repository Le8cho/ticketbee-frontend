import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  type Servicio,
  useActualizarServicioMutation,
  useServiciosQuery,
} from '@/api/catalogo'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { CatalogoTable } from './components/catalogo-table'
import { ServicioDialog } from './components/servicio-dialog'

export function Catalogo() {
  const { data, isLoading } = useServiciosQuery()
  const actualizar = useActualizarServicioMutation()

  const [open, setOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<Servicio | undefined>(undefined)

  const handleEdit = (servicio: Servicio) => {
    setCurrentRow(servicio)
    setOpen(true)
  }

  const handleCreate = () => {
    setCurrentRow(undefined)
    setOpen(true)
  }

  const handleToggleActivo = (servicio: Servicio) => {
    actualizar
      .mutateAsync({
        servicioId: servicio.servicio_id,
        body: { activo: !servicio.activo },
      })
      .then(() =>
        toast.success(
          servicio.activo ? 'Servicio desactivado.' : 'Servicio activado.'
        )
      )
      .catch(handleServerError)
  }

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Catálogo</h2>
            <p className='text-muted-foreground'>
              Servicios que los clientes pueden elegir al crear un ticket.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus /> Nuevo servicio
          </Button>
        </div>

        <CatalogoTable
          data={data ?? []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onToggleActivo={handleToggleActivo}
        />
      </Main>

      <ServicioDialog
        // Fuerza un remount al cambiar de fila (o al pasar a "crear") — si no,
        // react-hook-form solo aplica defaultValues en el montaje inicial y el
        // form queda con los valores de la primera vez que se abrió el diálogo.
        key={currentRow?.servicio_id ?? 'new'}
        currentRow={currentRow}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
