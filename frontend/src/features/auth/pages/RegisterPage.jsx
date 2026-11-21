import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'
import Icon from '../../../shared/components/Icon.jsx'

const passwordMismatchMessage = 'Las contraseñas no coinciden.'

function RegisterPage() {
  const [notice, setNotice] = useState('')
  const [passwordError, setPasswordError] = useState('')

  function handlePasswordChange(event) {
    setNotice('')
    if (!passwordError) return

    const form = event.currentTarget.form
    const password = form?.elements.namedItem('password')
    const confirmation = form?.elements.namedItem('passwordConfirmation')
    if (password && confirmation) {
      setPasswordError(password.value === confirmation.value ? '' : passwordMismatchMessage)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const password = formData.get('password')
    const passwordConfirmation = formData.get('passwordConfirmation')
    setNotice('')

    if (password !== passwordConfirmation) {
      setPasswordError(passwordMismatchMessage)
      form.elements.namedItem('passwordConfirmation')?.focus()
      return
    }

    setPasswordError('')
    setNotice('La vista previa está lista. Tus datos no se envían ni se guardan.')
  }

  return (
    <AuthLayout
      pageType="register"
      eyebrow="EMPIEZA CON TU PERFIL"
      switchText="¿Ya tienes una cuenta?"
      switchLabel="Inicia sesión"
      switchHref="/login"
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <fieldset className="m-0 grid gap-3 border-0 p-0">
          <legend className="mb-1 text-sm font-semibold text-[#344b3c]">¿Dónde estudias actualmente?</legend>
          <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
            <label className="relative cursor-pointer">
              <input className="peer sr-only" type="radio" name="studentType" value="school" required />
              <span className="flex min-h-12 items-center gap-2 rounded-xl border border-[#d8e2d7] bg-white px-3 py-2 text-sm text-[#526357] transition peer-checked:border-[#438c61] peer-checked:bg-[#eff7ef] peer-checked:text-[#235a3d] peer-checked:ring-2 peer-checked:ring-[#438c61]/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#438c61] hover:border-[#a9c8ad] max-[390px]:gap-1 max-[390px]:px-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eff6ed] text-[#347a57]"><Icon name="book-open" className="size-4" /></span>
                <strong className="font-semibold">En el colegio</strong>
              </span>
            </label>
            <label className="relative cursor-pointer">
              <input className="peer sr-only" type="radio" name="studentType" value="university" required />
              <span className="flex min-h-12 items-center gap-2 rounded-xl border border-[#d8e2d7] bg-white px-3 py-2 text-sm text-[#526357] transition peer-checked:border-[#438c61] peer-checked:bg-[#eff7ef] peer-checked:text-[#235a3d] peer-checked:ring-2 peer-checked:ring-[#438c61]/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#438c61] hover:border-[#a9c8ad] max-[390px]:gap-1 max-[390px]:px-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eff6ed] text-[#347a57]"><Icon name="building" className="size-4" /></span>
                <strong className="font-semibold">En la universidad</strong>
              </span>
            </label>
          </div>
        </fieldset>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[#344b3c]" htmlFor="register-name">Nombre completo</label>
          <input className="h-12 w-full rounded-xl border border-[#d8e2d7] bg-white px-4 text-base text-[#253b30] outline-none transition placeholder:text-[#94a197] focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15" id="register-name" name="fullName" type="text" autoComplete="name" placeholder="Tu nombre y apellido" required />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[#344b3c]" htmlFor="register-email">Correo electrónico</label>
          <input className="h-12 w-full rounded-xl border border-[#d8e2d7] bg-white px-4 text-base text-[#253b30] outline-none transition placeholder:text-[#94a197] focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15" id="register-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
        </div>

        <PasswordField id="register-password" label="Crea una contraseña" autoComplete="new-password" minLength={8} hint="Usa al menos 8 caracteres." onChange={handlePasswordChange} />
        <PasswordField id="register-password-confirmation" label="Confirma tu contraseña" name="passwordConfirmation" autoComplete="new-password" minLength={8} error={passwordError} onChange={handlePasswordChange} />

        {notice && <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm leading-5 text-[#365f43]" role="status">{notice}</p>}

        <button className="inline-flex min-h-12 w-full items-center justify-between rounded-xl bg-[#1c5a42] px-5 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#247452] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] active:translate-y-0" type="submit">
          Crear mi cuenta <Icon name="arrow-right" className="size-5" />
        </button>
        <p className="m-0 text-center text-sm leading-5 text-[#718075]">Vista previa: este formulario todavía no crea una cuenta.</p>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
