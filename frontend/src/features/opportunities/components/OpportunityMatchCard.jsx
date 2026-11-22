import Icon from '../../../shared/components/Icon.jsx'

const categoryLabels = {
  beca: 'Beca',
  pasantia: 'Pasantía',
  patrocinio: 'Patrocinio',
  curso: 'Curso',
}

const requirementLabels = {
  career: 'Carrera',
  semester: 'Semestre',
  age: 'Edad',
  skill: 'Habilidad',
  language: 'Idioma',
  certificate: 'Certificado',
}

function formatDate(value) {
  if (!value) return 'Fecha por confirmar'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Fecha por confirmar'
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(date)
}

function formatAmount(value) {
  if (!value || value <= 0) return null
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(value)
}

function sourceLabel(opportunity) {
  if (opportunity.source_kind === 'bolsa_trabajo') return 'Bolsa de trabajo consultada'
  if (opportunity.is_curated) return opportunity.source_kind === 'canal_oficial' ? 'Canal oficial consultado' : 'Fuente institucional consultada'
  return opportunity.verified_organization ? 'Emisor verificado' : 'Emisor sin verificar'
}

function OpportunityMatchCard({ opportunity, maxRequirements = 4 }) {
  const { match } = opportunity
  const requirements = match?.requirements ?? []
  const visibleRequirements = requirements.slice(0, maxRequirements)
  const remainingRequirements = Math.max(0, requirements.length - visibleRequirements.length)
  const amount = formatAmount(opportunity.amount_bob)
  const hasMatchScore = Boolean(match && match.total > 0)

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e0e9de] bg-white">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#edf5e9] px-3 py-1 text-xs font-semibold text-[#39704d]">{categoryLabels[opportunity.category] ?? opportunity.category}</span>
              {opportunity.verified_organization && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#567461]"><Icon name="check" className="size-3.5" /> Emisor verificado</span>
              )}
              {opportunity.is_curated && <span className="rounded-full bg-[#f4f1e8] px-3 py-1 text-xs font-medium text-[#75633b]">{sourceLabel(opportunity)}</span>}
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold leading-tight text-[#1c4033]">{opportunity.title}</h2>
            <p className="mt-1 text-sm text-[#718075]">{opportunity.organization}</p>
          </div>
          <div className="shrink-0 rounded-xl bg-[#f5f8f3] px-3 py-2 text-right">
            <p className="m-0 text-xs text-[#7b897e]">Cierre</p>
            <p className="m-0 mt-1 text-sm font-semibold text-[#405c49]">{formatDate(opportunity.deadline)}</p>
          </div>
        </div>

        {opportunity.summary && <p className="mt-4 text-sm leading-6 text-[#687b70]">{opportunity.summary}</p>}
        {opportunity.source_checked_on && <p className="mb-0 mt-2 text-xs text-[#8595a9]">Fuente revisada {formatDate(opportunity.source_checked_on)}</p>}

        <div className="mt-5 rounded-xl bg-[#f5f8f3] p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="m-0 font-display text-2xl font-bold tracking-tight text-[#247858]">
                {hasMatchScore ? <>{match.met}<span className="text-base font-medium text-[#839186]">/{match.total}</span></> : '—'}
              </p>
              <p className="m-0 text-sm text-[#687b70]">{hasMatchScore ? (opportunity.is_curated ? 'requisitos comparables registrados' : 'requisitos que cumples') : match ? 'sin requisitos comparables publicados' : 'match no disponible'}</p>
            </div>
            {hasMatchScore ? (
              <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${match.eligible ? 'bg-[#e4f2e5] text-[#39704d]' : 'bg-[#fbf2dd] text-[#8a7138]'}`}>
                {match.eligible ? (opportunity.is_curated ? 'Coincides con los criterios comparables' : 'Cumples los requisitos') : `${match.percent}% compatible`}
              </span>
            ) : match ? (
              <span className="rounded-full bg-[#f0f2ee] px-3 py-1.5 text-xs font-semibold text-[#68766c]">Sin criterios comparables</span>
            ) : <span className="text-xs font-medium text-[#68766c]">Esperando compatibilidad</span>}
          </div>

          {hasMatchScore && (
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dfe8df]" role="progressbar" aria-label={`Compatibilidad con ${opportunity.title}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={match.percent}>
              <div className="h-full rounded-full bg-[#67ad7e]" style={{ width: `${Math.max(0, Math.min(100, match.percent))}%` }} />
            </div>
          )}
          {hasMatchScore && opportunity.is_curated && <p className="mb-0 mt-2 text-xs leading-5 text-[#7b897e]">La institución puede exigir otras condiciones; revisa la convocatoria antes de postular.</p>}
        </div>

        {visibleRequirements.length > 0 && (
          <div className="mt-5">
            <h3 className="text-sm font-semibold text-[#52685a]">Requisitos obligatorios</h3>
            <ul className="mt-2 divide-y divide-[#edf1eb]">
              {visibleRequirements.map((requirement, index) => {
                const met = requirement.status === 'cumple'
                const suggestedCourse = requirement.courses?.[0]
                return (
                  <li className="py-3" key={`${requirement.kind}-${requirement.required}-${index}`}>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`grid size-6 shrink-0 place-items-center rounded-full ${met ? 'bg-[#e4f2e5] text-[#328052]' : 'bg-[#fbf2dd] text-[#947333]'}`}>
                        <Icon name={met ? 'check' : 'plus'} className="size-3.5" />
                      </span>
                      <span className="font-medium text-[#344f40]">{requirementLabels[requirement.kind] ?? requirement.kind}: {requirement.required}</span>
                      <span className={`ml-auto text-xs font-semibold ${met ? 'text-[#548164]' : 'text-[#927d49]'}`}>{met ? 'Cumples' : 'Pendiente'}</span>
                    </div>
                    {!met && suggestedCourse && (
                      <p className="mb-0 ml-8 mt-2 text-xs leading-5 text-[#718075]">Curso sugerido: <a className="font-semibold text-[#246b4a] underline-offset-4 hover:underline" href="/app/cursos">{suggestedCourse.title}</a></p>
                    )}
                  </li>
                )
              })}
            </ul>
            {remainingRequirements > 0 && <p className="mb-0 mt-2 text-xs text-[#7b897e]">Y {remainingRequirements} {remainingRequirements === 1 ? 'requisito más.' : 'requisitos más.'}</p>}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1eb] pt-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#758579]">
            {amount && <span>{amount}</span>}
            {opportunity.official_url && <a className="font-semibold text-[#246b4a] underline-offset-4 hover:underline" href={opportunity.official_url} target="_blank" rel="noreferrer">{opportunity.category === 'beca' ? 'Postular o revisar' : 'Ver convocatoria'} <span aria-hidden="true">↗</span></a>}
            {opportunity.source_url && opportunity.source_url !== opportunity.official_url && <a className="font-semibold text-[#246b4a] underline-offset-4 hover:underline" href={opportunity.source_url} target="_blank" rel="noreferrer">Consultar fuente <span aria-hidden="true">↗</span></a>}
          </div>
          {match?.requirements?.some((requirement) => requirement.status === 'falta' && requirement.courses?.length > 0) && (
            <a className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#246b4a] underline-offset-4 hover:underline" href="/app/cursos">Ver cursos <span aria-hidden="true">→</span></a>
          )}
        </div>
      </div>
    </article>
  )
}

export default OpportunityMatchCard
