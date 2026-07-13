import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { SignUpForm } from './sign-up-form'

const FORM_MESSAGES = {
  fullNameEmpty: 'Please enter your full name.',
  districtEmpty: 'Please enter your district.',
  emailEmpty: 'Please enter your email.',
  passwordEmpty: 'Please enter your password.',
  confirmPasswordEmpty: 'Please confirm your password.',
  passwordMismatch: "Passwords don't match.",
} as const

const navigate = vi.fn()
const signUpMock = vi.fn()
const hidratarSesionMock = vi.fn()

vi.mock('@/api/supabase-client', () => ({
  supabase: { auth: { signUp: (...args: unknown[]) => signUpMock(...args) } },
}))

vi.mock('@/api/auth-session', () => ({
  hidratarSesion: (...args: unknown[]) => hidratarSesionMock(...args),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => navigate }
})

async function fillValidForm(screen: RenderResult) {
  await userEvent.fill(
    screen.getByRole('textbox', { name: /^Full Name$/i }),
    'Juan Pérez'
  )
  await userEvent.fill(
    screen.getByRole('textbox', { name: /^District$/i }),
    'Miraflores'
  )
  await userEvent.fill(
    screen.getByRole('textbox', { name: /^Email$/i }),
    'a@b.com'
  )
  await userEvent.fill(screen.getByLabelText(/^Password$/i), '1234567')
  await userEvent.fill(screen.getByLabelText(/^Confirm Password$/i), '1234567')
}

describe('SignUpForm', () => {
  let screen: RenderResult
  let submitButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()
    screen = await render(<SignUpForm />)
    submitButton = screen.getByRole('button', { name: /^Create Account$/i })
  })

  it('renders all fields and submit button', async () => {
    await expect
      .element(screen.getByRole('textbox', { name: /^Full Name$/i }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('textbox', { name: /^District$/i }))
      .toBeInTheDocument()
    await expect
      .element(screen.getByRole('textbox', { name: /^Email$/i }))
      .toBeInTheDocument()
    await expect.element(submitButton).toBeInTheDocument()
  })

  it('shows validation messages when submitting empty form', async () => {
    await userEvent.click(submitButton)

    await expect
      .element(screen.getByText(FORM_MESSAGES.fullNameEmpty))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(FORM_MESSAGES.districtEmpty))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(FORM_MESSAGES.emailEmpty))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(FORM_MESSAGES.passwordEmpty))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(FORM_MESSAGES.confirmPasswordEmpty))
      .toBeInTheDocument()
  })

  it('shows a mismatch error when passwords do not match', async () => {
    await fillValidForm(screen)
    await userEvent.fill(
      screen.getByLabelText(/^Confirm Password$/i),
      '7654321'
    )

    await userEvent.click(submitButton)
    await expect
      .element(screen.getByText(FORM_MESSAGES.passwordMismatch))
      .toBeInTheDocument()
    expect(signUpMock).not.toHaveBeenCalled()
  })

  it('signs up with rol=cliente metadata and navigates to sign-in when email confirmation is pending', async () => {
    signUpMock.mockResolvedValue({ data: { session: null }, error: null })

    await fillValidForm(screen)
    await userEvent.click(submitButton)

    await vi.waitFor(() =>
      expect(signUpMock).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: '1234567',
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            rol: 'cliente',
            nombre: 'Juan Pérez',
            distrito: 'Miraflores',
          },
        },
      })
    )
    expect(hidratarSesionMock).not.toHaveBeenCalled()
    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/sign-in' })
    )
  })

  it('hydrates and navigates straight to /cliente when a session comes back immediately', async () => {
    const fakeSession = { access_token: 'token-abc' }
    signUpMock.mockResolvedValue({
      data: { session: fakeSession },
      error: null,
    })
    hidratarSesionMock.mockResolvedValue({
      id: 'u1',
      nombre: 'Juan Pérez',
      email: 'a@b.com',
      rol: 'cliente',
    })

    await fillValidForm(screen)
    await userEvent.click(submitButton)

    await vi.waitFor(() =>
      expect(hidratarSesionMock).toHaveBeenCalledWith(fakeSession)
    )
    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/cliente', replace: true })
    )
  })
})
