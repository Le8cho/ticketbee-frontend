import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useRechazarTicketMutation } from '@/api/tickets'
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
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  motivoRechazo: z
    .string()
    .min(10, 'El motivo debe tener al menos 10 caracteres.')
    .max(500),
})
type RechazarForm = z.infer<typeof formSchema>

type RechazarDialogProps = {
  ticketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RechazarDialog({
  ticketId,
  open,
  onOpenChange,
}: RechazarDialogProps) {
  const rechazar = useRechazarTicketMutation()
  const form = useForm<RechazarForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { motivoRechazo: '' },
  })

  const onSubmit = (values: RechazarForm) => {
    rechazar
      .mutateAsync({ ticketId, motivoRechazo: values.motivoRechazo })
      .then(() => {
        toast.success('Ticket rechazado.')
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
          <DialogTitle>Rechazar ticket</DialogTitle>
          <DialogDescription>
            Indica el motivo del rechazo. El cliente recibirá un correo con esta
            información, pero no la verá en su panel.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='rechazar-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='motivoRechazo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
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
            form='rechazar-form'
            variant='destructive'
            disabled={rechazar.isPending}
          >
            Rechazar ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
