import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  type Dispositivo,
  useDispositivosQuery,
  useEliminarDispositivoMutation,
} from '@/api/dispositivos'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { DispositivoDialog } from './components/dispositivo-dialog'
import { DispositivosTable } from './components/dispositivos-table'

export function DispositivosCliente() {
  const { data, isLoading } = useDispositivosQuery()
  const eliminar = useEliminarDispositivoMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<Dispositivo | undefined>(
    undefined
  )
  const [deleteTarget, setDeleteTarget] = useState<Dispositivo | undefined>(
    undefined
  )

  const handleCreate = () => {
    setCurrentRow(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (dispositivo: Dispositivo) => {
    setCurrentRow(dispositivo)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    eliminar
      .mutateAsync(deleteTarget.dispositivo_id)
      .then(() => {
        toast.success('Dispositivo eliminado.')
        setDeleteTarget(undefined)
      })
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
            <h2 className='text-2xl font-bold tracking-tight'>
              Mis dispositivos
            </h2>
            <p className='text-muted-foreground'>
              Registra tus dispositivos para poder crear tickets sobre ellos.
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus /> Nuevo dispositivo
          </Button>
        </div>

        <DispositivosTable
          data={data ?? []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
        />
      </Main>

      <DispositivoDialog
        // Fuerza un remount al cambiar de fila (o al pasar a "crear") — si no,
        // react-hook-form solo aplica defaultValues en el montaje inicial y el
        // form queda con los valores de la primera vez que se abrió el diálogo.
        key={currentRow?.dispositivo_id ?? 'new'}
        currentRow={currentRow}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(state) => !state && setDeleteTarget(undefined)}
        title='Eliminar dispositivo'
        desc={`¿Eliminar "${deleteTarget?.marca} ${deleteTarget?.modelo}"? Podrás seguir viendo su historial de tickets, pero no podrás crear tickets nuevos sobre él.`}
        confirmText='Eliminar'
        destructive
        isLoading={eliminar.isPending}
        handleConfirm={handleDelete}
      />
    </>
  )
}
