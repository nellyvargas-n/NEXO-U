import { useEffect, useState } from 'react'
import { FiArrowUpRight, FiCheck, FiCircle, FiLock } from 'react-icons/fi'
import { ApiError, apiRequest } from '../../shared/api/client.ts'
import { finishCourse, completeCourseLesson, getCourseLearningContent } from './course-learning.service.ts'

function getMessage(error) {
  if (error instanceof ApiError && error.status === 401) return 'Inicia sesión para abrir este curso.'
  if (error instanceof ApiError && error.status === 403) return error.message
  return error instanceof Error ? error.message : 'No se pudo cargar el curso.'
}

function CourseLearningPage() {
  const courseId = Number(new URLSearchParams(window.location.search).get('course'))
  const [content, setContent] = useState(null)
  const [matches, setMatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyLesson, setBusyLesson] = useState(null)
  const [isFinishing, setIsFinishing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    async function loadCourse() {
      try {
        if (!Number.isInteger(courseId) || courseId < 1) throw new Error('No se encontró el curso solicitado.')
        const result = await getCourseLearningContent(courseId)
        if (isCurrent) {
          setContent(result)
          setError('')
        }
      } catch (loadError) {
        if (isCurrent) setError(getMessage(loadError))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }
    loadCourse()
    return () => { isCurrent = false }
  }, [courseId])

  const completedLessons = content?.lessons.filter((lesson) => lesson.completed).length ?? 0
  const totalLessons = content?.lessons.length ?? 0
  const allLessonsComplete = totalLessons > 0 && completedLessons === totalLessons
  const progress = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  async function handleCompleteLesson(lesson) {
    setBusyLesson(lesson.id)
    setError('')
    try {
      await completeCourseLesson(courseId, lesson.id)
      setContent((current) => current && ({
        ...current,
        lessons: current.lessons.map((item) => item.id === lesson.id ? { ...item, completed: !item.completed } : item),
      }))
    } catch (lessonError) {
      setError(getMessage(lessonError))
    } finally {
      setBusyLesson(null)
    }
  }

  async function handleFinish() {
    if (!allLessonsComplete) return
    setIsFinishing(true)
    setError('')
    try {
      await finishCourse(courseId)
      const [courseResult, matchResult] = await Promise.allSettled([
        getCourseLearningContent(courseId),
        apiRequest('v1/usuario/match'),
      ])
      if (courseResult.status === 'fulfilled') setContent(courseResult.value)
      if (matchResult.status === 'fulfilled') setMatches(matchResult.value)
    } catch (finishError) {
      setError(getMessage(finishError))
    } finally {
      setIsFinishing(false)
    }
  }

  if (isLoading) return <p className="m-0 max-w-4xl py-6 text-sm text-[#687b70]" role="status">Cargando el curso…</p>
  if (!content) return <div className="max-w-3xl rounded-2xl border border-[#f1c3c0] bg-[#fff4f2] p-5 text-sm text-[#9b302a]" role="alert">{error}</div>

  const metMatches = matches.flatMap((match) => (match.requirements ?? [])
    .filter((requirement) => requirement.kind === content.course.credential_kind
      && requirement.required.localeCompare(content.course.credential_value, undefined, { sensitivity: 'accent' }) === 0
      && requirement.status === 'cumple')
    .map(() => match))
  const updatedMatches = [...new Map(metMatches.map((match) => [match.opportunity_id, match])).values()]

  return (
    <div className="grid max-w-4xl gap-5">
      <section className="rounded-2xl border border-[#e0e9de] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.12em] text-[#2876d7]">CURSO</p>
            <h1 className="mb-0 mt-2 font-display text-2xl font-semibold text-[#1d3557]">{content.course.title}</h1>
            <p className="mb-0 mt-2 text-sm text-[#687b70]">Habilidad: {content.course.credential_value}</p>
          </div>
          {content.course.completed && <span className="rounded-full bg-[#eaf3e9] px-3 py-1.5 text-xs font-semibold text-[#39704d]">Completado</span>}
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-[#687b70]"><span>Progreso</span><span>{completedLessons} de {totalLessons} lecciones</span></div>
          <div aria-label="Progreso del curso" aria-valuemax="100" aria-valuemin="0" aria-valuenow={progress} className="h-2 overflow-hidden rounded-full bg-[#e6eee5]" role="progressbar"><div className="h-full rounded-full bg-[#39855e] transition-[width]" style={{ width: `${progress}%` }} /></div>
        </div>
      </section>

      {error && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm text-[#9b302a]" role="alert">{error}</p>}

      {content.lessons.map((lesson) => (
        <article className="rounded-2xl border border-[#e0e9de] bg-white p-5 sm:p-6" key={lesson.id}>
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${lesson.completed ? 'bg-[#eaf3e9] text-[#328052]' : 'bg-[#f1f5ef] text-[#78887c]'}`}>
              {lesson.completed ? <FiCheck aria-hidden="true" /> : <FiCircle aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[#7b897e]">Lección {lesson.position}</p>
              <h2 className="mb-0 mt-1 font-display text-lg font-semibold text-[#1d3557]">{lesson.title}</h2>
              <p className="mb-0 mt-3 whitespace-pre-line text-sm leading-7 text-[#52685a]">{lesson.body}</p>
              {!content.course.completed && <button className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#d8e4d7] px-4 text-sm font-semibold text-[#246b4a] disabled:opacity-60" disabled={busyLesson !== null} onClick={() => handleCompleteLesson(lesson)} type="button">
                {busyLesson === lesson.id ? 'Guardando…' : lesson.completed ? 'Marcar como pendiente' : 'Marcar lección como completada'}
              </button>}
            </div>
          </div>
        </article>
      ))}

      {!content.course.completed && <section className="rounded-2xl border border-[#e0e9de] bg-[#f8faf7] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {allLessonsComplete ? <FiCheck className="mt-1 shrink-0 text-[#328052]" /> : <FiLock className="mt-1 shrink-0 text-[#8595a9]" />}
            <div><h2 className="m-0 text-base font-semibold text-[#1d3557]">Finaliza el curso</h2><p className="mb-0 mt-1 text-sm text-[#687b70]">{allLessonsComplete ? 'Completarlo añadirá la habilidad a tu perfil.' : 'Completa todas las lecciones para continuar.'}</p></div>
          </div>
          <button className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#1d684d] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!allLessonsComplete || isFinishing} onClick={handleFinish} type="button">
            {isFinishing ? 'Finalizando…' : 'Finalizar curso'}
          </button>
        </div>
      </section>}

      {content.course.completed && <section className="grid gap-4 rounded-2xl border border-[#d5e8d3] bg-[#f1f8ec] p-5">
        <div><h2 className="m-0 font-display text-lg font-semibold text-[#365f43]">Habilidad añadida a tu perfil</h2><p className="mb-0 mt-1 text-sm text-[#52685a]">{content.course.credential_value} ya está disponible en tus credenciales y en el cálculo de compatibilidad.</p></div>
        <div className="flex flex-wrap gap-3"><a className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#1d684d] px-4 text-sm font-semibold text-white" href="/app/credenciales">Ver habilidades <FiArrowUpRight /></a><a className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#bad3b9] px-4 text-sm font-semibold text-[#246b4a]" href="/app/oportunidades">Ver oportunidades <FiArrowUpRight /></a></div>
        {updatedMatches.length > 0 && <div className="grid gap-2 border-t border-[#d5e8d3] pt-4"><h3 className="m-0 text-sm font-semibold text-[#365f43]">Compatibilidad actualizada</h3>{updatedMatches.map((match) => <div className="flex items-center justify-between gap-4 text-sm text-[#52685a]" key={match.opportunity_id}><span>{match.title}</span><strong className="shrink-0">{match.met}/{match.total} · {match.percent}%</strong></div>)}</div>}
      </section>}
    </div>
  )
}

export default CourseLearningPage
