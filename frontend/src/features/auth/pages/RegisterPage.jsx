import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'
import Icon from '../../../shared/components/Icon.jsx'
import { getAuthErrorMessage, registerAccount } from '../../../shared/api/modules/auth.service.ts'
import { saveOnboardingDraft } from '../../profile/onboardingDraft.ts'

const passwordMismatchMessage = 'Las contraseñas no coinciden.'

function RegisterPage() {
  const [role, setRole] = useState('usuario')
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handlePasswordChange(event) {
    setError('')
    if (!passwordError) return

    const form = event.currentTarget.form
    const password = form?.elements.namedItem('password')
    const confirmation = form?.elements.namedItem('passwordConfirmation')
    if (password && confirmation) {
      setPasswordError(password.value === confirmation.value ? '' : passwordMismatchMessage)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')
    const passwordConfirmation = String(formData.get('passwordConfirmation') ?? '')
    const fullName = String(formData.get('fullName') ?? '').trim()
    const studentType = formData.get('studentType')
    setError('')

    if (password !== passwordConfirmation) {
      setPasswordError(passwordMismatchMessage)
      form.elements.namedItem('passwordConfirmation')?.focus()
      return
    }

    setPasswordError('')
    setIsSubmitting(true)

    try {
      await registerAccount({ email, password }, role)
      if (role === 'usuario' && (studentType === 'school' || studentType === 'university')) {
        saveOnboardingDraft({ fullName, studentType })
      }
      window.location.assign(`/login?registered=1&role=${role}`)
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      pageType="register"
      eyebrow="EMPIEZA CON TU PERFIL"
      switchText="¿Ya tienes una cuenta?"
      switchLabel="Inicia sesión"
      switchHref="/login"
    >
      <form className="grid gap-5" onSubmit={handleSubmit} onChange={() => setError('')} aria-busy={isSubmitting}>
        <fieldset className="m-0 grid gap-3 border-0 p-0">
          <legend className="mb-1 text-sm font-semibold text-[#344b3c]">¿Cómo utilizarás NEXO U?</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="cursor-pointer rounded-xl border border-[#d8e2d7] bg-white px-4 py-3 text-sm has-[:checked]:border-[#438c61] has-[:checked]:bg-[#eff7ef]">
              <input type="radio" name="role" value="usuario" checked={role === 'usuario'} onChange={() => setRole('usuario')} className="mr-2 accent-[#347a57]" />
              <strong>Estudiante</strong><span className="mt-1 block text-xs text-[#6a7b6f]">Buscar becas, pasantías y cursos</span>
            </label>
            <label className="cursor-pointer rounded-xl border border-[#d8e2d7] bg-white px-4 py-3 text-sm has-[:checked]:border-[#438c61] has-[:checked]:bg-[#eff7ef]">
              <input type="radio" name="role" value="empresa" checked={role === 'empresa'} onChange={() => setRole('empresa')} className="mr-2 accent-[#347a57]" />
              <strong>Empresa / institución</strong><span className="mt-1 block text-xs text-[#6a7b6f]">Publicar convocatorias y cursos</span>
            </label>
          </div>
        </fieldset>

        {role === 'usuario' ? (
          <fieldset className="m-0 grid gap-3 border-0 p-0">
            <legend className="mb-1 text-sm font-semibold text-[#344b3c]">¿Dónde estudias actualmente?</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#d8e2d7] bg-white p-3 text-sm has-[:checked]:border-[#438c61] has-[:checked]:bg-[#eff7ef]">
                <input type="radio" name="studentType" value="school" className="accent-[#347a57]" required={role === 'usuario'} /> En el colegio
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#d8e2d7] bg-white p-3 text-sm has-[:checked]:border-[#438c61] has-[:checked]:bg-[#eff7ef]">
                <input type="radio" name="studentType" value="university" className="accent-[#347a57]" required={role === 'usuario'} /> En la universidad
              </label>
            </div>
          </fieldset>
        ) : (
          <p className="rounded-xl border border-[#d9e7d7] bg-[#f3f8ef] px-4 py-3 text-sm leading-6 text-[#486753]">
            Primero creas una cuenta institucional. Al iniciar sesión podrás registrar tu organización, que deberá ser verificada por un administrador antes de publicar.
          </p>
        )}

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[#344b3c]" htmlFor="register-name">Nombre completo</label>
          <input className="h-12 w-full rounded-xl border border-[#d8e2d7] bg-white px-4 text-base text-[#253b30] outline-none transition placeholder:text-[#94a197] focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15" id="register-name" name="fullName" type="text" autoComplete="name" placeholder="Tu nombre y apellido" required />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[#344b3c]" htmlFor="register-email">Correo electrónico</label>
          <input className="h-12 w-full rounded-xl border border-[#d8e2d7] bg-white px-4 text-base text-[#253b30] outline-none transition placeholder:text-[#94a197] focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15" id="register-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
        </div>

        <PasswordField id="register-password" label="Crea una contraseña" autoComplete="new-password" minLength={10} hint="Usa al menos 10 caracteres." onChange={handlePasswordChange} />
        <PasswordField id="register-password-confirmation" label="Confirma tu contraseña" name="passwordConfirmation" autoComplete="new-password" minLength={10} error={passwordError} onChange={handlePasswordChange} />

        {error && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>}

        <button className="relative inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1c5a42] px-5 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] active:bg-[#174d38] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear mi cuenta'} <Icon name="arrow-right" className="absolute right-5 size-5" />
        </button>
        <p className="-mt-2 text-xs leading-5 text-[#718075]">{role === 'usuario' ? 'Después de iniciar sesión, completarás tu perfil académico.' : 'Un administrador verificará tu institución antes de habilitar publicaciones.'}</p>
      </form>
    </AuthLayout>
  )
}

export default RegisterPage
