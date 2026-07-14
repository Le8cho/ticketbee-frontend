import { initMercadoPago } from '@mercadopago/sdk-react'

initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY, { locale: 'es-PE' })
