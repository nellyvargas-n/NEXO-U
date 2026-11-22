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
  credential_level?: string | null
  organization: CompanyOrganization | null
}

export interface CompanyCourseData {
  organizations: CompanyOrganization[]
  courses: CompanyCourse[]
}

export async function getCompanyCourseData(): Promise<CompanyCourseData> {
  const [organizationsResult, coursesResult, publicCoursesResult] = await Promise.allSettled([
    apiRequest<CompanyOrganization[]>('v1/empresa/organizaciones'),
    apiRequest<Omit<CompanyCourse, 'organization'>[]>('v1/empresa/cursos'),
    apiRequest<Array<{ id: number; credential_level: string | null }>>('v1/cursos/publicos'),
  ])

  if (organizationsResult.status === 'rejected') throw organizationsResult.reason
  if (coursesResult.status === 'rejected') throw coursesResult.reason

  const organizations = organizationsResult.value
  const courses = coursesResult.value
  const publicLevelByCourseId = new Map<number, string | null>()
  if (publicCoursesResult.status === 'fulfilled') {
    for (const course of publicCoursesResult.value) {
      publicLevelByCourseId.set(course.id, course.credential_level)
    }
  }

  const organizationsById = new Map(organizations.map((organization) => [organization.id, organization]))
  return {
    organizations,
    courses: courses.map((course) => ({
      ...course,
      credential_level: course.credential_level ?? publicLevelByCourseId.get(course.id) ?? null,
      organization: organizationsById.get(course.organization_id) ?? null,
    })),
  }
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
