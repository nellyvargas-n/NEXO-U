import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'
import Icon from '../../../shared/components/Icon.jsx'

function SignInPage() {
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setNotice('La vista previa está lista. Tus datos no se envían ni se guardan.')
  }

  function handleForgotPassword() {
    setNotice('La recuperación de contraseña estará disponible al conectar el servicio de acceso.')
  }

  return (
    <AuthLayout
      pageType="login"
      eyebrow="QUÉ BUENO VERTE DE NUEVO"
      switchText="¿Aún no tienes cuenta?"
      switchLabel="Regístrate"
      switchHref="/register"
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[#344b3c]" htmlFor="login-email">Correo electrónico</label>
          <input className="h-12 w-full rounded-xl border border-[#d8e2d7] bg-white px-4 text-base text-[#253b30] outline-none transition placeholder:text-[#94a197] focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15" id="login-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
        </div>

        <PasswordField id="login-password" autoComplete="current-password" />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[#617166]">
            <input className="size-4 accent-[#347a57]" type="checkbox" name="remember" />
            <span>Recordar sesión</span>
          </label>
          <button className="min-h-11 rounded-lg px-2 text-sm font-semibold text-[#347a57] transition hover:bg-[#eff6ed] hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" type="button" onClick={handleForgotPassword}>Olvidé mi contraseña</button>
        </div>

        {notice && <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm leading-5 text-[#365f43]" role="status">{notice}</p>}

        <button className="inline-flex min-h-12 w-full items-center justify-between rounded-xl bg-[#1c5a42] px-5 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#247452] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] active:translate-y-0" type="submit">
          Iniciar sesión <Icon name="arrow-right" className="size-5" />
        </button>
        <p className="m-0 text-center text-sm leading-5 text-[#718075]">Vista previa: este formulario todavía no se conecta a una cuenta.</p>
      </form>
    </AuthLayout>
  )
}

export default SignInPage
