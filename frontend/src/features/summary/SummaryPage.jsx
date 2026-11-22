import Surface from '../student-app/components/Surface.jsx'
import OpportunityMatchCard from '../opportunities/components/OpportunityMatchCard.jsx'
import { sortOpportunitiesByMatch } from '../opportunities/opportunities.service.ts'
import { useOpportunityFeed } from '../opportunities/useOpportunityFeed.js'

function SummaryPage() {
  const { opportunities, matchNotice, isLoading, error, retry } = useOpportunityFeed()
  const rankedOpportunities = sortOpportunitiesByMatch(opportunities)
  const featuredOpportunity = rankedOpportunities.find((opportunity) => opportunity.match?.total > 0) ?? rankedOpportunities[0]
  const compatibleCount = opportunities.filter((opportunity) => opportunity.match?.eligible && opportunity.match.total > 0).length
  const missingRequirement = featuredOpportunity?.match?.requirements?.find((requirement) => requirement.status === 'falta')
  const suggestedCourse = missingRequirement?.courses?.[0]

  if (isLoading) {
    return <Surface><p className="m-0 py-4 text-sm text-[#718075]" role="status">Buscando oportunidades compatibles…</p></Surface>
  }

  if (error) {
    return (
      <Surface className="max-w-3xl">
        <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>
        <button className="mt-4 min-h-11 rounded-xl border border-[#d8e2d7] px-4 text-sm font-semibold text-[#1c5a42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" type="button" onClick={retry}>Reintentar</button>
      </Surface>
    )
  }

  return (
    <div className="grid gap-5">
      {matchNotice && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#75633b]" role="status">{matchNotice}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Surface className="flex items-center justify-between gap-4">
          <div>
            <p className="m-0 text-sm text-[#718075]">Oportunidades vigentes</p>
            <p className="m-0 mt-2 font-display text-3xl font-bold text-[#1c4033]">{opportunities.length}</p>
          </div>
          <span className="grid size-11 place-items-center rounded-xl bg-[#edf5e9] text-[#347a57]" aria-hidden="true">↗</span>
        </Surface>
        <Surface className="flex items-center justify-between gap-4">
          <div>
            <p className="m-0 text-sm text-[#718075]">Cumples todos los requisitos</p>
            <p className="m-0 mt-2 font-display text-3xl font-bold text-[#1c4033]">{matchNotice ? '—' : compatibleCount}</p>
          </div>
          <span className="grid size-11 place-items-center rounded-xl bg-[#e4f2e5] text-[#347a57]" aria-hidden="true">✓</span>
        </Surface>
      </div>

      {featuredOpportunity ? (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.8fr)]">
          <div className="grid gap-3">
            <h2 className="m-0 text-sm font-semibold text-[#51675a]">Tu oportunidad con mayor compatibilidad</h2>
            <OpportunityMatchCard opportunity={featuredOpportunity} maxRequirements={3} />
            {opportunities.length > 1 && <a className="inline-flex min-h-10 items-center gap-2 justify-self-start text-sm font-semibold text-[#246b4a] underline-offset-4 hover:underline" href="/app/oportunidades">Explorar las {opportunities.length} oportunidades <span aria-hidden="true">→</span></a>}
          </div>

          <div className="grid gap-5">
            <Surface>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="m-0 text-sm font-semibold text-[#66776b]">Siguiente paso</p>
                  {missingRequirement ? (
                    <>
                      <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-[#1c4033]">Completar {missingRequirement.required}</h2>
                      <p className="mt-3 text-sm leading-6 text-[#66776b]">Es el requisito que falta para <strong>{featuredOpportunity.title}</strong>.</p>
                      {suggestedCourse && <p className="mt-3 rounded-xl bg-[#f4f8f3] p-3 text-sm text-[#526b5a]">Curso sugerido: <strong className="text-[#365340]">{suggestedCourse.title}</strong></p>}
                    </>
                  ) : featuredOpportunity.match?.total === 0 ? (
                    <>
                      <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-[#1c4033]">Requisitos por completar</h2>
                      <p className="mt-3 text-sm leading-6 text-[#66776b]">La institución todavía no publicó requisitos obligatorios para esta oportunidad.</p>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-[#1c4033]">Explora tus opciones</h2>
                      <p className="mt-3 text-sm leading-6 text-[#66776b]">Consulta las convocatorias y sus fuentes oficiales.</p>
                    </>
                  )}
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf4e8] text-[#36724d]" aria-hidden="true">↗</span>
              </div>
              <a className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#246b4a] underline-offset-4 hover:underline" href={suggestedCourse ? '/app/cursos' : '/app/oportunidades'}>
                {suggestedCourse ? 'Revisar cursos' : 'Ver oportunidades'} <span aria-hidden="true">→</span>
              </a>
            </Surface>

            <Surface className="bg-[#f8faf6]">
              <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-[#1c4033]">Cómo se calcula el match</h2>
              <p className="mt-2 text-sm leading-6 text-[#66776b]">Se comparan los requisitos obligatorios con tu perfil y tus credenciales. La institución decide la postulación; el porcentaje no garantiza aceptación.</p>
            </Surface>
          </div>
        </div>
      ) : (
        <Surface className="py-9 text-center">
          <h2 className="font-display text-xl font-semibold text-[#1c4033]">Todavía no hay oportunidades vigentes</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#718075]">Cuando una organización verificada publique una convocatoria vigente, aparecerá aquí junto a su fuente oficial.</p>
          <a className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d8e2d7] px-4 text-sm font-semibold text-[#246b4a]" href="/app/oportunidades">Explorar oportunidades</a>
        </Surface>
      )}
    </div>
  )
}

export default SummaryPage
