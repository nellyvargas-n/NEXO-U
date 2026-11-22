import { useEffect, useState } from 'react'
import { enrollInCourse, getCourseData, getEnrollmentError } from './courses.service.ts'
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh.js'

function getErrorMessage(error) {
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor. Revisa la conexión e inténtalo otra vez.'
  return error instanceof Error ? error.message : 'No se pudieron cargar los cursos.'
}

export function useCourses() {
  const [data, setData] = useState({ courses: [], matchNotice: '', enrollmentNotice: '', enrollmentAction: 'ready' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const refreshKey = useAutoRefresh()
  const [enrollingCourseId, setEnrollingCourseId] = useState(null)
  const [enrollmentFeedback, setEnrollmentFeedback] = useState({ courseId: null, message: '', isError: false })

  useEffect(() => {
    let isCurrent = true

    getCourseData()
      .then((result) => {
        if (isCurrent) {
          setData(result)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent) setError(getErrorMessage(requestError))
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => { isCurrent = false }
  }, [refreshKey])

  async function enroll(courseId) {
    setEnrollmentFeedback({ courseId: null, message: '', isError: false })
    setEnrollingCourseId(courseId)

    try {
      const result = await enrollInCourse(courseId)
      setData((current) => ({
        ...current,
        courses: current.courses.map((course) => (
          course.id === courseId
            ? { ...course, enrollment: { id: result.id, course_id: courseId, completed: result.completed } }
            : course
        )),
      }))
      setEnrollmentFeedback({
        courseId,
        message: result.completed ? 'Este curso ya figura como completado.' : 'Inscripción registrada en tu cuenta.',
        isError: false,
      })
    } catch (requestError) {
      setEnrollmentFeedback({ courseId, message: getEnrollmentError(requestError), isError: true })
    } finally {
      setEnrollingCourseId(null)
    }
  }

  return {
    ...data,
    isLoading,
    error,
    enrollingCourseId,
    enrollmentFeedback,
    enroll,
  }
}
