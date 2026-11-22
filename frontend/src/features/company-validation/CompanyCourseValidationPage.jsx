import { useEffect, useState } from 'react'
import { ApiError } from '../../shared/api/client.ts'
import { clearAccessToken } from '../../shared/api/session.ts'
import BrandMark from '../../shared/components/BrandMark.jsx'
import Surface from '../student-app/components/Surface.jsx'
import { getCompanyCourseData, validateCourseCompletion } from './company-validation.service.ts'

const fieldClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#d8e2d7] bg-white px-4 text-base text-[#253b30] outline-none focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15'

function getLoadError(error) {
  if (error instanceof ApiError && error.status === 401) {
    return { message: 'Inicia sesión con una cuenta de empresa para acceder a las validaciones.', action: 'login' }
  }
  if (error instanceof ApiError && error.status === 403) {
    return { message: 'Esta pantalla está disponible solo para cuentas de empresa.', action: 'login' }
  }
  if (error instanceof TypeError) return { message: 'No pudimos conectar con el servidor. Revisa la conexión e inténtalo otra vez.', action: 'retry' }
  return { message: error instanceof Error ? error.message : 'No se pudieron cargar los cursos de la organización.', action: 'retry' }
}

function getValidationError(error) {
  if (error instanceof ApiError && error.status === 401) return 'Tu sesión expiró. Inicia sesión con la cuenta de empresa otra vez.'
  if (error instanceof ApiError && error.status === 403) return 'No puedes validar este curso. Debe pertenecer a una organización tuya y verificada.'
  if (error instanceof ApiError && error.status === 404) return 'No se encontró el estudiante o no tiene un perfil universitario completo.'
  if (error instanceof ApiError && error.status === 409) return 'El estudiante debe estar inscrito en este curso antes de validar la finalización.'
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor. Inténtalo otra vez.'
  return error instanceof Error ? error.message : 'No se pudo validar la finalización del curso.'
}

function CompanyCourseValidationPage() {
  const [organizations, setOrganizations] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [studentUserId, setStudentUserId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [validationError, setValidationError] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)
    setLoadError(null)

    getCompanyCourseData()
      .then((data) => {
        if (!isCurrent) return
        setOrganizations(data.organizations)
        setCourses(data.courses)
        setSelectedCourseId((current) => {
          const eligible = data.courses.find((course) => course.organization?.verified)
          return current && data.courses.some((course) => String(course.id) === current && course.organization?.verified)
            ? current
            : eligible ? String(eligible.id) : ''
        })
      })
      .catch((error) => {
        if (isCurrent) setLoadError(getLoadError(error))
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => { isCurrent = false }
  }, [reloadKey])

  const eligibleCourses = courses.filter((course) => course.organization?.verified)
  const selectedCourse = eligibleCourses.find((course) => String(course.id) === selectedCourseId)
  const verifiedOrganizations = organizations.filter((organization) => organization.verified)

  async function handleSubmit(event) {
    event.preventDefault()
    setValidationError('')
    setValidationMessage('')
    setIsSubmitting(true)

    try {
      const result = await validateCourseCompletion(Number(selectedCourseId), Number(studentUserId))
      setValidationMessage(result.status === 'already_completed'
        ? 'Esta inscripción ya estaba marcada como completada.'
        : 'Finalización validada. La credencial quedó verificada y el estudiante puede volver a consultar su compatibilidad.')
      setStudentUserId('')
    } catch (error) {
      setValidationError(getValidationError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function signOut() {
    clearAccessToken()
    window.location.assign('/login')
  }

  return (
    <div className="min-h-screen bg-[#f6f8f4] text-[#173b31]">
      <header className="border-b border-[#e5ebe3] bg-[#fbfcf8]">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <BrandMark href="/" size="small" />
            <span className="hidden h-7 border-l border-[#dfe7dd] sm:block" aria-hidden="true" />
            <p className="m-0 hidden text-sm font-medium text-[#718075] sm:block">Portal de organizaciones</p>
          </div>
          <button className="min-h-10 rounded-xl px-3 text-sm font-semibold text-[#385647] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858]" type="button" onClick={signOut}>Cerrar sesión</button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-7 sm:px-6 sm:py-10">
        <div>
          <p className="m-0 text-xs font-bold tracking-[0.12em] text-[#347a57]">VALIDACIÓN DE CREDENCIALES</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-[#1c4033] sm:text-4xl">Confirma la finalización de un curso</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#66776b]">La validación confirma que el estudiante completó un curso de tu organización. Nexo U registra la credencial como verificada y actualiza su compatibilidad.</p>
        </div>

        {isLoading ? (
          <Surface><p className="m-0 py-4 text-sm text-[#718075]" role="status">Cargando tus organizaciones y cursos…</p></Surface>
        ) : loadError ? (
          <Surface className="max-w-3xl">
            <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{loadError.message}</p>
            {loadError.action === 'login' && <a className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1c5a42] px-4 text-sm font-semibold text-white" href="/login">Iniciar sesión</a>}
            {loadError.action === 'retry' && <button className="mt-4 min-h-11 rounded-xl border border-[#d8e2d7] px-4 text-sm font-semibold text-[#1c5a42]" type="button" onClick={() => setReloadKey((key) => key + 1)}>Reintentar</button>}
          </Surface>
        ) : (
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <Surface>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-[#1c4033]">Validar una inscripción</h2>
                  <p className="mt-1 text-sm leading-6 text-[#718075]">Selecciona el curso e ingresa el ID de cuenta que comparte el estudiante.</p>
                </div>
                <span className="rounded-full bg-[#edf5e9] px-3 py-1.5 text-xs font-semibold text-[#39704d]">{eligibleCourses.length} cursos verificables</span>
              </div>

              {eligibleCourses.length > 0 ? (
                <form className="mt-6 grid gap-5" onSubmit={handleSubmit} aria-busy={isSubmitting}>
                  <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="company-course">
                    Curso de tu organización
                    <select className={fieldClass} id="company-course" value={selectedCourseId} onChange={(event) => { setSelectedCourseId(event.target.value); setValidationError(''); setValidationMessage('') }} required>
                      {eligibleCourses.map((course) => (
                        <option key={course.id} value={course.id}>{course.title} · {course.organization?.name}</option>
                      ))}
                    </select>
                  </label>

                  {selectedCourse && (
                    <div className="rounded-xl bg-[#f5f8f3] px-4 py-3 text-sm text-[#526b5a]">
                      <p className="m-0 font-semibold text-[#365340]">Credencial que quedará verificada</p>
                      <p className="m-0 mt-1">{selectedCourse.credential_value}{selectedCourse.credential_level ? ` · nivel ${selectedCourse.credential_level}` : ''}</p>
                    </div>
                  )}

                  <label className="block text-sm font-semibold text-[#344b3c]" htmlFor="student-user-id">
                    ID de cuenta del estudiante
                    <input className={fieldClass} id="student-user-id" type="number" min="1" step="1" inputMode="numeric" value={studentUserId} onChange={(event) => { setStudentUserId(event.target.value); setValidationError(''); setValidationMessage('') }} placeholder="Ej. 12" required />
                    <span className="mt-2 block text-xs font-normal leading-5 text-[#7b897e]">El estudiante encuentra este número en Mi perfil. Debe estar inscrito en el curso seleccionado.</span>
                  </label>

                  {validationError && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{validationError}</p>}
                  {validationMessage && <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm leading-5 text-[#365f43]" role="status">{validationMessage}</p>}

                  <button className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#1c5a42] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSubmitting || !selectedCourseId || !studentUserId}>
                    {isSubmitting ? 'Validando…' : 'Validar finalización'}
                  </button>
                </form>
              ) : (
                <div className="mt-6 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] p-4 text-sm leading-6 text-[#75633b]" role="status">
                  <p className="m-0 font-semibold">Todavía no hay cursos verificables.</p>
                  <p className="m-0 mt-1">Necesitas un curso propio asociado a una organización que un administrador haya verificado.</p>
                </div>
              )}
            </Surface>

            <div className="grid gap-5">
              <Surface>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[#1c4033]">Tus organizaciones</h2>
                    <p className="mt-1 text-sm text-[#718075]">{organizations.length} {organizations.length === 1 ? 'organización' : 'organizaciones'} · {verifiedOrganizations.length} verificadas</p>
                  </div>
                  <button className="min-h-9 rounded-lg px-2 text-xs font-semibold text-[#347a57] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" type="button" onClick={() => setReloadKey((key) => key + 1)}>Actualizar</button>
                </div>
                {organizations.length > 0 ? (
                  <ul className="mt-4 grid gap-3">
                    {organizations.map((organization) => (
                      <li className="flex items-center justify-between gap-3 rounded-xl bg-[#f5f8f3] px-4 py-3" key={organization.id}>
                        <span className="min-w-0 truncate text-sm font-semibold text-[#405c49]">{organization.name}</span>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${organization.verified ? 'bg-[#e4f2e5] text-[#39704d]' : 'bg-[#fbf3de] text-[#8b713b]'}`}>{organization.verified ? 'Verificada' : 'Pendiente'}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-xl bg-[#f5f8f3] px-4 py-3 text-sm leading-5 text-[#718075]">No hay organizaciones asociadas a esta cuenta.</p>
                )}
              </Surface>

              <Surface className="bg-[#f8faf6]">
                <h2 className="font-display text-lg font-semibold text-[#1c4033]">Antes de confirmar</h2>
                <ul className="mt-3 grid gap-2 pl-5 text-sm leading-5 text-[#66776b]">
                  <li>El estudiante debe estar inscrito en el curso.</li>
                  <li>El curso debe pertenecer a tu organización verificada.</li>
                  <li>La confirmación crea una credencial verificada y actualiza el match del estudiante.</li>
                </ul>
              </Surface>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CompanyCourseValidationPage
