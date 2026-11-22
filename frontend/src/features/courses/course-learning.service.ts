import { apiRequest } from '../../shared/api/client.ts'

export interface CourseLesson {
  id: number
  position: number
  title: string
  body: string
  completed: boolean
}

export interface CourseLearningContent {
  course: {
    id: number
    title: string
    credential_kind: string
    credential_value: string
    completed: boolean
  }
  lessons: CourseLesson[]
}

export function getCourseLearningContent(courseId: number): Promise<CourseLearningContent> {
  return apiRequest<CourseLearningContent>(`v1/usuario/cursos/${courseId}/contenido`)
}

export function completeCourseLesson(courseId: number, lessonId: number): Promise<{ completed: boolean }> {
  return apiRequest<{ completed: boolean }>(`v1/usuario/cursos/${courseId}/lecciones/${lessonId}/completar`, {
    method: 'POST',
    body: JSON.stringify({ completed: true }),
  })
}

export function finishCourse(courseId: number): Promise<{ status: string; credential: { kind: string; value: string; verified: boolean } }> {
  return apiRequest(`v1/usuario/cursos/${courseId}/finalizar`, { method: 'POST' })
}
