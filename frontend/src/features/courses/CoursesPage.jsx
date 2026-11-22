import Surface from '../student-app/components/Surface.jsx'
import CourseCard from './components/CourseCard.jsx'
import { useCourses } from './useCourses.js'

function isEnglishB1(course) {
  return course.credential_kind === 'language'
    && course.credential_level?.toUpperCase() === 'B1'
    && /ingl[eé]s|english/i.test(course.credential_value)
}

function CoursesPage() {
  const {
    courses,
    matchNotice,
    enrollmentNotice,
    enrollmentAction,
    isLoading,
    error,
    enrollingCourseId,
    enrollmentFeedback,
    enroll,
  } = useCourses()
  const sortedCourses = [...courses].sort((left, right) => Number(right.recommended) - Number(left.recommended))
  const hasPlatformCourses = sortedCourses.some((course) => !course.is_curated)

  if (isLoading) {
    return <Surface className="max-w-4xl"><p className="m-0 py-4 text-sm text-[#8595a9]" role="status">Cargando cursos públicos…</p></Surface>
  }

  if (error) {
    return (
      <Surface className="max-w-4xl">
        <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>
      </Surface>
    )
  }

  return (
    <div className="grid max-w-5xl gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 font-display text-xl font-semibold text-[#1d3557]">{courses.length} {courses.length === 1 ? 'curso disponible' : 'cursos disponibles'}</h2>
        </div>
      </div>

      {matchNotice && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#75633b]" role="status">{matchNotice}</p>}
      {enrollmentNotice && hasPlatformCourses && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#75633b]" role="status">{enrollmentNotice}</p>}

      {sortedCourses.length > 0 ? (
        <div className="grid gap-4">
          {sortedCourses.map((course) => (
            <CourseCard
              course={course}
              detailHref={isEnglishB1(course) ? `/app/rutas/ingles-b1?course=${course.id}` : undefined}
              enrollmentAction={enrollmentAction}
              enrollmentFeedback={enrollmentFeedback}
              enrollingCourseId={enrollingCourseId}
              key={course.id}
              onEnroll={enroll}
            />
          ))}
        </div>
      ) : (
        <Surface className="py-9 text-center">
          <h2 className="font-display text-xl font-semibold text-[#1d3557]">No hay cursos públicos vigentes</h2>
        </Surface>
      )}
    </div>
  )
}

export default CoursesPage
