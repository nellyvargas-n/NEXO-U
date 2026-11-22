import { useEffect, useState } from 'react'
import { ApiError } from '../../shared/api/client.ts'
import { getStudentProfiles } from '../profile/profile.service.ts'
import Surface from '../student-app/components/Surface.jsx'
import { getPublicScholarships, simulateScholarship } from './scholarships.service.ts'

function formatDate(value) {
  if (!value) return 'Fecha por confirmar'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Fecha por confirmar'
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(date)
}

function formatAmount(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(amount)
}

function getLoadError(error) {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return 'Inicia sesión con una cuenta de estudiante para consultar las becas.'
  }
  if (error instanceof TypeError) return 'No pudimos conectar con el servicio de becas. Revisa tu conexión e inténtalo de nuevo.'
  return error instanceof Error ? error.message : 'No se pudieron cargar las becas.'
}

function getSimulationError(error) {
  if (error instanceof ApiError && error.status === 403) return 'La simulación requiere un perfil escolar registrado.'
  if (error instanceof ApiError && error.status === 404) return 'Esta convocatoria ya no está disponible para simular.'
  if (error instanceof TypeError) return 'No pudimos conectar con el servicio. Inténtalo de nuevo.'
  return error instanceof Error ? error.message : 'No se pudo calcular la banda.'
}

function ScholarshipResult({ simulation }) {
  if (simulation.status === 'sin_estimacion') {
    return (
      <div className="mt-5 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] p-4">
        <p className="m-0 text-sm font-semibold text-[#725f32]">Aún no hay una banda estimable</p>
        <p className="mb-0 mt-1 text-sm leading-6 text-[#756b4d]">{simulation.message}</p>
      </div>
    )
  }

  const isCompatible = simulation.status === 'compatible'

  return (
    <div className={`mt-5 rounded-xl border p-4 ${isCompatible ? 'border-[#d5e8d3] bg-[#f1f8ec]' : 'border-[#e8dfbd] bg-[#fff9e9]'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`m-0 text-sm font-semibold ${isCompatible ? 'text-[#365f43]' : 'text-[#725f32]'}`}>
            {isCompatible ? `Banda orientativa: ${simulation.discount_percent}%` : 'No alcanzas los umbrales publicados'}
          </p>
          <p className="mb-0 mt-1 text-sm leading-6 text-[#66776b]">{simulation.message}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isCompatible ? 'bg-[#dcefdc] text-[#39704d]' : 'bg-[#f5ebca] text-[#806b35]'}`}>
          {isCompatible ? 'Cumples una banda' : 'Revisa los criterios'}
        </span>
      </div>

      {simulation.criteria?.length > 0 && (
        <div className="mt-4 grid gap-2">
          <h3 className="m-0 text-xs font-bold uppercase tracking-wide text-[#52685a]">Bandas oficiales aprobadas</h3>
          {simulation.criteria.map((criterion) => (
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-[#e6ece3] bg-white px-3 py-2.5" key={`${criterion.discount_percent}-${criterion.minimum_average}-${criterion.minimum_math}`}>
              <div>
                <p className="m-0 text-sm font-semibold text-[#344f40]">{criterion.discount_percent}% de descuento</p>
                <p className="m-0 mt-0.5 text-xs leading-5 text-[#718075]">Promedio mínimo {criterion.minimum_average} · Matemáticas {criterion.minimum_math}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold ${criterion.meets ? 'text-[#39704d]' : 'text-[#806b35]'}`}>
                  {criterion.meets ? 'Cumples' : 'Aún no cumples'}
                </span>
                {criterion.official_url && <a className="text-xs font-semibold text-[#246b4a] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" href={criterion.official_url} target="_blank" rel="noreferrer">Regla oficial ↗</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ScholarshipCard({ opportunity, profileReady, simulation, onSimulate }) {
  const amount = formatAmount(opportunity.amount_bob)
  const isSimulating = simulation?.state === 'loading'

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e0e9de] bg-white p-5 sm:p-6" aria-busy={isSimulating}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#edf5e9] px-3 py-1 text-xs font-semibold text-[#39704d]">Beca</span>
            {opportunity.verified_organization && <span className="text-xs font-medium text-[#567461]">✓ Emisor verificado</span>}
            {opportunity.is_demo && <span className="rounded-full bg-[#fff4e7] px-3 py-1 text-xs font-semibold text-[#8a6030]">Ejemplo ficticio</span>}
          </div>
          <h2 className="mt-3 font-display text-xl font-semibold leading-tight text-[#1c4033]">{opportunity.title}</h2>
          <p className="mt-1 text-sm text-[#718075]">{opportunity.organization}</p>
        </div>
        <div className="shrink-0 rounded-xl bg-[#f5f8f3] px-3 py-2 text-right">
          <p className="m-0 text-xs text-[#7b897e]">Cierre</p>
          <p className="m-0 mt-1 text-sm font-semibold text-[#405c49]">{formatDate(opportunity.deadline)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1eb] pt-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#758579]">
          {amount && <span className="font-semibold text-[#405c49]">Monto publicado: {amount}</span>}
          {opportunity.official_url && <a className="font-semibold text-[#246b4a] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" href={opportunity.official_url} target="_blank" rel="noreferrer">{opportunity.is_demo ? 'Referencia del ejemplo' : 'Convocatoria oficial'} ↗</a>}
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1c5a42] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57] disabled:cursor-not-allowed disabled:bg-[#93a99a]"
          disabled={!profileReady || isSimulating}
          type="button"
          onClick={() => onSimulate(opportunity.id)}
        >
          {isSimulating ? 'Calculando…' : simulation?.state === 'result' ? 'Recalcular banda' : 'Simular mi banda'}
        </button>
      </div>

      {simulation?.state === 'error' && <p className="mb-0 mt-4 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{simulation.message}</p>}
      {simulation?.state === 'result' && <ScholarshipResult simulation={simulation.data} />}
    </article>
  )
}

function ScholarshipsPage() {
  const [opportunities, setOpportunities] = useState([])
  const [profileState, setProfileState] = useState('loading')
  const [schoolProfile, setSchoolProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [simulations, setSimulations] = useState({})
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadScholarships() {
      setIsLoading(true)
      setError('')
      setProfileState('loading')
      setSchoolProfile(null)
      setOpportunities([])

      const [scholarshipsResult, profilesResult] = await Promise.allSettled([
        getPublicScholarships(),
        getStudentProfiles(),
      ])

      if (!isCurrent) return

      if (scholarshipsResult.status === 'fulfilled') {
        setOpportunities(scholarshipsResult.value)
      } else {
        setError(getLoadError(scholarshipsResult.reason))
      }

      if (profilesResult.status === 'fulfilled') {
        if (profilesResult.value.school) {
          setProfileState('school')
          setSchoolProfile(profilesResult.value.school)
        } else if (profilesResult.value.university) {
          setProfileState('university')
          setSchoolProfile(null)
        } else {
          setProfileState('none')
          setSchoolProfile(null)
        }
      } else {
        setProfileState('error')
        setSchoolProfile(null)
      }

      setSimulations({})
      setIsLoading(false)
    }

    loadScholarships()
    return () => { isCurrent = false }
  }, [reloadKey])

  async function handleSimulate(opportunityId) {
    setSimulations((current) => ({ ...current, [opportunityId]: { state: 'loading' } }))

    try {
      const result = await simulateScholarship(opportunityId)
      setSimulations((current) => ({ ...current, [opportunityId]: { state: 'result', data: result } }))
    } catch (simulationError) {
      setSimulations((current) => ({ ...current, [opportunityId]: { state: 'error', message: getSimulationError(simulationError) } }))
    }
  }

  return (
    <div className="grid max-w-4xl gap-5">
      <div>
        <p className="m-0 text-sm text-[#718075]">Convocatorias vigentes de organizaciones verificadas</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-[#1c4033]">Becas disponibles</h2>
        <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-[#66776b]">Consulta la fuente oficial y calcula una banda orientativa con los umbrales publicados y aprobados por administración.</p>
      </div>

      {!isLoading && profileState === 'school' && schoolProfile && (
        <div className="rounded-2xl border border-[#dce9d9] bg-[#f4f8f1] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div>
            <p className="m-0 text-sm font-semibold text-[#365f43]">Perfil escolar listo para simular</p>
            <p className="mb-0 mt-1 text-sm text-[#66776b]">Tus notas se comparan con cada banda aprobada; no se muestran a las instituciones.</p>
          </div>
          <div className="mt-3 flex shrink-0 gap-4 sm:mt-0">
            <p className="m-0 text-xs text-[#718075]">Promedio <strong className="ml-1 text-sm text-[#344f40]">{schoolProfile.average_grade}</strong></p>
            <p className="m-0 text-xs text-[#718075]">Matemáticas <strong className="ml-1 text-sm text-[#344f40]">{schoolProfile.math_grade}</strong></p>
          </div>
        </div>
      )}

      {!isLoading && profileState === 'none' && (
        <div className="rounded-2xl border border-[#e8dfbd] bg-[#fff9e9] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div>
            <p className="m-0 text-sm font-semibold text-[#725f32]">Completa tu perfil escolar para simular</p>
            <p className="mb-0 mt-1 text-sm leading-6 text-[#756b4d]">Necesitamos tu promedio general y tu nota de Matemáticas. Solo calculamos bandas con reglas oficiales aprobadas.</p>
          </div>
          <a className="mt-3 inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-[#d9cfad] px-4 text-sm font-semibold text-[#725f32] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#927d49] sm:mt-0" href="/app/perfil">Completar perfil</a>
        </div>
      )}

      {!isLoading && profileState === 'university' && (
        <div className="rounded-2xl border border-[#e8dfbd] bg-[#fff9e9] p-4">
          <p className="m-0 text-sm font-semibold text-[#725f32]">La simulación necesita un perfil escolar</p>
          <p className="mb-0 mt-1 text-sm leading-6 text-[#756b4d]">Esta cuenta tiene un perfil universitario. Nexo U mantiene un solo perfil académico por cuenta; las becas siguen visibles, pero no se puede calcular una banda con este perfil.</p>
        </div>
      )}

      {!isLoading && profileState === 'error' && (
        <div className="rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3">
          <p className="m-0 text-sm leading-5 text-[#9b302a]" role="alert">No pudimos confirmar tu perfil escolar. Reintenta antes de simular una beca.</p>
          <button className="mt-3 min-h-9 rounded-lg border border-[#edc9c5] px-3 text-sm font-semibold text-[#9b302a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c75c52]" type="button" onClick={() => setReloadKey((key) => key + 1)}>Reintentar</button>
        </div>
      )}

      {isLoading ? (
        <Surface><p className="m-0 py-4 text-sm text-[#718075]" role="status">Cargando becas y perfil…</p></Surface>
      ) : error ? (
        <Surface>
          <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>
          <button className="mt-4 min-h-11 rounded-xl border border-[#d8e2d7] px-4 text-sm font-semibold text-[#1c5a42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" type="button" onClick={() => setReloadKey((key) => key + 1)}>Reintentar</button>
        </Surface>
      ) : opportunities.length > 0 ? (
        <>
          <p className="m-0 text-sm font-medium text-[#687b70]">{opportunities.length} {opportunities.length === 1 ? 'convocatoria vigente' : 'convocatorias vigentes'}</p>
          <div className="grid gap-4">
            {opportunities.map((opportunity) => (
              <ScholarshipCard
                key={opportunity.id}
                opportunity={opportunity}
                profileReady={profileState === 'school'}
                simulation={simulations[opportunity.id]}
                onSimulate={handleSimulate}
              />
            ))}
          </div>
        </>
      ) : (
        <Surface className="py-9 text-center">
          <h2 className="font-display text-xl font-semibold text-[#1c4033]">No hay becas vigentes</h2>
          <p className="mx-auto mb-0 mt-2 max-w-lg text-sm leading-6 text-[#718075]">Aquí aparecerán convocatorias abiertas publicadas por organizaciones verificadas.</p>
          <button className="mt-4 min-h-10 rounded-xl border border-[#d8e2d7] px-4 text-sm font-semibold text-[#246b4a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" type="button" onClick={() => setReloadKey((key) => key + 1)}>Volver a buscar</button>
        </Surface>
      )}
    </div>
  )
}

export default ScholarshipsPage
