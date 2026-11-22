import Surface from '../student-app/components/Surface.jsx'
import OpportunityMatchCard from './components/OpportunityMatchCard.jsx'
import { sortOpportunitiesByMatch } from './opportunities.service.ts'
import { useOpportunityFeed } from './useOpportunityFeed.js'

function OpportunitiesPage() {
  const { opportunities, matchNotice, isLoading, error, retry } = useOpportunityFeed()
  const rankedOpportunities = sortOpportunitiesByMatch(opportunities)

  if (isLoading) {
    return <Surface className="max-w-4xl"><p className="m-0 py-4 text-sm text-[#718075]" role="status">Cargando oportunidades públicas…</p></Surface>
  }

  if (error) {
    return (
      <Surface className="max-w-4xl">
        <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>
        <button className="mt-4 min-h-11 rounded-xl border border-[#d8e2d7] px-4 text-sm font-semibold text-[#1c5a42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" type="button" onClick={retry}>Reintentar</button>
      </Surface>
    )
  }

  return (
    <div className="grid max-w-4xl gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-sm text-[#718075]">Convocatorias vigentes de organizaciones verificadas</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#1c4033]">{opportunities.length} {opportunities.length === 1 ? 'oportunidad disponible' : 'oportunidades disponibles'}</h2>
        </div>
        <button className="min-h-10 rounded-xl border border-[#d8e2d7] px-4 text-sm font-semibold text-[#1c5a42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" type="button" onClick={retry}>Actualizar</button>
      </div>

      {matchNotice && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#75633b]" role="status">{matchNotice}</p>}

      {rankedOpportunities.length > 0 ? (
        <div className="grid gap-4">
          {rankedOpportunities.map((opportunity) => <OpportunityMatchCard key={opportunity.id} opportunity={opportunity} />)}
        </div>
      ) : (
        <Surface className="py-9 text-center">
          <h2 className="font-display text-xl font-semibold text-[#1c4033]">No hay convocatorias vigentes</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#718075]">Las oportunidades aparecen cuando una organización verificada publica una convocatoria con una fecha de cierre vigente.</p>
          <button className="mt-4 min-h-10 rounded-xl border border-[#d8e2d7] px-4 text-sm font-semibold text-[#246b4a]" type="button" onClick={retry}>Volver a buscar</button>
        </Surface>
      )}
    </div>
  )
}

export default OpportunitiesPage
