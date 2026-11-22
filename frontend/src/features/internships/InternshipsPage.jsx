import Surface from '../student-app/components/Surface.jsx'
import OpportunityMatchCard from '../opportunities/components/OpportunityMatchCard.jsx'
import { sortOpportunitiesByMatch } from '../opportunities/opportunities.service.ts'
import { useOpportunityFeed } from '../opportunities/useOpportunityFeed.js'

function isInternship(category) {
  const normalizedCategory = String(category ?? '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return normalizedCategory === 'pasantia' || normalizedCategory === 'internship'
}

function InternshipsPage() {
  const { opportunities, matchNotice, isLoading, error } = useOpportunityFeed()
  const internships = sortOpportunitiesByMatch(opportunities.filter((opportunity) => isInternship(opportunity.category)))

  if (isLoading) {
    return <Surface className="max-w-4xl"><p className="m-0 py-4 text-sm text-[#8595a9]" role="status">Cargando pasantías públicas…</p></Surface>
  }

  if (error) {
    return (
      <Surface className="max-w-4xl">
        <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>
      </Surface>
    )
  }

  return (
    <div className="grid max-w-4xl gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 font-display text-xl font-semibold text-[#1d3557]">{internships.length} {internships.length === 1 ? 'pasantía disponible' : 'pasantías disponibles'}</h2>
        </div>
      </div>

      {matchNotice && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#75633b]" role="status">{matchNotice}</p>}

      {internships.length > 0 ? (
        <div className="grid gap-4">
          {internships.map((opportunity) => <OpportunityMatchCard key={opportunity.id} opportunity={opportunity} />)}
        </div>
      ) : (
        <Surface className="py-9 text-center">
          <h2 className="font-display text-xl font-semibold text-[#1d3557]">No hay pasantías vigentes</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a className="inline-flex min-h-10 items-center rounded-xl border border-[#dfe8f5] px-4 text-sm font-semibold text-[#246b4a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2876d7]" href="/app/oportunidades">Ver todas las oportunidades</a>
          </div>
        </Surface>
      )}
    </div>
  )
}

export default InternshipsPage
