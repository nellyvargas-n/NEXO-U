import { ApiError, apiRequest } from '../../shared/api/client.ts'
import type { OpportunityMatch, PublicOpportunity } from '../opportunities/opportunities.service.ts'

export interface PublicCourse {
  id: number
  title: string
  start_date: string | null
  end_date: string | null
  cost_bob: number
  credential_kind: 'skill' | 'language' | 'certificate' | string
  credential_value: string
  credential_level: string | null
  organization: string
  sponsored: boolean
  is_curated: boolean
  source_kind: string | null
  source_url: string | null
  source_checked_on: string | null
  official_url: string | null
  summary: string | null
}

export interface CourseEnrollment {
  id: number
  course_id: number
  completed: boolean
}

export interface CourseWithStatus extends PublicCourse {
  enrollment: CourseEnrollment | null
  recommended: boolean
}

export interface CourseData {
  courses: CourseWithStatus[]
  matchNotice: string
  enrollmentNotice: string
  enrollmentAction: 'ready' | 'login' | 'profile' | 'unavailable'
}

function getMatchNotice(error: unknown): string {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return 'Inicia sesión con una cuenta de estudiante para recibir recomendaciones personalizadas.'
  if (error instanceof ApiError && error.status === 404) return 'Completa tu perfil académico para calcular tu compatibilidad.'
  if (error instanceof TypeError) return 'No pudimos conectar con el servicio de recomendaciones.'
  return error instanceof Error ? error.message : 'No se pudieron consultar las recomendaciones.'
}

function getEnrollmentAccess(error: unknown): Pick<CourseData, 'enrollmentNotice' | 'enrollmentAction'> {
  if (error instanceof ApiError && error.status === 401) {
    return { enrollmentNotice: 'Inicia sesión con tu cuenta de estudiante para inscribirte.', enrollmentAction: 'login' }
  }
  if (error instanceof ApiError && error.status === 404) {
    return { enrollmentNotice: 'Completa tu perfil académico antes de inscribirte.', enrollmentAction: 'profile' }
  }
  if (error instanceof TypeError) {
    return { enrollmentNotice: 'No pudimos consultar tus inscripciones. Vuelve a intentarlo antes de inscribirte.', enrollmentAction: 'unavailable' }
  }
  return {
    enrollmentNotice: error instanceof Error ? error.message : 'No se pudieron consultar tus inscripciones.',
    enrollmentAction: 'unavailable',
  }
}

export async function getCourseData(): Promise<CourseData> {
  const [coursesResult, enrollmentsResult, matchesResult, opportunitiesResult] = await Promise.allSettled([
    apiRequest<PublicCourse[]>('v1/cursos/publicos'),
    apiRequest<CourseEnrollment[]>('v1/usuario/inscripciones'),
    apiRequest<OpportunityMatch[]>('v1/usuario/match'),
    apiRequest<PublicOpportunity[]>('v1/oportunidades/publicas'),
  ])

  if (coursesResult.status === 'rejected') throw coursesResult.reason

  const enrollments = enrollmentsResult.status === 'fulfilled' ? enrollmentsResult.value : []
  const enrollmentByCourseId = new Map(enrollments.map((enrollment) => [enrollment.course_id, enrollment]))
  const recommendedIds = new Set<number>()
  const publicOpportunityIds = new Set(
    opportunitiesResult.status === 'fulfilled' ? opportunitiesResult.value.map((opportunity) => opportunity.id) : [],
  )

  if (matchesResult.status === 'fulfilled' && opportunitiesResult.status === 'fulfilled') {
    for (const match of matchesResult.value) {
      if (!publicOpportunityIds.has(match.opportunity_id)) continue
      for (const requirement of match.requirements) {
        if (requirement.status !== 'falta') continue
        for (const course of requirement.courses) recommendedIds.add(course.id)
      }
    }
  }

  return {
    courses: coursesResult.value.map((course) => ({
      ...course,
      enrollment: enrollmentByCourseId.get(course.id) ?? null,
      recommended: recommendedIds.has(course.id),
    })),
    matchNotice: matchesResult.status === 'rejected'
      ? getMatchNotice(matchesResult.reason)
      : opportunitiesResult.status === 'rejected'
        ? 'No pudimos comprobar qué oportunidades están vigentes; las rutas personalizadas están ocultas por ahora.'
        : '',
    ...(enrollmentsResult.status === 'rejected' ? getEnrollmentAccess(enrollmentsResult.reason) : {
      enrollmentNotice: '',
      enrollmentAction: 'ready' as const,
    }),
  }
}

export async function enrollInCourse(courseId: number): Promise<Omit<CourseEnrollment, 'course_id'>> {
  return apiRequest<Omit<CourseEnrollment, 'course_id'>>(`v1/usuario/cursos/${courseId}/inscribir`, {
    method: 'POST',
  })
}

export function getEnrollmentError(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) return 'Inicia sesión con tu cuenta de estudiante para inscribirte.'
  if (error instanceof ApiError && error.status === 404) return 'No se encontró el curso, no está vigente o falta completar tu perfil.'
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor. Inténtalo otra vez.'
  return error instanceof Error ? error.message : 'No se pudo completar la inscripción.'
}
