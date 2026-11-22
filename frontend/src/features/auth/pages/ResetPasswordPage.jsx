import { useState } from 'react'
import { ApiError } from '../../../shared/api/client.ts'
import { clearAccessToken } from '../../../shared/api/session.ts'
import { confirmPasswordReset } from '../../../shared/api/modules/auth.service.ts'
import AuthLayout from '../components/AuthLayout.jsx'
import PasswordField from '../components/PasswordField.jsx'

function getResetError(error) {
  if (error instanceof ApiError && error.status === 400) return 'Este enlace es inválido, ya se utilizó o venció. Solicita uno nuevo.'
  if (error instanceof ApiError && error.status === 422) return 'Elige una contraseña diferente a la anterior.'
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor. Inténtalo de nuevo en unos momentos.'
  return error instanceof Error ? error.message : 'No se pudo restablecer la contraseña.'
}

function ResetPasswordPage() {
  const token = new URLSearchParams(window.location.search).get('token') ?? ''
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const newPassword = String(formData.get('newPassword') ?? '')
    const confirmation = String(formData.get('passwordConfirmation') ?? '')
    setError('')

    if (newPassword !== confirmation) {
      setError('Las contraseñas no coinciden.')
      form.elements.namedItem('passwordConfirmation')?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      await confirmPasswordReset(token, newPassword)
      clearAccessToken()
      setSuccess(true)
    } catch (requestError) {
      setError(getResetError(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      pageType="login"
      eyebrow="NUEVA CONTRASEÑA"
      title="Restablece tu acceso"
      description="Elige una contraseña segura de al menos 12 caracteres."
      switchText="¿Ya tienes tu contraseña?"
      switchLabel="Inicia sesión"
      switchHref="/login"
    >
      {!token ? (
        <div className="grid gap-4">
          <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">El enlace no incluye un token de recuperación.</p>
          <a className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1c5a42] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42]" href="/recuperar-clave">Solicitar otro enlace</a>
        </div>
      ) : success ? (
        <div className="grid gap-4">
          <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm leading-5 text-[#365f43]" role="status">Contraseña restablecida. Inicia sesión con tu nueva contraseña.</p>
          <a className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1c5a42] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42]" href="/login">Ir a iniciar sesión</a>
        </div>
      ) : (
        <form className="grid gap-5" onSubmit={handleSubmit} onChange={() => setError('')} aria-busy={isSubmitting}>
          <PasswordField id="reset-new-password" name="newPassword" label="Nueva contraseña" autoComplete="new-password" minLength={12} hint="Usa al menos 12 caracteres." />
          <PasswordField id="reset-confirm-password" name="passwordConfirmation" label="Confirma la contraseña" autoComplete="new-password" minLength={12} />
          {error && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>}
          <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1c5a42] px-5 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Actualizando…' : 'Guardar nueva contraseña'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}

export default ResetPasswordPage
