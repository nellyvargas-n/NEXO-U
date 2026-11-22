import { useState } from 'react'
import { ApiError } from '../../../shared/api/client.ts'
import AuthLayout from '../components/AuthLayout.jsx'
import { requestPasswordReset } from '../../../shared/api/modules/auth.service.ts'

const inputClass = 'h-12 w-full rounded-xl border border-[#d8e2d7] bg-white px-4 text-base text-[#253b30] outline-none transition placeholder:text-[#94a197] focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15'

function getRequestError(error) {
  if (error instanceof ApiError && error.status === 503) return 'La recuperación por correo no está habilitada en este servidor. Contacta al equipo de Nexo U.'
  if (error instanceof ApiError && error.status === 429) return 'Se hicieron demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.'
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor. Inténtalo de nuevo en unos momentos.'
  return error instanceof Error ? error.message : 'No se pudo solicitar la recuperación.'
}

function RequestPasswordResetPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      const result = await requestPasswordReset(email)
      setNotice(result.message)
    } catch (requestError) {
      setError(getRequestError(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      pageType="login"
      eyebrow="RECUPERA EL ACCESO"
      title="Restablece tu contraseña"
      description="Te enviaremos un enlace de un solo uso al correo asociado a tu cuenta."
      switchText="¿Ya la recuerdas?"
      switchLabel="Inicia sesión"
      switchHref="/login"
    >
      <form className="grid gap-5" onSubmit={handleSubmit} onChange={() => { setError(''); setNotice('') }} aria-busy={isSubmitting}>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-[#344b3c]" htmlFor="reset-request-email">Correo electrónico</label>
          <input className={inputClass} id="reset-request-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
        </div>
        {error && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>}
        {notice && <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm leading-5 text-[#365f43]" role="status">{notice}</p>}
        <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1c5a42] px-5 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando…' : 'Enviar enlace de recuperación'}
        </button>
      </form>
    </AuthLayout>
  )
}

export default RequestPasswordResetPage
