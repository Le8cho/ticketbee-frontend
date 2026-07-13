import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRegistrarGarantiaMutation } from '@/api/tickets'
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

const today = new Date().toISOString().slice(0, 10)

const formSchema = z
  .object({
    fechaInicio: z.string().min(1, 'Requerido.'),
    fechaVencimiento: z.string().min(1, 'Requerido.'),
  })
  .refine((data) => data.fechaVencimiento > data.fechaInicio, {
    message: 'Debe ser posterior a la fecha de inicio.',
    path: ['fechaVencimiento'],
  })
type GarantiaForm = z.infer<typeof formSchema>

type GarantiaDialogProps = {
  ticketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GarantiaDialog({
  ticketId,
  open,
  onOpenChange,
}: GarantiaDialogProps) {
  const registrar = useRegistrarGarantiaMutation()
  const form = useForm<GarantiaForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { fechaInicio: today, fechaVencimiento: '' },
  })

  const onSubmit = (values: GarantiaForm) => {
    registrar
      .mutateAsync({
        ticketId,
        body: {
          fecha_inicio: new Date(values.fechaInicio).toISOString(),
          fecha_vencimiento: new Date(values.fechaVencimiento).toISOString(),
        },
      })
      .then(() => {
        toast.success('Garantía registrada.')
        form.reset()
        onOpenChange(false)
      })
      .catch(handleServerError)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>Registrar garantía</DialogTitle>
          <DialogDescription>
            Si el ticket ya tiene una garantía registrada, esto no la modifica.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='garantia-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='fechaInicio'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de inicio</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='fechaVencimiento'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de vencimiento</FormLabel>
                  <FormControl>
                    <Input type='date' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='garantia-form'
            disabled={registrar.isPending}
          >
            Registrar garantía
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
