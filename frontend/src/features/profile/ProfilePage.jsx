import { useEffect, useState } from 'react'
import { getAccessToken } from '../../shared/api/session.ts'
import Surface from '../student-app/components/Surface.jsx'
import { clearOnboardingDraft, getOnboardingDraft } from './onboardingDraft.ts'
import { getStudentProfiles, saveSchoolProfile, saveUniversityProfile } from './profile.service.ts'

const fieldClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#d8e2d7] bg-white px-4 text-base text-[#253b30] outline-none focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15'

function ProfileField({ id, label, value, onChange, type = 'text', ...inputProps }) {
  return (
    <label className="block text-sm font-semibold text-[#344b3c]" htmlFor={id}>
      {label}
      <input
        {...inputProps}
        className={fieldClass}
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </label>
  )
}

function getErrorMessage(error) {
  if (error instanceof TypeError) return 'No pudimos conectar con el servidor. Revisa la conexión e inténtalo otra vez.'
  return error instanceof Error ? error.message : 'No se pudo cargar el perfil.'
}

function ProfilePage() {
  const [studentType, setStudentType] = useState(null)
  const [hasSavedProfile, setHasSavedProfile] = useState(false)
  const [university, setUniversity] = useState({ name: '', career: '', semester: '', age: '', city: '' })
  const [school, setSchool] = useState({ full_name: '', city: '', graduation_year: '', average_grade: '', math_grade: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadProfile() {
      setIsLoading(true)
      setLoadError('')
      setSaveError('')

      const draft = getOnboardingDraft()
      if (draft) {
        setStudentType(draft.studentType)
        setUniversity((current) => ({ ...current, name: draft.fullName }))
        setSchool((current) => ({ ...current, full_name: draft.fullName }))
      }

      if (!getAccessToken()) {
        if (isCurrent) {
          setLoadError('Inicia sesión para completar y guardar tu perfil.')
          setIsLoading(false)
        }
        return
      }

      try {
        const profiles = await getStudentProfiles()
        if (!isCurrent) return

        if (profiles.university) {
          setStudentType('university')
          setHasSavedProfile(true)
          setUniversity({
            name: profiles.university.name,
            career: profiles.university.career,
            semester: String(profiles.university.semester),
            age: String(profiles.university.age),
            city: profiles.university.city,
          })
          clearOnboardingDraft()
        } else if (profiles.school) {
          setStudentType('school')
          setHasSavedProfile(true)
          setSchool({
            full_name: profiles.school.full_name,
            city: profiles.school.city,
            graduation_year: String(profiles.school.graduation_year),
            average_grade: String(profiles.school.average_grade),
            math_grade: String(profiles.school.math_grade),
          })
          clearOnboardingDraft()
        }
      } catch (error) {
        if (isCurrent) setLoadError(getErrorMessage(error))
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadProfile()
    return () => { isCurrent = false }
  }, [reloadKey])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaveError('')
    setSuccessMessage('')
    setIsSaving(true)

    try {
      if (studentType === 'university') {
        await saveUniversityProfile({
          name: university.name.trim(),
          career: university.career.trim(),
          semester: Number(university.semester),
          age: Number(university.age),
          city: university.city.trim(),
        })
      } else if (studentType === 'school') {
        await saveSchoolProfile({
          full_name: school.full_name.trim(),
          city: school.city.trim(),
          graduation_year: Number(school.graduation_year),
          average_grade: Number(school.average_grade),
          math_grade: Number(school.math_grade),
        })
      } else {
        setSaveError('Elige dónde estudias para continuar.')
        return
      }

      setHasSavedProfile(true)
      clearOnboardingDraft()
      setSuccessMessage('Tu perfil se guardó correctamente. Ya puedes usarlo para consultar oportunidades compatibles.')
    } catch (error) {
      setSaveError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  function updateUniversity(field, value) {
    setUniversity((current) => ({ ...current, [field]: value }))
  }

  function updateSchool(field, value) {
    setSchool((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="max-w-3xl">
      <Surface className="p-0">
        <div className="border-b border-[#edf1eb] px-5 py-5 sm:px-7">
          <p className="m-0 text-xs font-bold tracking-[0.12em] text-[#347a57]">TU INFORMACIÓN ACADÉMICA</p>
          <h2 className="mt-2 font-display text-xl font-semibold text-[#1c4033]">Completa tu perfil</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#718075]">Estos datos ayudan a comparar tu experiencia con los requisitos de becas, pasantías y cursos. Puedes actualizarlos después.</p>
        </div>

        <div className="p-5 sm:p-7">
          {isLoading ? (
            <p className="m-0 py-5 text-sm text-[#718075]" role="status">Cargando tu perfil…</p>
          ) : loadError ? (
            <div className="grid gap-4">
              <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{loadError}</p>
              {getAccessToken() ? (
                <button className="min-h-11 justify-self-start rounded-xl border border-[#d8e2d7] px-4 text-sm font-semibold text-[#1c5a42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" type="button" onClick={() => setReloadKey((key) => key + 1)}>Reintentar</button>
              ) : (
                <a className="inline-flex min-h-11 items-center justify-center justify-self-start rounded-xl bg-[#1c5a42] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42]" href="/login">Iniciar sesión</a>
              )}
            </div>
          ) : (
            <>
              {!hasSavedProfile && (
                <fieldset className="m-0 mb-6 grid gap-3 border-0 p-0">
                  <legend className="mb-1 text-sm font-semibold text-[#344b3c]">¿Dónde estudias actualmente?</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['school', 'En el colegio', 'Perfil para estudiantes escolares y simulación de becas.'],
                      ['university', 'En la universidad', 'Perfil para oportunidades universitarias y cursos.'],
                    ].map(([type, title, description]) => (
                      <button
                        aria-pressed={studentType === type}
                        className={`min-h-24 rounded-xl border p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438c61] ${studentType === type ? 'border-[#438c61] bg-[#eff7ef] ring-2 ring-[#438c61]/15' : 'border-[#d8e2d7] bg-white'}`}
                        key={type}
                        onClick={() => { setStudentType(type); setSaveError('') }}
                        type="button"
                      >
                        <span className="block text-sm font-semibold text-[#235a3d]">{title}</span>
                        <span className="mt-1 block text-xs leading-5 text-[#718075]">{description}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {hasSavedProfile && (
                <p className="mb-6 rounded-xl bg-[#f3f7f1] px-4 py-3 text-sm text-[#526357]">
                  Tipo de perfil: <strong className="text-[#235a3d]">{studentType === 'school' ? 'Estudiante de colegio' : 'Estudiante universitario'}</strong>. El tipo se mantiene para evitar mezclar datos académicos.
                </p>
              )}

              {studentType && (
                <form className="grid gap-5" onSubmit={handleSubmit} aria-busy={isSaving}>
                  {studentType === 'university' ? (
                    <>
                      <ProfileField id="profile-name" label="Nombre completo" autoComplete="name" value={university.name} onChange={(value) => updateUniversity('name', value)} placeholder="Tu nombre y apellido" />
                      <ProfileField id="profile-career" label="Carrera" value={university.career} onChange={(value) => updateUniversity('career', value)} placeholder="Ej. Ingeniería de Sistemas" />
                      <div className="grid gap-5 sm:grid-cols-2">
                        <ProfileField id="profile-semester" label="Semestre actual" type="number" min="1" max="20" value={university.semester} onChange={(value) => updateUniversity('semester', value)} />
                        <ProfileField id="profile-age" label="Edad" type="number" min="13" max="110" value={university.age} onChange={(value) => updateUniversity('age', value)} />
                      </div>
                      <ProfileField id="profile-city" label="Ciudad" value={university.city} onChange={(value) => updateUniversity('city', value)} placeholder="Ej. La Paz" />
                    </>
                  ) : (
                    <>
                      <ProfileField id="school-name" label="Nombre completo" autoComplete="name" value={school.full_name} onChange={(value) => updateSchool('full_name', value)} placeholder="Tu nombre y apellido" />
                      <ProfileField id="school-city" label="Ciudad" value={school.city} onChange={(value) => updateSchool('city', value)} placeholder="Ej. La Paz" />
                      <ProfileField id="school-graduation-year" label="Año de graduación" type="number" min="2020" max="2100" value={school.graduation_year} onChange={(value) => updateSchool('graduation_year', value)} placeholder={String(new Date().getFullYear())} />
                      <div className="grid gap-5 sm:grid-cols-2">
                        <ProfileField id="school-average" label="Promedio general (0–100)" type="number" min="0" max="100" step="0.01" value={school.average_grade} onChange={(value) => updateSchool('average_grade', value)} placeholder="Ej. 85" />
                        <ProfileField id="school-math" label="Nota de Matemáticas (0–100)" type="number" min="0" max="100" step="0.01" value={school.math_grade} onChange={(value) => updateSchool('math_grade', value)} placeholder="Ej. 90" />
                      </div>
                    </>
                  )}

                  {saveError && <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{saveError}</p>}
                  {successMessage && (
                    <div className="grid gap-2">
                      <p className="m-0 rounded-xl border border-[#d5e8d3] bg-[#f1f8ec] px-4 py-3 text-sm leading-5 text-[#365f43]" role="status">{successMessage}</p>
                      <a className="inline-flex min-h-10 items-center text-sm font-semibold text-[#246b4a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" href="/app">Ir a mi resumen <span aria-hidden="true" className="ml-2">→</span></a>
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-3 border-t border-[#edf1eb] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="m-0 text-xs leading-5 text-[#849187]">Tu perfil se usa para calcular compatibilidad; no garantiza una beca ni una postulación.</p>
                    <button className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-[#1c5a42] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSaving}>
                      {isSaving ? 'Guardando…' : hasSavedProfile ? 'Guardar cambios' : 'Guardar mi perfil'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </Surface>
    </div>
  )
}

export default ProfilePage
