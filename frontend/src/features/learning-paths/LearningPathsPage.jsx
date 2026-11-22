import Surface from '../student-app/components/Surface.jsx'
import CourseCard from '../courses/components/CourseCard.jsx'
import { useCourses } from '../courses/useCourses.js'

function isEnglishB1(course) {
  return course.credential_kind === 'language'
    && course.credential_level?.toUpperCase() === 'B1'
    && /ingl[eé]s|english/i.test(course.credential_value)
}

function LearningPathsPage() {
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
  const recommendedCourses = courses.filter((course) => course.recommended)

  if (isLoading) {
    return <Surface className="max-w-4xl"><p className="m-0 py-4 text-sm text-[#8595a9]" role="status">Buscando cursos que cubran requisitos pendientes…</p></Surface>
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
      <Surface className="bg-[#f8faf6]">
        <p className="m-0 text-sm font-semibold text-[#3a7653]">Rutas para requisitos pendientes</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-[#1d3557]">Cursos sugeridos por tus oportunidades</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7b8da5]">Las sugerencias vienen del motor de matching y solo se muestran aquí si el curso también está publicado en el catálogo público.</p>
      </Surface>

      {matchNotice && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#75633b]" role="status">{matchNotice}</p>}
      {enrollmentNotice && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#75633b]" role="status">{enrollmentNotice}</p>}

      {recommendedCourses.length > 0 ? (
        <div className="grid gap-4">
          {recommendedCourses.map((course) => (
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
          <h2 className="font-display text-xl font-semibold text-[#1d3557]">No hay una ruta pública sugerida todavía</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#8595a9]">Cuando el matching encuentre un requisito pendiente que pueda cubrir un curso público, la recomendación aparecerá aquí.</p>
          <a className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#dfe8f5] px-4 text-sm font-semibold text-[#246b4a]" href="/app/cursos">Explorar el catálogo</a>
        </Surface>
      )}
    </div>
  )
}

export default LearningPathsPage
