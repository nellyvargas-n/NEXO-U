import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../../../shared/api/client.ts'
import {
  finalizeCourseCheckout,
  startCourseCheckout,
  uploadCourseProof,
} from '../course-checkout.service.ts'

function formatCost(value) {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(value)
}

function newIdempotencyKey(courseId) {
  const storageKey = `nexo-course-checkout-${courseId}`
  try {
    const existingKey = window.sessionStorage.getItem(storageKey)
    if (existingKey) return existingKey
  } catch {
    // La sesión de inscripción sigue funcionando si el navegador bloquea el almacenamiento.
  }
  const key = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `curso-${courseId}-${Date.now()}-${Math.random().toString(36).slice(2)}`
  try { window.sessionStorage.setItem(storageKey, key) } catch {
    // El servidor conserva la clave mientras la ventana permanezca abierta.
  }
  return key
}

function getError(error) {
  if (error instanceof ApiError && error.status === 401) return 'Tu sesión venció. Inicia sesión nuevamente para continuar.'
  if (error instanceof TypeError || (error instanceof ApiError && error.status === 0)) return 'No pudimos conectar con el servicio. Inténtalo de nuevo.'
  return error instanceof Error ? error.message : 'No se pudo completar la inscripción.'
}

function QrPattern() {
  const modules = [
    '111111100101101111111', '100000101100001000001', '101110101011101011101',
    '101110100010101011101', '101110101111001011101', '100000101010101000001',
    '111111101010101111111', '000000001101100000000', '110101101001011011010',
    '001011010111100101101', '111001111010111001010', '010110001101000111001',
    '101101111001110010110', '000000001011001101011', '111111101100101001101',
    '100000100011110101010', '101110101110011111001', '101110100010101010110',
    '101110101101111001011', '100000101011001010010', '111111101100111101101',
  ]
  return (
    <svg aria-label="Código QR de referencia" className="size-44 rounded-lg bg-white p-2" role="img" viewBox="0 0 21 21">
      <rect fill="white" height="21" width="21" />
      {modules.flatMap((row, y) => [...row].map((cell, x) => (
        cell === '1' ? <rect fill="#173b31" height="1" key={`${x}-${y}`} width="1" x={x} y={y} /> : null
      )))}
    </svg>
  )
}

async function fileAsBase64(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
  return String(dataUrl).split(',', 2)[1] ?? ''
}

function CourseCheckoutDialog({ course, onClose, onEnrolled }) {
  const [checkout, setCheckout] = useState(null)
  const [file, setFile] = useState(null)
  const [isStarting, setIsStarting] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [error, setError] = useState('')
  const idempotencyKey = useRef(newIdempotencyKey(course.id))
  const started = useRef(false)

  const beginCheckout = useCallback(async () => {
    setError('')
    setIsStarting(true)
    try {
      const result = await startCourseCheckout(course.id, idempotencyKey.current)
      setCheckout(result)
    } catch (requestError) {
      setError(getError(requestError))
    } finally {
      setIsStarting(false)
    }
  }, [course.id])

  useEffect(() => {
    if (started.current) return
    started.current = true
    beginCheckout()
  }, [beginCheckout])

  async function handleUpload() {
    if (!file || !checkout?.payment_id) return
    setError('')
    setIsUploading(true)
    try {
      const dataBase64 = await fileAsBase64(file)
      const result = await uploadCourseProof(checkout.payment_id, {
        filename: file.name,
        content_type: file.type,
        data_base64: dataBase64,
      })
      setCheckout(result)
    } catch (uploadError) {
      setError(getError(uploadError))
    } finally {
      setIsUploading(false)
    }
  }

  async function handleFinalize() {
    if (!checkout?.payment_id) return
    setError('')
    setIsFinalizing(true)
    try {
      const result = await finalizeCourseCheckout(checkout.payment_id)
      setCheckout(result)
      await onEnrolled(course.id, result.learning_url)
    } catch (finalizeError) {
      setError(getError(finalizeError))
    } finally {
      setIsFinalizing(false)
    }
  }

  const isConfirmed = checkout?.status === 'confirmed'
  const proofUploaded = checkout?.status === 'proof_uploaded'

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#14271f]/55 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section aria-labelledby="course-checkout-title" aria-modal="true" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7" role="dialog">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-bold tracking-[0.12em] text-[#2876d7]">INSCRIPCIÓN</p>
            <h2 className="mt-2 font-display text-xl font-semibold text-[#1d3557]" id="course-checkout-title">
              {isConfirmed ? 'Inscripción activa' : 'Completa tu inscripción'}
            </h2>
          </div>
          <button aria-label="Cerrar" className="grid size-10 shrink-0 place-items-center rounded-xl text-xl text-[#536c60]" onClick={onClose} type="button">×</button>
        </div>

        <p className="mb-0 mt-4 font-semibold text-[#344f40]">{course.title}</p>
        <p className="mb-0 mt-1 text-sm text-[#687b70]">{course.organization}</p>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f3f7f1] px-4 py-3">
          <span className="text-sm text-[#687b70]">Total</span>
          <strong className="text-lg text-[#1d5c43]">{formatCost(course.cost_bob)}</strong>
        </div>

        {isStarting && <p className="mb-0 mt-5 text-sm text-[#687b70]" role="status">Preparando tu inscripción…</p>}

        {!isStarting && checkout?.status === 'pending' && (
          <div className="mt-5 grid justify-items-center gap-4">
            <div className="rounded-2xl border border-[#e0e9de] bg-[#f8faf7] p-3"><QrPattern /></div>
            <p className="m-0 max-w-sm text-center text-sm leading-6 text-[#687b70]">
              Este código no procesa pagos. Adjunta tu comprobante para continuar con la inscripción.
            </p>
            <label className="grid w-full gap-2 text-sm font-semibold text-[#344f40]">
              Subir comprobante <span className="text-[#687b70]">(PDF, PNG o JPG · máximo 2 MB)</span>
              <input
                accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg"
                className="min-h-12 w-full rounded-xl border border-[#d8e4d7] px-3 py-2 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-[#eaf3e9] file:px-3 file:py-2 file:font-semibold file:text-[#246b4a]"
                onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError('') }}
                type="file"
              />
            </label>
            {file && <p className="m-0 w-full truncate text-xs text-[#687b70]">{file.name}</p>}
            {error && <p className="m-0 w-full rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm text-[#9b302a]" role="alert">{error}</p>}
            <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#1d684d] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={!file || isUploading} onClick={handleUpload} type="button">
              {isUploading ? 'Subiendo comprobante…' : 'Subir comprobante'}
            </button>
          </div>
        )}

        {proofUploaded && (
          <div className="mt-5 grid gap-4">
            <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm text-[#365f43]" role="status">Comprobante recibido. Este paso no valida una transacción bancaria.</p>
            {error && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm text-[#9b302a]" role="alert">{error}</p>}
            <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#1d684d] px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60" disabled={isFinalizing} onClick={handleFinalize} type="button">
              {isFinalizing ? 'Finalizando…' : 'Finalizar inscripción'}
            </button>
          </div>
        )}

        {isConfirmed && (
          <div className="mt-5 grid gap-3 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] p-4 text-sm leading-6 text-[#365f43]" role="status">
            <p className="m-0 font-semibold">Ya tienes acceso al curso.</p>
            {checkout.learning_url && <a className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1d684d] px-4 font-semibold text-white" href={checkout.learning_url}>Abrir el curso</a>}
          </div>
        )}

        {!isStarting && !checkout && error && (
          <div className="mt-5 grid gap-3">
            <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm text-[#9b302a]" role="alert">{error}</p>
            <button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#dfe8de] px-4 text-sm font-semibold text-[#246b4a]" onClick={beginCheckout} type="button">Intentar de nuevo</button>
          </div>
        )}
      </section>
    </div>
  )
}

export default CourseCheckoutDialog
