import axios, { type AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

httpClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// El backend usa dos formatos de error distintos ({detail} de FastAPI/HTTPException
// y {ok:false, message} del helper error() propio) — se normalizan ambos a
// response.data.title para que src/lib/handle-server-error.ts los muestre igual
// que ya hace hoy con cualquier AxiosError.
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const data: unknown = error.response.data
      let message: string | undefined

      if (data && typeof data === 'object') {
        const body = data as Record<string, unknown>
        if (typeof body.detail === 'string') {
          message = body.detail
        } else if (Array.isArray(body.detail)) {
          message = body.detail
            .map((item) =>
              item && typeof item === 'object' && 'msg' in item
                ? String((item as { msg?: unknown }).msg)
                : null
            )
            .filter(Boolean)
            .join(', ')
        } else if (body.ok === false && typeof body.message === 'string') {
          message = body.message
        }
      }

      if (message) {
        error.response.data = {
          ...(typeof data === 'object' && data ? data : {}),
          title: message,
        }
      }
    }
    return Promise.reject(error)
  }
)

/** Payload envuelto que devuelve toda respuesta exitosa del backend: {ok, message, data}. */
export interface ApiEnvelope<T> {
  ok: boolean
  message: string
  data: T
}

export async function unwrap<T>(
  request: Promise<AxiosResponse<ApiEnvelope<T>>>
): Promise<T> {
  const response = await request
  return response.data.data
}
