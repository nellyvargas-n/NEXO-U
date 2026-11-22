import { apiRequest } from '../../shared/api/client.ts'

export interface CompanyOrganization {
  id: number
  name: string
  verified: boolean
}

export interface CompanyCourse {
  id: number
  title: string
  organization_id: number
  end_date: string
  cost_bob: number
  credential_kind: string
  credential_value: string
  credential_level: string | null
  organization: CompanyOrganization | null
}

export interface CompanyCourseData {
  organizations: CompanyOrganization[]
  courses: CompanyCourse[]
}

export interface CompanyCourseEnrollment {
  enrollment_id: number
  student_user_id: number
  student_name: string
  profile_type: 'colegial' | 'universitario' | string
  completed: boolean
  validation_status: 'validado' | 'pendiente' | string
}

export async function getCompanyCourseData(): Promise<CompanyCourseData> {
  const [organizationsResult, coursesResult] = await Promise.allSettled([
    apiRequest<CompanyOrganization[]>('v1/empresa/organizaciones'),
    apiRequest<Omit<CompanyCourse, 'organization'>[]>('v1/empresa/cursos'),
  ])

  if (organizationsResult.status === 'rejected') throw organizationsResult.reason
  if (coursesResult.status === 'rejected') throw coursesResult.reason

  const organizations = organizationsResult.value
  const courses = coursesResult.value
  const organizationsById = new Map(organizations.map((organization) => [organization.id, organization]))
  return {
    organizations,
    courses: courses.map((course) => ({
      ...course,
      organization: organizationsById.get(course.organization_id) ?? null,
    })),
  }
}

export function getCompanyCourseEnrollments(courseId: number): Promise<CompanyCourseEnrollment[]> {
  return apiRequest<CompanyCourseEnrollment[]>(`v1/empresa/cursos/${courseId}/inscripciones?limit=200&offset=0`)
}

export interface CourseValidationResult {
  status: 'completed' | 'already_completed' | string
  student_user_id?: number
  course_id?: number
}

export function validateCourseCompletion(courseId: number, studentUserId: number): Promise<CourseValidationResult> {
  return apiRequest<CourseValidationResult>(`v1/empresa/cursos/${courseId}/validar`, {
    method: 'POST',
    body: JSON.stringify({ student_user_id: studentUserId }),
  })
}
