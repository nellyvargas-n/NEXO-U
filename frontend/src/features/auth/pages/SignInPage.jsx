import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'
import Icon from '../../../shared/components/Icon.jsx'
import { getAuthErrorMessage, signIn } from '../../../shared/api/modules/auth.service.ts'

function SignInPage() {
  const [notice, setNotice] = useState(() => (
    new URLSearchParams(window.location.search).get('registered') === '1'
      ? 'Tu cuenta está creada. Inicia sesión para continuar.'
      : ''
  ))
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      const session = await signIn({ email, password }, formData.has('remember'))
      if (session.role === 'empresa') {
        window.location.assign('/empresa/cursos/validar')
        return
      }
      const isNewRegistration = new URLSearchParams(window.location.search).get('registered') === '1'
      window.location.assign(isNewRegistration ? '/app/perfil?setup=1' : '/app')
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      pageType="login"
      eyebrow="QUÉ BUENO VERTE DE NUEVO"
      switchText="¿Aún no tienes cuenta?"
      switchLabel="Regístrate"
      switchHref="/register"
    >
      <form className="grid gap-5" onSubmit={handleSubmit} onChange={() => setError('')} aria-busy={isSubmitting}>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[#344b3c]" htmlFor="login-email">Correo electrónico</label>
          <input className="h-12 w-full rounded-xl border border-[#d8e2d7] bg-white px-4 text-base text-[#253b30] outline-none transition placeholder:text-[#94a197] focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15" id="login-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
        </div>

        <PasswordField id="login-password" autoComplete="current-password" onChange={() => setError('')} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[#617166]">
            <input className="size-4 accent-[#347a57]" type="checkbox" name="remember" />
            <span>Recordar sesión</span>
          </label>
          <a className="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-[#347a57] transition hover:bg-[#eff6ed] hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" href="/recuperar-clave">Olvidé mi contraseña</a>
        </div>

        {error && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>}
        {notice && <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm leading-5 text-[#365f43]" role="status">{notice}</p>}

        <button className="relative inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1c5a42] px-5 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] active:bg-[#174d38] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'} <Icon name="arrow-right" className="absolute right-5 size-5" />
        </button>
      </form>
    </AuthLayout>
  )
}

export default SignInPage
