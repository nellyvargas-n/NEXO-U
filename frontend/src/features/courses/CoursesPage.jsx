import Surface from '../student-app/components/Surface.jsx'
import CourseCardWithEnrollment from './components/CourseCardWithEnrollment.jsx'
import { useCourses } from './useCourses.js'

function isEnglishB1(course) {
  return course.credential_kind === 'language'
    && course.credential_level?.toUpperCase() === 'B1'
    && /ingl[eé]s|english/i.test(course.credential_value)
}

function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
}

function matchesSkill(course, search) {
  if (!search) return true
  const searchable = normalize([course.title, course.credential_value, course.credential_level, course.organization].join(' '))
  return normalize(search).split(/\s+/).filter(Boolean).every((word) => searchable.includes(word))
}

function requiresPlatformCheckout(course) {
  const externalRegistration = course.is_curated && (course.official_url || course.source_url)
  return Number(course.cost_bob) > 0 && !externalRegistration
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
    refreshNow,
  } = useCourses()
  const query = new URLSearchParams(window.location.search)
  const requestedCourseId = Number(query.get('course')) || null
  const skillSearch = query.get('skill')?.trim() ?? ''
  const selectedCourse = courses.find((course) => course.id === requestedCourseId) ?? null
  const sortedCourses = [...courses].sort((left, right) => (
    Number(right.id === requestedCourseId) - Number(left.id === requestedCourseId)
    || Number(right.recommended) - Number(left.recommended)
  ))
  const visibleCourses = sortedCourses.filter((course) => (
    (!skillSearch || matchesSkill(course, skillSearch) || course.id === requestedCourseId)
  ))
  const hasPlatformCourses = sortedCourses.some((course) => !course.is_curated)
  const hasInternalPaidCourses = sortedCourses.some(requiresPlatformCheckout)

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
      {enrollmentNotice && (hasPlatformCourses || hasInternalPaidCourses) && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm leading-5 text-[#75633b]" role="status">{enrollmentNotice}</p>}

      {skillSearch && <div className="rounded-xl border border-[#dce9da] bg-[#f4f8f1] px-4 py-3 text-sm text-[#405c49]">Cursos para desarrollar: <strong>{skillSearch}</strong></div>}
      {requestedCourseId && !selectedCourse && <p className="m-0 rounded-xl border border-[#e8dfbd] bg-[#fff9e9] px-4 py-3 text-sm text-[#75633b]" role="status">El curso sugerido ya no aparece en el catálogo. Revisa otras opciones para esta habilidad.</p>}

      {visibleCourses.length > 0 ? (
        <div className="grid gap-4">
          {visibleCourses.map((course) => {
            return (
              <div className={`grid gap-3 rounded-2xl ${course.id === requestedCourseId ? 'ring-2 ring-[#70ae82] ring-offset-2' : ''}`} id={`course-${course.id}`} key={course.id}>
                {course.id === requestedCourseId && <p className="m-0 text-sm font-semibold text-[#39704d]">Este curso cubre el requisito pendiente.</p>}
                <CourseCardWithEnrollment
                  course={course}
                  detailHref={isEnglishB1(course) ? `/app/rutas/ingles-b1?course=${course.id}` : undefined}
                  enrollmentAction={enrollmentAction}
                  enrollmentFeedback={enrollmentFeedback}
                  enrollingCourseId={enrollingCourseId}
                  onEnroll={enroll}
                  onRefresh={refreshNow}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <Surface className="py-9 text-center">
          <h2 className="font-display text-xl font-semibold text-[#1d3557]">{skillSearch ? `No hay cursos públicos para ${skillSearch}` : 'No hay cursos públicos vigentes'}</h2>
          {skillSearch && <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#687b70]">Refuerza esta habilidad con material de aprendizaje y actualiza tu perfil para volver a calcular tu compatibilidad.</p>}
          {skillSearch && <a className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#dfe8f5] px-4 text-sm font-semibold text-[#246b4a]" href="/app/cursos">Ver todos los cursos</a>}
        </Surface>
      )}
    </div>
  )
}

export default CoursesPage
