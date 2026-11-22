import { useState } from 'react'
import { ApiError } from '../../shared/api/client.ts'
import { clearAccessToken } from '../../shared/api/session.ts'
import { changePassword } from '../../shared/api/modules/auth.service.ts'
import PasswordField from '../auth/components/PasswordField.jsx'
import Surface from '../student-app/components/Surface.jsx'

function getChangeError(error) {
  if (error instanceof ApiError && error.status === 400) return 'La contraseña actual es incorrecta.'
  if (error instanceof ApiError && error.status === 401) return 'Tu sesión venció. Inicia sesión nuevamente y vuelve a intentarlo.'
  if (error instanceof ApiError && error.status === 422) return 'La nueva contraseña debe tener al menos 12 caracteres y ser distinta a la actual.'
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor. Inténtalo de nuevo en unos momentos.'
  return error instanceof Error ? error.message : 'No se pudo cambiar la contraseña.'
}

function SettingsPage() {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [changed, setChanged] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const currentPassword = String(formData.get('currentPassword') ?? '')
    const newPassword = String(formData.get('newPassword') ?? '')
    const confirmation = String(formData.get('passwordConfirmation') ?? '')
    setError('')

    if (newPassword !== confirmation) {
      setError('Las contraseñas nuevas no coinciden.')
      form.elements.namedItem('passwordConfirmation')?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      await changePassword(currentPassword, newPassword)
      clearAccessToken()
      setChanged(true)
      form.reset()
    } catch (requestError) {
      setError(getChangeError(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid max-w-3xl gap-5">
      <Surface>
        <p className="m-0 text-xs font-bold tracking-[0.12em] text-[#347a57]">CUENTA</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-[#1c4033]">Preferencias de cuenta</h2>
        <p className="mt-2 text-sm leading-6 text-[#66776b]">Las preferencias visuales aún no se guardan. Tus datos académicos sí se consultan desde tu perfil.</p>
        <a className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#246b4a] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" href="/app/perfil">Ver mi perfil <span aria-hidden="true">→</span></a>
      </Surface>

      <Surface>
        <h2 className="font-display text-xl font-semibold text-[#1c4033]">Cambiar contraseña</h2>
        <p className="mt-2 text-sm leading-6 text-[#66776b]">Al cambiarla, se cerrarán las sesiones anteriores y tendrás que iniciar sesión de nuevo.</p>

        {changed ? (
          <div className="mt-5 grid gap-3">
            <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm leading-5 text-[#365f43]" role="status">Contraseña actualizada. Inicia sesión con tu nueva contraseña.</p>
            <a className="inline-flex min-h-11 items-center justify-center justify-self-start rounded-xl bg-[#1c5a42] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42]" href="/login">Iniciar sesión</a>
          </div>
        ) : (
          <form className="mt-5 grid gap-4" onSubmit={handleSubmit} onChange={() => setError('')} aria-busy={isSubmitting}>
            <PasswordField id="current-password" name="currentPassword" label="Contraseña actual" autoComplete="current-password" minLength={1} />
            <PasswordField id="new-password" name="newPassword" label="Nueva contraseña" autoComplete="new-password" minLength={12} hint="Usa al menos 12 caracteres." />
            <PasswordField id="confirm-new-password" name="passwordConfirmation" label="Confirma la nueva contraseña" autoComplete="new-password" minLength={12} />
            {error && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>}
            <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1c5a42] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </form>
        )}
      </Surface>
    </div>
  )
}

export default SettingsPage
