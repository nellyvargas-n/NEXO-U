import { ApiError, apiRequest } from '../../shared/api/client.ts'

export interface PublicOpportunity {
  id: number
  title: string
  category: 'beca' | 'pasantia' | 'patrocinio' | 'curso' | string
  deadline: string
  official_url: string
  amount_bob: number
  organization: string
  verified_organization: boolean
}

export interface MatchRequirement {
  kind: string
  operator?: string
  required: string
  status: 'cumple' | 'falta' | string
  courses: Array<{
    id: number
    title: string
    ends_on: string
    cost_bob: number
  }>
}

export interface OpportunityMatch {
  opportunity_id: number
  title: string
  deadline: string
  met: number
  total: number
  percent: number
  eligible: boolean
  requirements: MatchRequirement[]
}

export interface OpportunityWithMatch extends PublicOpportunity {
  match: OpportunityMatch | null
}

export interface OpportunityFeed {
  opportunities: OpportunityWithMatch[]
  matchNotice: string
}

function getMatchNotice(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) return 'Inicia sesión con una cuenta de estudiante para calcular tu compatibilidad.'
    if (error.status === 404) return 'Completa tu perfil académico para calcular tu compatibilidad.'
  }

  if (error instanceof TypeError) return 'No pudimos conectar con el servicio de matching. Las oportunidades siguen disponibles.'
  return error instanceof Error ? error.message : 'No se pudo calcular la compatibilidad.'
}

export async function getOpportunityFeed(): Promise<OpportunityFeed> {
  const [publicResult, matchResult] = await Promise.allSettled([
    apiRequest<PublicOpportunity[]>('v1/oportunidades/publicas'),
    apiRequest<OpportunityMatch[]>('v1/usuario/match'),
  ])

  if (publicResult.status === 'rejected') throw publicResult.reason

  const matches = matchResult.status === 'fulfilled' ? matchResult.value : []
  const matchById = new Map(matches.map((match) => [match.opportunity_id, match]))

  return {
    opportunities: publicResult.value.map((opportunity) => ({
      ...opportunity,
      match: matchById.get(opportunity.id) ?? null,
    })),
    matchNotice: matchResult.status === 'rejected' ? getMatchNotice(matchResult.reason) : '',
  }
}

export function sortOpportunitiesByMatch(opportunities: OpportunityWithMatch[]): OpportunityWithMatch[] {
  return [...opportunities].sort((left, right) => {
    const leftPercent = left.match?.total ? left.match.percent : -1
    const rightPercent = right.match?.total ? right.match.percent : -1
    const eligibleOrder = Number(Boolean(right.match?.eligible && right.match.total)) - Number(Boolean(left.match?.eligible && left.match.total))
    return eligibleOrder || rightPercent - leftPercent || left.deadline.localeCompare(right.deadline)
  })
}
