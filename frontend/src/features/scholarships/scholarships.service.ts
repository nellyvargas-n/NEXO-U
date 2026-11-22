import { apiRequest } from '../../shared/api/client.ts'
import type { PublicOpportunity } from '../opportunities/opportunities.service.ts'

export interface ScholarshipSimulationCriterion {
  discount_percent: number
  minimum_average: string | number
  minimum_math: string | number
  meets: boolean
  official_url: string
}

export interface ScholarshipSimulation {
  status: 'compatible' | 'no_compatible' | 'sin_estimacion' | string
  discount_percent: number | null
  message: string
  criteria?: ScholarshipSimulationCriterion[]
}

export type PublicScholarship = PublicOpportunity

export function getPublicScholarships(): Promise<PublicScholarship[]> {
  return apiRequest<PublicOpportunity[]>('v1/oportunidades/publicas?limit=100').then((opportunities) =>
    opportunities.filter((opportunity) => ['beca', 'scholarship'].includes(opportunity.category.toLocaleLowerCase())),
  )
}

export function simulateScholarship(opportunityId: number): Promise<ScholarshipSimulation> {
  return apiRequest<ScholarshipSimulation>(`v1/usuario/becas/${opportunityId}/simular`)
}
