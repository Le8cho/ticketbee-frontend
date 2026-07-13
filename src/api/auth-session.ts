import axios from 'axios'
import type { Session } from '@supabase/supabase-js'
import { useAuthStore, type AuthUser } from '@/stores/auth-store'
import { obtenerMe } from './auth'
import { registrarCliente } from './clientes'
import { supabase } from './supabase-client'

/**
 * Se lanza cuando /auth/me devuelve 404 para un usuario que NO es cliente
 * (ej. un técnico sin fila todavía en owner.tecnico). El autoregistro
 * (POST /clientes/registro) es solo para clientes — para cualquier otro rol
 * un 404 significa que falta aprovisionar manualmente, no algo que la app
 * pueda arreglar sola.
 */
export class PerfilNoProvisionadoError extends Error {
  constructor(public readonly rol: string) {
    super(
      `Your account (role: ${rol || 'unknown'}) hasn't been set up in the system yet. Contact an administrator.`
    )
    this.name = 'PerfilNoProvisionadoError'
  }
}

/**
 * Trae el perfil desde el backend (fuente de verdad, combina Supabase + Azure SQL).
 * Si el usuario es cliente y todavía no tiene fila en Azure SQL (404), lo
 * autoregistra (idempotente, Fase 0.3) y reintenta una sola vez. No hay
 * huevo-y-gallina: get_current_user del backend solo valida el JWT de
 * Supabase, nunca exige que la fila ya exista. Para cualquier otro rol, un
 * 404 no se autorresuelve (ver PerfilNoProvisionadoError).
 */
async function obtenerPerfilConAutoRegistro(
  session: Session
): Promise<AuthUser> {
  const rolDeclarado = session.user.user_metadata?.rol as string | undefined

  try {
    const perfil = await obtenerMe()
    return {
      id: perfil.id,
      nombre: perfil.nombre,
      email: perfil.email,
      rol: perfil.rol,
    }
  } catch (err) {
    const esNotFound = axios.isAxiosError(err) && err.response?.status === 404
    if (esNotFound && rolDeclarado === 'cliente') {
      await registrarCliente()
      const perfil = await obtenerMe()
      return {
        id: perfil.id,
        nombre: perfil.nombre,
        email: perfil.email,
        rol: perfil.rol,
      }
    }
    if (esNotFound) {
      throw new PerfilNoProvisionadoError(rolDeclarado ?? '')
    }
    throw err
  }
}

let hidratacionEnCurso: Promise<AuthUser> | null = null

/**
 * Hidrata el store a partir de una sesión de Supabase ya establecida. Devuelve
 * el perfil resuelto.
 *
 * Se llama desde dos lugares que pueden disparar casi al mismo tiempo: el
 * submit del form de sign-in/sign-up (explícito) y el listener global de
 * onAuthStateChange (automático, dispara solo con el evento SIGNED_IN de
 * Supabase). Sin deduplicar, corrían dos hidrataciones en paralelo — si una
 * fallaba, su catch limpiaba el store justo después de que la otra ya había
 * dejado al usuario logueado y navegado, produciendo un crash intermitente
 * (AppSidebar con user=null) seguido de un rebote a /sign-in. Ahora todas las
 * llamadas concurrentes comparten la misma promesa.
 */
export async function hidratarSesion(session: Session): Promise<AuthUser> {
  if (hidratacionEnCurso) return hidratacionEnCurso

  hidratacionEnCurso = (async () => {
    // El interceptor de httpClient arma el header Authorization leyendo
    // accessToken del store — hay que setearlo ANTES de llamar a /auth/me, si
    // no la primera request sale sin token y el backend responde 401.
    useAuthStore.setState((state) => ({
      auth: { ...state.auth, accessToken: session.access_token },
    }))
    const perfil = await obtenerPerfilConAutoRegistro(session)
    useAuthStore.getState().auth.setSession(session.access_token, perfil)
    return perfil
  })()

  try {
    return await hidratacionEnCurso
  } finally {
    hidratacionEnCurso = null
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
  useAuthStore.getState().auth.clear()
}

let resolveReady: (() => void) | null = null
let readyHandled = false
const readyPromise = new Promise<void>((resolve) => {
  resolveReady = resolve
})

function settleReady() {
  if (!readyHandled) {
    readyHandled = true
    resolveReady?.()
  }
}

// Se registra una sola vez al importar este módulo (ver import eager en
// main.tsx). Supabase siempre entrega un evento INITIAL_SESSION como primer
// callback — de ahí sale ensureAuthReady() para que los route guards esperen
// antes de leer el store.
supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    useAuthStore.getState().auth.clear()
    settleReady()
    return
  }
  hidratarSesion(session)
    .catch((err: unknown) => {
      // eslint-disable-next-line no-console
      console.error('No se pudo hidratar la sesión de Supabase', err)
      useAuthStore.getState().auth.clear()
    })
    .finally(settleReady)
})

/** Los route guards deben esperar esto antes de leer accessToken/rol del store. */
export function ensureAuthReady(): Promise<void> {
  return readyPromise
}
