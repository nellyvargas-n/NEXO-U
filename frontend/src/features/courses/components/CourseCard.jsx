function formatDate(value) {
  if (!value) return 'Fecha por confirmar'
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return 'Fecha por confirmar'
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(date)
}

function formatCost(value) {
  if (!value || value <= 0) return 'Gratuito'
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(value)
}

function credentialLabel(course) {
  const type = course.credential_kind === 'language' ? 'Idioma' : course.credential_kind === 'certificate' ? 'Certificado' : 'Habilidad'
  return `${type}: ${course.credential_value}${course.credential_level ? ` ${course.credential_level}` : ''}`
}

function CourseCard({ course, onEnroll, enrollingCourseId, enrollmentFeedback, enrollmentAction, detailHref }) {
  const isEnrolling = enrollingCourseId === course.id
  const feedback = enrollmentFeedback?.courseId === course.id ? enrollmentFeedback : null
  const enrollment = course.enrollment

  return (
    <article className="rounded-2xl border border-[#e0e9de] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {course.recommended && <span className="rounded-full bg-[#e4f2e5] px-3 py-1 text-xs font-semibold text-[#39704d]">Recomendado para ti</span>}
            {course.sponsored && <span className="rounded-full bg-[#f4f1e8] px-3 py-1 text-xs font-semibold text-[#837344]">Patrocinio divulgado</span>}
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-[#1d3557]">{course.title}</h3>
          <p className="mt-1 text-sm text-[#8595a9]">{course.organization}</p>
        </div>
        <span className="shrink-0 rounded-xl bg-[#f5f8f3] px-3 py-2 text-sm font-semibold text-[#405c49]">{formatCost(course.cost_bob)}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#edf1eb] pt-4 text-sm text-[#687b70]">
        <span>{credentialLabel(course)}</span>
        <span>Finaliza {formatDate(course.end_date)}</span>
      </div>

      {enrollment && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#eaf3ff] px-3 py-1.5 text-xs font-semibold text-[#39704d]">
          {enrollment.completed ? 'Curso completado' : 'Ya estás inscrito'}
        </p>
      )}

      {feedback && <p className={`mt-3 rounded-xl px-4 py-3 text-sm leading-5 ${feedback.isError ? 'border border-[#f1c3c0] bg-[#fff4f2] text-[#9b302a]' : 'border border-[#d5e8d3] bg-[#f1f8ec] text-[#365f43]'}`} role={feedback.isError ? 'alert' : 'status'}>{feedback.message}</p>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {detailHref ? (
          <a className="inline-flex min-h-10 items-center text-sm font-semibold text-[#246b4a] underline-offset-4 hover:underline" href={detailHref}>Ver ruta <span aria-hidden="true" className="ml-2">→</span></a>
        ) : <span />}
        {!enrollment && enrollmentAction === 'ready' && (
          <button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2475e2] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2475e2] disabled:cursor-wait disabled:opacity-70" type="button" onClick={() => onEnroll(course.id)} disabled={isEnrolling}>
            {isEnrolling ? 'Inscribiendo…' : 'Inscribirme'}
          </button>
        )}
        {!enrollment && enrollmentAction === 'login' && <a className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dfe8f5] px-4 text-sm font-semibold text-[#246b4a]" href="/login">Iniciar sesión</a>}
        {!enrollment && enrollmentAction === 'profile' && <a className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dfe8f5] px-4 text-sm font-semibold text-[#246b4a]" href="/app/perfil">Revisar perfil</a>}
        {!enrollment && enrollmentAction === 'unavailable' && <span className="text-xs font-medium text-[#7b897e]">Inscripción no disponible</span>}
      </div>
    </article>
  )
}

export default CourseCard
