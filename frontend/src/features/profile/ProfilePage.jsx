import { useEffect, useRef, useState } from 'react'
import { getAccessToken } from '../../shared/api/session.ts'
import { getCurrentUser } from '../../shared/api/modules/auth.service.ts'
import Surface from '../student-app/components/Surface.jsx'
import { clearOnboardingDraft, getOnboardingDraft } from './onboardingDraft.ts'
import { getStudentProfiles, saveSchoolProfile, saveUniversityProfile } from './profile.service.ts'
import { boliviaCities, careerSuggestions, universityOptions, universityGroups } from './bolivia-universities.js'
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh.js'

const fieldClass = 'mt-2 min-h-12 w-full rounded-xl border border-[#dfe8f5] bg-white px-4 text-base text-[#253b30] outline-none focus:border-[#438c61] focus:ring-4 focus:ring-[#438c61]/15'
const otherValue = '__other__'
const schoolYears = Array.from({ length: 26 }, (_, index) => String(new Date().getFullYear() + 5 - index))

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

function ProfileSelect({ id, label, value, onChange, children }) {
  return (
    <label className="block text-sm font-semibold text-[#344b3c]" htmlFor={id}>
      {label}
      <select className={fieldClass} id={id} value={value} onChange={(event) => onChange(event.target.value)} required>
        {children}
      </select>
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
  const [studentAccountId, setStudentAccountId] = useState(null)
  const [copyMessage, setCopyMessage] = useState('')
  const [university, setUniversity] = useState({ name: '', institution_name: '', career: '', semester: '', age: '', city: '' })
  const [isOtherUniversity, setIsOtherUniversity] = useState(false)
  const [isOtherUniversityCity, setIsOtherUniversityCity] = useState(false)
  const [school, setSchool] = useState({ full_name: '', city: '', graduation_year: '', average_grade: '', math_grade: '' })
  const [isOtherSchoolCity, setIsOtherSchoolCity] = useState(false)
  const [isOtherSchoolYear, setIsOtherSchoolYear] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const refreshKey = useAutoRefresh()
  const lastAutoRetryKey = useRef(0)

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
        const [profiles, currentUser] = await Promise.all([
          getStudentProfiles(),
          getCurrentUser().catch(() => null),
        ])
        if (!isCurrent) return

        if (currentUser?.role === 'usuario') setStudentAccountId(currentUser.id)

        if (profiles.university) {
          setStudentType('university')
          setHasSavedProfile(true)
          const institutionName = profiles.university.institution_name || ''
          setUniversity({
            name: profiles.university.name,
            institution_name: institutionName,
            career: profiles.university.career,
            semester: String(profiles.university.semester),
            age: String(profiles.university.age),
            city: profiles.university.city,
          })
          setIsOtherUniversity(Boolean(institutionName) && !universityOptions.includes(institutionName))
          setIsOtherUniversityCity(Boolean(profiles.university.city) && !boliviaCities.includes(profiles.university.city))
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
          setIsOtherSchoolCity(Boolean(profiles.school.city) && !boliviaCities.includes(profiles.school.city))
          setIsOtherSchoolYear(!schoolYears.includes(String(profiles.school.graduation_year)))
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

  useEffect(() => {
    if (!loadError || !getAccessToken() || refreshKey <= lastAutoRetryKey.current) return
    lastAutoRetryKey.current = refreshKey
    setReloadKey((key) => key + 1)
  }, [loadError, refreshKey])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaveError('')
    setSuccessMessage('')
    setIsSaving(true)

    try {
      if (studentType === 'university') {
        const savedProfile = await saveUniversityProfile({
          name: university.name.trim(),
          institution_name: university.institution_name.trim(),
          career: university.career.trim(),
          semester: Number(university.semester),
          age: Number(university.age),
          city: university.city.trim(),
        })
        setSuccessMessage(savedProfile.institution_name === university.institution_name.trim()
          ? 'Perfil guardado.'
          : 'La API no guardó la universidad seleccionada; no aparecerá al volver a entrar.')
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
      if (studentType === 'school') setSuccessMessage('Perfil guardado.')
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

  async function copyStudentAccountId() {
    if (!studentAccountId) return

    try {
      await navigator.clipboard.writeText(String(studentAccountId))
      setCopyMessage('ID copiado. Compártelo solo con la organización que ofrece el curso.')
    } catch {
      setCopyMessage(`Copia este ID manualmente: ${studentAccountId}`)
    }
  }

  return (
    <div className="max-w-3xl">
      <Surface className="p-0">
        <div className="border-b border-[#edf1eb] px-5 py-5 sm:px-7">
          <p className="m-0 text-xs font-bold tracking-[0.12em] text-[#2876d7]">TU INFORMACIÓN ACADÉMICA</p>
          <h2 className="mt-2 font-display text-xl font-semibold text-[#1d3557]">Completa tu perfil</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#8595a9]">Tu perfil ayuda a encontrar oportunidades compatibles.</p>
          <div className="nex-profile-steps" aria-label="Pasos para completar tu billetera estudiantil">
            <div><span className="nex-step-number">1</span><div><strong>Datos académicos</strong></div></div>
            <a href="/app/credenciales"><span className="nex-step-number">2</span><span><strong>Habilidades y certificados</strong></span><span aria-hidden="true">→</span></a>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {isLoading ? (
            <p className="m-0 py-5 text-sm text-[#8595a9]" role="status">Cargando tu perfil…</p>
          ) : loadError ? (
            <div className="grid gap-4">
              <p className="m-0 rounded-xl border border-[#f1c3c0] bg-[#fff4f2] px-4 py-3 text-sm leading-5 text-[#9b302a]" role="alert">{loadError}</p>
              {getAccessToken() ? (
                <p className="m-0 text-sm text-[#718075]">Volveremos a consultar tu perfil automáticamente.</p>
              ) : (
                <a className="inline-flex min-h-11 items-center justify-center justify-self-start rounded-xl bg-[#2475e2] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2475e2]" href="/login">Iniciar sesión</a>
              )}
            </div>
          ) : (
            <>
              {!hasSavedProfile && (
                <fieldset className="m-0 mb-6 grid gap-3 border-0 p-0">
                  <legend className="mb-1 text-sm font-semibold text-[#344b3c]">¿Dónde estudias actualmente?<span className="nx-required-indicator" aria-hidden="true">*</span></legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ['school', 'En el colegio', 'Becas y oportunidades escolares.'],
                      ['university', 'En la universidad', 'Cursos y oportunidades universitarias.'],
                    ].map(([type, title, description]) => (
                      <button
                        aria-pressed={studentType === type}
                        className={`min-h-24 rounded-xl border p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438c61] ${studentType === type ? 'border-[#438c61] bg-[#eff7ef] ring-2 ring-[#438c61]/15' : 'border-[#dfe8f5] bg-white'}`}
                        key={type}
                        onClick={() => { setStudentType(type); setSaveError('') }}
                        type="button"
                      >
                        <span className="block text-sm font-semibold text-[#235a3d]">{title}</span>
                        <span className="mt-1 block text-xs leading-5 text-[#8595a9]">{description}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}

              {hasSavedProfile && (
                <div className="mb-6 grid gap-3 rounded-xl bg-[#f3f7f1] px-4 py-3 text-sm text-[#526357] sm:flex sm:items-center sm:justify-between">
                  <p className="m-0">Perfil: <strong className="text-[#235a3d]">{studentType === 'school' ? 'Colegio' : 'Universidad'}</strong></p>
                  {studentType === 'university' && studentAccountId && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#365340]">ID para validar cursos: {studentAccountId}</span>
                      <button className="min-h-9 rounded-lg border border-[#d1dfd0] px-3 text-xs font-semibold text-[#246b4a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2876d7]" type="button" onClick={copyStudentAccountId}>Copiar ID</button>
                    </div>
                  )}
                  {copyMessage && <p className="m-0 text-xs text-[#677f9a]" role="status">{copyMessage}</p>}
                </div>
              )}

              {studentType && (
                <form className="grid gap-5" onSubmit={handleSubmit} aria-busy={isSaving}>
                  {studentType === 'university' ? (
                    <>
                      <ProfileField id="profile-name" label="Nombre completo" autoComplete="name" value={university.name} onChange={(value) => updateUniversity('name', value)} placeholder="Tu nombre y apellido" />
                      <ProfileSelect id="profile-university" label="Universidad" value={isOtherUniversity ? otherValue : university.institution_name} onChange={(value) => {
                        const isOther = value === otherValue
                        setIsOtherUniversity(isOther)
                        if (!isOther) updateUniversity('institution_name', value)
                      }}>
                        <option value="">Selecciona tu universidad</option>
                        {universityGroups.map((group) => <optgroup key={group.label} label={group.label}>{group.options.map((name) => <option value={name} key={name}>{name}</option>)}</optgroup>)}
                        <option value={otherValue}>No encuentro mi universidad</option>
                      </ProfileSelect>
                      {isOtherUniversity && <ProfileField id="profile-university-other" label="Nombre de la universidad" value={university.institution_name} onChange={(value) => updateUniversity('institution_name', value)} placeholder="Escribe el nombre oficial" maxLength="160" />}
                      <ProfileField id="profile-career" label="Carrera" list="university-careers" value={university.career} onChange={(value) => updateUniversity('career', value)} placeholder="Ej. Ingeniería de Sistemas" />
                      <datalist id="university-careers">{careerSuggestions.map((career) => <option value={career} key={career} />)}</datalist>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <ProfileSelect id="profile-semester" label="Semestre actual" value={university.semester} onChange={(value) => updateUniversity('semester', value)}>
                          <option value="">Selecciona tu semestre</option>
                          {Array.from({ length: 20 }, (_, index) => String(index + 1)).map((semester) => <option value={semester} key={semester}>{semester}° semestre</option>)}
                        </ProfileSelect>
                        <ProfileField id="profile-age" label="Edad" type="number" min="13" max="110" value={university.age} onChange={(value) => updateUniversity('age', value)} />
                      </div>
                      <ProfileSelect id="profile-city" label="Ciudad" value={isOtherUniversityCity ? otherValue : university.city} onChange={(value) => {
                        const isOther = value === otherValue
                        setIsOtherUniversityCity(isOther)
                        if (!isOther) updateUniversity('city', value)
                      }}>
                        <option value="">Selecciona tu ciudad</option>
                        {boliviaCities.map((city) => <option value={city} key={city}>{city}</option>)}
                        <option value={otherValue}>Otra ciudad</option>
                      </ProfileSelect>
                      {isOtherUniversityCity && <ProfileField id="profile-city-other" label="Nombre de la ciudad" value={university.city} onChange={(value) => updateUniversity('city', value)} placeholder="Escribe tu ciudad" maxLength="120" />}
                    </>
                  ) : (
                    <>
                      <ProfileField id="school-name" label="Nombre completo" autoComplete="name" value={school.full_name} onChange={(value) => updateSchool('full_name', value)} placeholder="Tu nombre y apellido" />
                      <ProfileSelect id="school-city" label="Ciudad" value={isOtherSchoolCity ? otherValue : school.city} onChange={(value) => {
                        const isOther = value === otherValue
                        setIsOtherSchoolCity(isOther)
                        if (!isOther) updateSchool('city', value)
                      }}>
                        <option value="">Selecciona tu ciudad</option>
                        {boliviaCities.map((city) => <option value={city} key={city}>{city}</option>)}
                        <option value={otherValue}>Otra ciudad</option>
                      </ProfileSelect>
                      {isOtherSchoolCity && <ProfileField id="school-city-other" label="Nombre de la ciudad" value={school.city} onChange={(value) => updateSchool('city', value)} placeholder="Escribe tu ciudad" maxLength="120" />}
                      <ProfileSelect id="school-graduation-year" label="Año de graduación" value={isOtherSchoolYear ? otherValue : school.graduation_year} onChange={(value) => {
                        const isOther = value === otherValue
                        setIsOtherSchoolYear(isOther)
                        if (!isOther) updateSchool('graduation_year', value)
                      }}>
                        <option value="">Selecciona el año</option>
                        {schoolYears.map((year) => <option value={year} key={year}>{year}</option>)}
                        <option value={otherValue}>Otro año</option>
                      </ProfileSelect>
                      {isOtherSchoolYear && <ProfileField id="school-graduation-year-other" label="Año de graduación" type="number" min="1950" max="2100" value={school.graduation_year} onChange={(value) => updateSchool('graduation_year', value)} placeholder={String(new Date().getFullYear())} />}
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
                      <a className="nex-profile-next" href="/app/credenciales">Siguiente paso: agregar mis habilidades y credenciales <span aria-hidden="true">→</span></a>
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-3 border-t border-[#edf1eb] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="m-0 text-xs leading-5 text-[#849187]">La compatibilidad no garantiza una beca ni una postulación.</p>
                    <button className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-[#2475e2] px-5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2475e2] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSaving}>
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
