import { useState } from 'react'
import CourseCard from './CourseCard.jsx'
import CourseCheckoutDialog from './CourseCheckoutDialog.jsx'

function courseContentUrl(course) {
  return course.learning_url || course.official_url || course.source_url || ''
}

function requiresPlatformCheckout(course) {
  const externalRegistration = course.is_curated && (course.official_url || course.source_url)
  return Number(course.cost_bob) > 0 && !externalRegistration
}

function CourseCardWithEnrollment({
  course,
  detailHref,
  enrollmentAction,
  enrollmentFeedback,
  enrollingCourseId,
  onEnroll,
  onRefresh,
}) {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [learningUrl, setLearningUrl] = useState('')
  const contentUrl = learningUrl || courseContentUrl(course)
  const needsCheckout = requiresPlatformCheckout(course)
  const cardEnrollmentAction = needsCheckout && enrollmentAction === 'ready' ? 'payment-required' : enrollmentAction

  return (
    <div className="grid gap-3">
      <CourseCard
        course={course}
        detailHref={detailHref}
        enrollmentAction={cardEnrollmentAction}
        enrollmentFeedback={enrollmentFeedback}
        enrollingCourseId={enrollingCourseId}
        onEnroll={onEnroll}
      />

      {!course.enrollment && needsCheckout && enrollmentAction === 'ready' && (
        <button className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#1d684d] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438c61]" onClick={() => setCheckoutOpen(true)} type="button">
          Inscribirme
        </button>
      )}
      {!course.enrollment && needsCheckout && enrollmentAction === 'login' && <a className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dfe8f5] px-4 text-sm font-semibold text-[#246b4a]" href="/login">Iniciar sesión para pagar</a>}
      {!course.enrollment && needsCheckout && enrollmentAction === 'profile' && <a className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dfe8f5] px-4 text-sm font-semibold text-[#246b4a]" href="/app/perfil">Completar perfil para inscribirte</a>}
      {!course.enrollment && needsCheckout && enrollmentAction === 'unavailable' && <p className="m-0 text-sm text-[#7b897e]">No se pudo verificar tu inscripción.</p>}
      {!course.enrollment && !needsCheckout && course.is_curated && !course.official_url && !course.source_url && Number(course.cost_bob) <= 0 && <p className="m-0 text-sm text-[#7b897e]">La institución aún no habilitó la inscripción.</p>}

      {course.enrollment && !course.enrollment.completed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dce9da] bg-[#f5f8f3] px-4 py-3 text-sm text-[#52685a]">
          <span>{contentUrl ? 'Inscripción activa. Continúa tu curso.' : 'Inscripción activa. La institución debe habilitar el contenido.'}</span>
          {contentUrl && <a className="font-semibold text-[#246b4a] underline-offset-4 hover:underline" href={contentUrl} rel="noopener noreferrer" target="_blank">Abrir el curso ↗</a>}
        </div>
      )}
      {course.enrollment?.completed && <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm font-semibold text-[#365f43]">Credencial validada y añadida a tu perfil.</p>}

      {checkoutOpen && <CourseCheckoutDialog course={course} onClose={() => setCheckoutOpen(false)} onPaid={(courseId, url) => {
        if (url) setLearningUrl(url)
        return onRefresh(courseId)
      }} />}
    </div>
  )
}

export default CourseCardWithEnrollment
