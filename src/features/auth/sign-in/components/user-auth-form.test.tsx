import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'

const FORM_MESSAGES = {
  emailEmpty: 'Please enter your email.',
  passwordEmpty: 'Please enter your password.',
  passwordShort: 'Password must be at least 7 characters long.',
} as const

const navigate = vi.fn()
const signInWithPasswordMock = vi.fn()
const hidratarSesionMock = vi.fn()

const FAKE_SESSION = { access_token: 'token-abc' }

vi.mock('@/api/supabase-client', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) =>
        signInWithPasswordMock(...args),
      // auth-session.ts (importado sin mockear para conservar
      // PerfilNoProvisionadoError) se suscribe a esto al cargar el módulo.
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
  },
}))

vi.mock('@/api/auth-session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/auth-session')>()
  return {
    ...actual,
    hidratarSesion: (...args: unknown[]) => hidratarSesionMock(...args),
  }
})

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
    Link: ({
      children,
      to,
      className,
      ...rest
    }: {
      children?: React.ReactNode
      to: string
      className?: string
    }) => (
      <a href={to} className={className} {...rest}>
        {children}
      </a>
    ),
  }
})

describe('UserAuthForm', () => {
  describe('Rendering without redirectTo', () => {
    let screen: RenderResult
    let emailInput: Locator
    let passwordInput: Locator
    let signInButton: Locator
    let forgotPasswordLink: Locator

    beforeEach(async () => {
      vi.clearAllMocks()
      signInWithPasswordMock.mockResolvedValue({
        data: { session: FAKE_SESSION },
        error: null,
      })
      hidratarSesionMock.mockResolvedValue({
        id: 'u1',
        nombre: 'Ana',
        email: 'a@b.com',
        rol: 'cliente',
      })

      screen = await render(<UserAuthForm />)
      emailInput = screen.getByRole('textbox', { name: /^Email$/i })
      passwordInput = screen.getByLabelText(/^Password$/i)
      signInButton = screen.getByRole('button', { name: /^Sign in$/i })
      forgotPasswordLink = screen.getByText(/^Forgot password\?$/i)
    })

    it('renders fields, submit button, and forgot password link', async () => {
      await expect.element(emailInput).toBeInTheDocument()
      await expect.element(passwordInput).toBeInTheDocument()
      await expect.element(signInButton).toBeInTheDocument()
      await expect.element(forgotPasswordLink).toBeInTheDocument()
    })

    it('shows validation messages when submitting empty form', async () => {
      await userEvent.click(signInButton)

      await expect
        .element(screen.getByText(FORM_MESSAGES.emailEmpty))
        .toBeInTheDocument()
      await expect
        .element(screen.getByText(FORM_MESSAGES.passwordEmpty))
        .toBeInTheDocument()
    })

    it('authenticates and navigates according to the resolved rol', async () => {
      await userEvent.fill(emailInput, 'a@b.com')
      await userEvent.fill(passwordInput, '1234567')

      await userEvent.click(signInButton)

      await vi.waitFor(() =>
        expect(signInWithPasswordMock).toHaveBeenCalledWith({
          email: 'a@b.com',
          password: '1234567',
        })
      )
      await vi.waitFor(() =>
        expect(hidratarSesionMock).toHaveBeenCalledWith(FAKE_SESSION)
      )
      await vi.waitFor(() =>
        expect(navigate).toHaveBeenCalledWith({ to: '/cliente', replace: true })
      )
    })
  })

  it('navigates to redirectTo when provided, overriding the rol default', async () => {
    vi.clearAllMocks()
    signInWithPasswordMock.mockResolvedValue({
      data: { session: FAKE_SESSION },
      error: null,
    })
    hidratarSesionMock.mockResolvedValue({
      id: 'u1',
      nombre: 'Ana',
      email: 'a@b.com',
      rol: 'cliente',
    })

    const { getByRole, getByLabelText } = await render(
      <UserAuthForm redirectTo='/settings' />
    )

    await userEvent.fill(getByRole('textbox', { name: /Email/i }), 'a@b.com')
    await userEvent.fill(getByLabelText('Password'), '1234567')

    await userEvent.click(getByRole('button', { name: /Sign in/i }))

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/settings',
        replace: true,
      })
    )
  })

  it('shows an error toast and does not navigate on invalid credentials', async () => {
    vi.clearAllMocks()
    signInWithPasswordMock.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    })

    const { getByRole, getByLabelText } = await render(<UserAuthForm />)

    await userEvent.fill(getByRole('textbox', { name: /Email/i }), 'a@b.com')
    await userEvent.fill(getByLabelText('Password'), 'wrongpass')
    await userEvent.click(getByRole('button', { name: /Sign in/i }))

    await vi.waitFor(() =>
      expect(signInWithPasswordMock).toHaveBeenCalledOnce()
    )
    expect(hidratarSesionMock).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
