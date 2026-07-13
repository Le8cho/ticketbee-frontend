import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importAuthStore() {
  const { useAuthStore } = await import('./auth-store')
  return useAuthStore
}

const sampleUser = {
  id: 'u1',
  nombre: 'Ana',
  email: 'user@example.com',
  rol: 'cliente' as const,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('starts empty and not hydrated', async () => {
    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.isHydrated).toBe(false)
  })

  it('setSession stores the token, the user, and flips isHydrated', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setSession('token-1', sampleUser)

    expect(useAuthStore.getState().auth.accessToken).toBe('token-1')
    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)
    expect(useAuthStore.getState().auth.isHydrated).toBe(true)
  })

  it('clear resets token and user but keeps isHydrated true', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setSession('token-1', sampleUser)

    useAuthStore.getState().auth.clear()

    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.isHydrated).toBe(true)
  })
})
