import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../../../shared/api/client.ts'
import { getCourseCheckout, startCourseCheckout } from '../course-checkout.service.ts'

function formatCost(value) {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(value)
}

function newIdempotencyKey(courseId) {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `curso-${courseId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function checkoutError(error) {
  if (error instanceof ApiError && error.status === 404) {
    return 'No se inició ningún cobro ni inscripción. El checkout todavía no está habilitado o el curso ya no está disponible.'
  }
  if (error instanceof ApiError && error.status === 401) return 'Tu sesión venció. Inicia sesión nuevamente para continuar.'
  if (error instanceof TypeError || (error instanceof ApiError && error.status === 0)) return 'No pudimos conectar con el servicio de pago. No se creó una inscripción.'
  return error instanceof Error ? error.message : 'No se pudo iniciar el pago.'
}

function CourseCheckoutDialog({ course, onClose, onPaid }) {
  const [checkout, setCheckout] = useState(null)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')
  const [refreshError, setRefreshError] = useState('')
  const paidHandled = useRef(false)
  const idempotencyKey = useRef(newIdempotencyKey(course.id))

  async function beginCheckout() {
    setError('')
    setIsStarting(true)
    try {
      const result = await startCourseCheckout(course.id, idempotencyKey.current)
      setCheckout(result)
    } catch (requestError) {
      setError(checkoutError(requestError))
    } finally {
      setIsStarting(false)
    }
  }

  useEffect(() => {
    if (!checkout?.payment_id || checkout.status !== 'pending') return undefined
    let isCurrent = true
    let timer

    async function checkPayment() {
      try {
        const result = await getCourseCheckout(checkout.payment_id)
        if (!isCurrent) return
        setCheckout(result)
        setRefreshError('')
        if (result.status === 'pending') timer = window.setTimeout(checkPayment, 3000)
      } catch {
        if (!isCurrent) return
        setRefreshError('No pudimos consultar el pago. Seguiremos verificándolo.')
        timer = window.setTimeout(checkPayment, 5000)
      }
    }

    timer = window.setTimeout(checkPayment, 2500)
    return () => {
      isCurrent = false
      window.clearTimeout(timer)
    }
  }, [checkout?.payment_id, checkout?.status])

  useEffect(() => {
    if (checkout?.status !== 'paid' || paidHandled.current) return
    paidHandled.current = true
    Promise.resolve(onPaid(course.id, checkout.learning_url)).catch(() => {
      setRefreshError('Pago confirmado. Actualiza la lista para ver la inscripción.')
    })
  }, [checkout?.status, checkout?.learning_url, course.id, onPaid])

  const isFinal = ['failed', 'expired', 'cancelled'].includes(checkout?.status)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#14271f]/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section aria-labelledby="course-checkout-title" aria-modal="true" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7" role="dialog">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-bold tracking-[0.12em] text-[#2876d7]">INSCRIPCIÓN</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-[#1d3557]" id="course-checkout-title">{checkout?.status === 'paid' ? 'Pago confirmado' : 'Pagar e inscribirme'}</h2>
          </div>
          <button aria-label="Cerrar" className="grid size-10 shrink-0 place-items-center rounded-xl text-xl text-[#536c60] hover:bg-[#f0f5ed]" onClick={onClose} type="button">×</button>
        </div>

        <p className="mb-0 mt-4 font-semibold text-[#344f40]">{course.title}</p>
        <p className="mb-0 mt-1 text-sm text-[#687b70]">{course.organization}</p>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f3f7f1] px-4 py-3">
          <span className="text-sm text-[#687b70]">Total</span>
          <strong className="text-lg text-[#1d5c43]">{formatCost(course.cost_bob)}</strong>
        </div>

        {!checkout && (
          <>
            <p className="mb-0 mt-4 text-sm leading-6 text-[#687b70]">La inscripción se activa únicamente cuando el pago queda confirmado.</p>
            {error && <p className="mb-0 mt-4 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm text-[#9b302a]" role="alert">{error}</p>}
            <button className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#1d684d] px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60" disabled={isStarting} onClick={beginCheckout} type="button">
              {isStarting ? 'Conectando con el pago…' : `Continuar al pago · ${formatCost(course.cost_bob)}`}
            </button>
          </>
        )}

        {checkout?.status === 'pending' && (
          <div className="mt-5 grid gap-4">
            {checkout.qr_code_url && <img alt="Código QR para pagar el curso" className="mx-auto max-h-56 rounded-xl border border-[#e0e9de] p-2" src={checkout.qr_code_url} />}
            {checkout.checkout_url && <a className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1d684d] px-4 text-sm font-semibold text-white" href={checkout.checkout_url} rel="noopener noreferrer" target="_blank">Abrir medio de pago ↗</a>}
            {!checkout.checkout_url && !checkout.qr_code_url && <p className="m-0 rounded-xl bg-[#fbf2dd] px-4 py-3 text-sm text-[#806b35]">El medio de pago todavía no fue generado.</p>}
            <p className="m-0 text-center text-sm text-[#687b70]" role="status">Esperando confirmación del pago…</p>
            {refreshError && <p className="m-0 text-center text-xs text-[#806b35]" role="status">{refreshError}</p>}
          </div>
        )}

        {checkout?.status === 'paid' && (
          <div className="mt-5 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] p-4 text-sm leading-6 text-[#365f43]" role="status">
            <p className="m-0">Inscripción activa. Al terminar el curso, la empresa valida la finalización y la credencial se agrega a tu perfil.</p>
            {checkout.learning_url && <a className="mt-3 inline-flex font-semibold text-[#246b4a] underline-offset-4 hover:underline" href={checkout.learning_url} rel="noopener noreferrer" target="_blank">Abrir el curso ↗</a>}
            {!checkout.learning_url && <p className="mb-0 mt-2 text-[#806b35]">El contenido del curso aún no está habilitado.</p>}
          </div>
        )}

        {isFinal && (
          <div className="mt-5 grid gap-3">
            <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm text-[#9b302a]" role="alert">
              {checkout.status === 'expired' ? 'El pago venció. Inicia uno nuevo para inscribirte.' : checkout.status === 'cancelled' ? 'El pago fue cancelado. No se creó la inscripción.' : 'El pago no se completó. No se creó la inscripción.'}
            </p>
            <button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#dfe8de] px-4 text-sm font-semibold text-[#246b4a]" onClick={() => { idempotencyKey.current = newIdempotencyKey(course.id); setCheckout(null); setError('') }} type="button">Intentar de nuevo</button>
          </div>
        )}

        {checkout?.status === 'paid' && refreshError && <p className="mb-0 mt-3 text-center text-xs text-[#806b35]" role="status">{refreshError}</p>}
      </section>
    </div>
  )
}

export default CourseCheckoutDialog
