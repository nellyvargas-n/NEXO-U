import Surface from '../student-app/components/Surface.jsx'
import CourseCard from '../courses/components/CourseCard.jsx'
import { useCourses } from '../courses/useCourses.js'

function isEnglishB1(course) {
  return course.credential_kind === 'language'
    && course.credential_level?.toUpperCase() === 'B1'
    && /ingl[eé]s|english/i.test(course.credential_value)
}

function CourseDetailPage() {
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
    retry,
  } = useCourses()
  const requestedCourseId = new URLSearchParams(window.location.search).get('course')
  const selectedCourse = requestedCourseId
    ? courses.find((course) => course.id === Number(requestedCourseId) && isEnglishB1(course))
    : courses.find((course) => isEnglishB1(course) && course.recommended) ?? courses.find(isEnglishB1)

  if (isLoading) {
    return <Surface className="max-w-4xl"><p className="m-0 py-4 text-sm text-[#8595a9]" role="status">Cargando el curso público…</p></Surface>
  }

  if (error) {
    return (
      <Surface className="max-w-4xl">
        <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{error}</p>
        <button className="mt-4 min-h-11 rounded-xl border border-[#dfe8f5] px-4 text-sm font-semibold text-[#2475e2]" type="button" onClick={retry}>Reintentar</button>
      </Surface>
    )
  }

  return (
    <div className="grid max-w-5xl gap-5">
      {matchNotice && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#75633b]" role="status">{matchNotice}</p>}
      {enrollmentNotice && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#75633b]" role="status">{enrollmentNotice}</p>}

      {selectedCourse ? (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
          <CourseCard
            course={selectedCourse}
            enrollmentAction={enrollmentAction}
            enrollmentFeedback={enrollmentFeedback}
            enrollingCourseId={enrollingCourseId}
            onEnroll={enroll}
          />
          <div className="grid gap-5">
            <Surface>
              <h2 className="font-display text-lg font-semibold text-[#1d3557]">Credencial que ofrece</h2>
              <p className="mt-2 text-sm leading-6 text-[#7b8da5]">{selectedCourse.credential_value} · nivel {selectedCourse.credential_level}. Se verifica al confirmar la finalización.</p>
            </Surface>
            <Surface className="bg-[#f8faf6]">
              <h2 className="font-display text-lg font-semibold text-[#1d3557]">Después de inscribirte</h2>
              <p className="mt-2 text-sm leading-6 text-[#7b8da5]">La organización emisora confirma la finalización y valida la credencial.</p>
            </Surface>
          </div>
        </div>
      ) : (
        <Surface className="py-9 text-center">
          <h2 className="font-display text-xl font-semibold text-[#1d3557]">No hay un curso público de Inglés B1 vigente</h2>
          <a className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#dfe8f5] px-4 text-sm font-semibold text-[#246b4a]" href="/app/cursos">Explorar cursos públicos</a>
        </Surface>
      )}
    </div>
  )
}

export default CourseDetailPage
