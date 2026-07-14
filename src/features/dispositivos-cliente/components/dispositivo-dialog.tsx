import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  type Dispositivo,
  useActualizarDispositivoMutation,
  useRegistrarDispositivoMutation,
  useSubirFotoDispositivoMutation,
  useTiposDispositivoQuery,
} from '@/api/dispositivos'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MAX_FOTO_BYTES = 5 * 1024 * 1024

const formSchema = z.object({
  tipo_dispositivo_id: z.number({ error: 'Selecciona un tipo.' }),
  marca: z.string().min(1, 'La marca es obligatoria.').max(80),
  modelo: z.string().min(1, 'El modelo es obligatorio.').max(120),
  numero_serie: z.string().max(100).optional(),
  foto: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].size <= MAX_FOTO_BYTES,
      'La imagen supera el límite de 5 MB.'
    ),
})
type DispositivoForm = z.infer<typeof formSchema>

type DispositivoDialogProps = {
  currentRow?: Dispositivo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DispositivoDialog({
  currentRow,
  open,
  onOpenChange,
}: DispositivoDialogProps) {
  const isEdit = !!currentRow
  const { data: tipos } = useTiposDispositivoQuery()
  const registrar = useRegistrarDispositivoMutation()
  const actualizar = useActualizarDispositivoMutation()
  const subirFoto = useSubirFotoDispositivoMutation()
  const [preview, setPreview] = useState<string | null>(null)

  const form = useForm<DispositivoForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow
      ? {
          tipo_dispositivo_id: currentRow.tipo_dispositivo_id,
          marca: currentRow.marca,
          modelo: currentRow.modelo,
          numero_serie: currentRow.numero_serie ?? '',
        }
      : {
          tipo_dispositivo_id: undefined,
          marca: '',
          modelo: '',
          numero_serie: '',
        },
  })

  const isPending =
    registrar.isPending || actualizar.isPending || subirFoto.isPending

  const handleFotoChange = (files: FileList | null) => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(files && files.length > 0 ? URL.createObjectURL(files[0]) : null)
  }

  const resetForm = () => {
    form.reset()
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }

  const onSubmit = async (values: DispositivoForm) => {
    try {
      const foto = values.foto?.[0]
      if (isEdit) {
        await actualizar.mutateAsync({
          dispositivoId: currentRow.dispositivo_id,
          body: {
            marca: values.marca,
            modelo: values.modelo,
            numero_serie: values.numero_serie || null,
          },
        })
        if (foto) {
          await subirFoto.mutateAsync({
            dispositivoId: currentRow.dispositivo_id,
            foto,
          })
        }
        toast.success('Dispositivo actualizado.')
      } else {
        const creado = await registrar.mutateAsync({
          tipo_dispositivo_id: values.tipo_dispositivo_id,
          marca: values.marca,
          modelo: values.modelo,
          numero_serie: values.numero_serie || null,
        })
        if (foto) {
          await subirFoto.mutateAsync({
            dispositivoId: creado.dispositivo_id,
            foto,
          })
        }
        toast.success('Dispositivo registrado.')
      }
      resetForm()
      onOpenChange(false)
    } catch (err) {
      handleServerError(err)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        resetForm()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Editar dispositivo' : 'Nuevo dispositivo'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza los datos de tu dispositivo.'
              : 'Registra un dispositivo para poder crear tickets sobre él.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='dispositivo-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            {!isEdit && (
              <FormField
                control={form.control}
                name='tipo_dispositivo_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Selecciona un tipo' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tipos?.map((tipo) => (
                          <SelectItem
                            key={tipo.tipo_dispositivo_id}
                            value={tipo.tipo_dispositivo_id.toString()}
                          >
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name='marca'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <FormControl>
                    <Input placeholder='HP' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='modelo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder='Pavilion 15' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='numero_serie'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° de serie (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='foto'
              render={({ field: { onChange, value: _value, ...field } }) => (
                <FormItem>
                  <FormLabel>Foto (opcional, máx. 5 MB)</FormLabel>
                  <FormControl>
                    <Input
                      type='file'
                      accept='image/jpeg,image/png,image/webp'
                      {...field}
                      onChange={(e) => {
                        onChange(e.target.files)
                        handleFotoChange(e.target.files)
                      }}
                    />
                  </FormControl>
                  {preview && (
                    <img
                      src={preview}
                      alt='Vista previa'
                      className='mt-2 h-24 w-24 rounded-md object-cover'
                    />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='dispositivo-form' disabled={isPending}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
