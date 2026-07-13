import { useRef } from 'react'
import { format } from 'date-fns'
import { Loader2, Paperclip, Upload } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAdjuntosQuery,
  useObtenerUrlAdjuntoMutation,
  useSubirAdjuntoMutation,
} from '@/api/adjuntos'
import { handleServerError } from '@/lib/handle-server-error'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const MAX_BYTES = 10 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type AdjuntosSectionProps = {
  ticketId: string
  puedeSubir: boolean
}

export function AdjuntosSection({
  ticketId,
  puedeSubir,
}: AdjuntosSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: adjuntos, isLoading } = useAdjuntosQuery(ticketId)
  const subir = useSubirAdjuntoMutation(ticketId)
  const obtenerUrl = useObtenerUrlAdjuntoMutation()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_BYTES) {
      toast.error('El archivo supera el límite de 10 MB.')
      return
    }
    subir
      .mutateAsync(file)
      .then(() => toast.success('Adjunto subido.'))
      .catch(handleServerError)
  }

  const handleVer = (adjuntoId: string) => {
    obtenerUrl
      .mutateAsync(adjuntoId)
      .then(({ url }) => window.open(url, '_blank', 'noopener,noreferrer'))
      .catch(handleServerError)
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <CardTitle className='text-base'>Adjuntos</CardTitle>
          <CardDescription>
            Fotos y comprobantes del ticket (máx. 10 MB).
          </CardDescription>
        </div>
        {puedeSubir && (
          <>
            <input
              ref={inputRef}
              type='file'
              className='hidden'
              accept='image/jpeg,image/png,image/webp,application/pdf,.doc,.docx'
              onChange={handleFileChange}
            />
            <Button
              size='sm'
              variant='outline'
              disabled={subir.isPending}
              onClick={() => inputRef.current?.click()}
            >
              {subir.isPending ? (
                <Loader2 className='animate-spin' />
              ) : (
                <Upload />
              )}
              Subir
            </Button>
          </>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className='text-sm text-muted-foreground'>Cargando…</p>
        )}
        {!isLoading && adjuntos?.length === 0 && (
          <p className='text-sm text-muted-foreground'>Sin adjuntos.</p>
        )}
        <div className='flex flex-col gap-2'>
          {adjuntos?.map((adjunto) => (
            <div
              key={adjunto.adjunto_id}
              className='flex items-center justify-between gap-2 text-sm'
            >
              <div className='flex min-w-0 items-center gap-2'>
                <Paperclip className='size-4 shrink-0 text-muted-foreground' />
                <span className='truncate'>{adjunto.nombre}</span>
                <span className='shrink-0 text-muted-foreground'>
                  {formatBytes(adjunto.tamanio_bytes)} ·{' '}
                  {format(new Date(adjunto.subido_en), 'dd/MM/yyyy')}
                </span>
              </div>
              <Button
                size='sm'
                variant='ghost'
                disabled={obtenerUrl.isPending}
                onClick={() => handleVer(adjunto.adjunto_id)}
              >
                Ver
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
