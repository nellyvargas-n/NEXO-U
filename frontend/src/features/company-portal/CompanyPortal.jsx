import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../../shared/api/client.ts'
import { getCurrentUser } from '../../shared/api/modules/auth.service.ts'
import { clearAccessToken } from '../../shared/api/session.ts'
import BrandMark from '../../shared/components/BrandMark.jsx'

const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-[#d6e3db] bg-white px-3 text-sm text-[#244236] outline-none focus:border-[#31926b] focus:ring-2 focus:ring-[#c8eadc]'
const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1d684e] px-5 text-sm font-semibold text-white transition hover:bg-[#14543e] disabled:cursor-not-allowed disabled:opacity-50'
const labelClass = 'block text-sm font-semibold text-[#345747]'

function Card({ title, subtitle, children }) {
  return <section className="nx-role-card rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
    <h2 className="text-lg font-bold text-[#173d2f]">{title}</h2>
    {subtitle && <p className="mt-1 text-sm leading-6 text-[#6c8072]">{subtitle}</p>}
    <div className="mt-5">{children}</div>
  </section>
}

function ErrorNotice({ message }) {
  return message ? <p role="alert" className="rounded-xl border border-[#f1ccc7] bg-[#fff2f0] px-4 py-3 text-sm text-[#92362f]">{message}</p> : null
}

function PortalHeader({ title }) {
  return <header className="nx-role-topbar">
    <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <BrandMark href="/" size="small" />
      <div className="flex items-center gap-3"><span className="text-xs font-semibold uppercase tracking-wider text-[#55806b]">{title}</span>
        <button className="rounded-lg border border-[#d7e6da] px-3 py-2 text-sm text-[#1d684e]" type="button" onClick={() => { clearAccessToken(); window.location.assign('/login') }}>Cerrar sesión</button>
      </div>
    </div>
  </header>
}

export default function CompanyPortal() {
  const [access, setAccess] = useState('loading')
  const [organizations, setOrganizations] = useState([])
  const [courses, setCourses] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('')
  const [requirementKind, setRequirementKind] = useState('career')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    const [orgs, ownCourses, ownOpps] = await Promise.all([
      apiRequest('v1/empresa/organizaciones'),
      apiRequest('v1/empresa/cursos'),
      apiRequest('v1/empresa/oportunidades'),
    ])
    setOrganizations(orgs)
    setCourses(ownCourses)
    setOpportunities(ownOpps)
    setSelectedOrgId((old) => old && orgs.some((o) => String(o.id) === old) ? old : (orgs[0] ? String(orgs[0].id) : ''))
    setSelectedCourseId((old) => old && ownCourses.some((c) => String(c.id) === old) ? old : (ownCourses[0] ? String(ownCourses[0].id) : ''))
    setSelectedOpportunityId((old) => old && ownOpps.some((o) => String(o.id) === old) ? old : (ownOpps[0] ? String(ownOpps[0].id) : ''))
  }, [])

  useEffect(() => {
    let live = true
    getCurrentUser().then(async (user) => {
      if (!live) return
      if (user.role !== 'empresa') { setAccess('denied'); return }
      await refresh()
      if (live) setAccess('ready')
    }).catch((e) => { if (live) { setAccess('failed'); setError(e.message) } })
    return () => { live = false }
  }, [refresh])

  useEffect(() => {
    if (!selectedCourseId || access !== 'ready') { setEnrollments([]); return }
    let live = true
    apiRequest(`v1/empresa/cursos/${selectedCourseId}/inscripciones`)
      .then((rows) => { if (live) setEnrollments(rows) })
      .catch((e) => { if (live) { setEnrollments([]); setError(e.message) } })
    return () => { live = false }
  }, [selectedCourseId, access, courses])

  async function action(task, success) {
    setError(''); setNotice(''); setBusy(true)
    try { const result=await task(); await refresh(); setNotice(success); return result }
    catch (e) { setError(e.message || 'No se pudo guardar.'); return null }
    finally { setBusy(false) }
  }

  async function createOrganization(e) {
    e.preventDefault()
    const form = e.currentTarget
    const name = new FormData(form).get('name').trim()
    await action(() => apiRequest('v1/empresa/organizaciones', {method:'POST', body: JSON.stringify({name})}), 'Organización registrada. Espera su verificación para poder publicar.')
    form.reset()
  }

  async function createCourse(e) {
    e.preventDefault()
    const form = e.currentTarget; const d = Object.fromEntries(new FormData(form))
    await action(() => apiRequest('v1/empresa/cursos', {method:'POST', body:JSON.stringify({
      organization_id:Number(d.organization_id), title:d.title, end_date:d.end_date,
      cost_bob:Number(d.cost_bob), credential_kind:d.credential_kind,
      credential_value:d.credential_value, credential_level:d.credential_level || null,
    })}), 'Curso registrado correctamente.')
    form.reset()
  }

  async function createOpportunity(e) {
    e.preventDefault()
    const form = e.currentTarget; const d = Object.fromEntries(new FormData(form))
    const created = await action(() => apiRequest('v1/empresa/oportunidades', {method:'POST', body: JSON.stringify({
      organization_id:Number(d.organization_id), title:d.title, category:d.category,
      deadline:d.deadline, official_url:d.official_url, amount_bob:Number(d.amount_bob || 0),
    })}), 'Oportunidad creada. Ahora puedes definir los requisitos desde el editor de abajo.')
    if(created?.id) setSelectedOpportunityId(String(created.id))
    if(created) form.reset()
  }

  async function createRequirement(e) {
    e.preventDefault()
    if (!selectedOpportunityId) { setError('Selecciona una oportunidad.'); return }
    const form=e.currentTarget; const d=Object.fromEntries(new FormData(form))
    const result=await action(()=>apiRequest(`v1/empresa/oportunidades/${selectedOpportunityId}/requisitos`,{
      method:'POST', body:JSON.stringify({kind:d.kind,operator:d.operator,value:d.value,mandatory:Boolean(d.mandatory)})
    }), 'Requisito agregado a la oportunidad.')
    if(result) form.reset()
  }

  async function validateEnrollment(studentId) {
    await action(() => apiRequest(`v1/empresa/cursos/${selectedCourseId}/validar`, {
      method:'POST',body:JSON.stringify({ student_user_id:studentId }),
    }), 'Credencial validada; el estudiante ya puede actualizar su matching.')
    const rows = await apiRequest(`v1/empresa/cursos/${selectedCourseId}/inscripciones`).catch(() => [])
    setEnrollments(rows)
  }

  const operatorsByKind={career:[['in','En esta carrera o lista']],semester:[['>=','Semestre mínimo']],age:[['between','Rango de edad']],skill:[['has','Habilidad presente']],language:[['A1','A1'],['A2','A2'],['B1','B1'],['B2','B2'],['C1','C1'],['C2','C2']],certificate:[['has','Certificado presente']],city:[['in','Ciudad o lista']],average_grade:[['>=','Promedio mínimo']],math_grade:[['>=','Nota mínima de matemática']],graduation_year:[['eq','Año de graduación']]}
  const verified = organizations.filter((o) => o.verified)
  const verifiedSelected = verified.some((o) => String(o.id) === selectedOrgId)

  return <div className="nx-role-workspace nx-company-workspace min-h-screen">
    <PortalHeader title="Portal de empresas" />
    <main className="nx-role-main mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3d9876]">Tu organización · NEXO U</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Panel institucional</h1>
          <p className="mt-2 text-sm text-[#657a6b]">Publica oportunidades, ofrece cursos y valida credenciales de estudiantes.</p>
        </div>
        <button type="button" className="rounded-xl border border-[#bcd9c7] bg-white px-4 py-2 text-sm font-semibold text-[#21634b]" onClick={() => action(async () => {},'Datos actualizados')}>Actualizar</button>
      </div>
      <nav className="nx-role-tabs" aria-label="Secciones de empresa"><a href="#organizaciones">Organizaciones</a><a href="#publicaciones">Publicar</a><a href="#inscripciones">Inscripciones</a><a href="/empresa/cursos/validar">Validar credenciales ↗</a></nav>
      {access === 'loading' && <Card title="Cargando">Validando tu sesión institucional…</Card>}
      {(access === 'denied' || access === 'failed') && <Card title="Acceso protegido"><ErrorNotice message={error || 'Solo las cuentas con rol empresa pueden acceder.'} /><a href="/login" className="mt-4 inline-flex font-semibold text-[#22684e]">Iniciar sesión</a></Card>}
      {access === 'ready' && <>
        <div className="nx-role-stats grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[[organizations.length,'Organizaciones'],[courses.length,'Cursos publicados'],[opportunities.length,'Oportunidades']].map(([value,label]) =>
            <div className="nx-role-stat rounded-2xl border bg-white p-5" key={label}><p className="text-xs font-semibold uppercase tracking-wider text-[#66806e]">{label}</p><p className="mt-2 text-3xl font-extrabold text-[#1d684e]">{value}</p></div>) }
        </div>
        <ErrorNotice message={error} />
        {notice && <p role="status" className="rounded-xl border border-[#c9e6d3] bg-[#eff9f1] px-4 py-3 text-sm text-[#235e43]">{notice}</p>}
        <div className="grid gap-5 lg:grid-cols-2" id="organizaciones">
          <Card title="Mis organizaciones" subtitle="Una nueva institución necesita aprobación del administrador.">
            {organizations.length ? <div className="mb-5 space-y-2">{organizations.map((o) =>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f3f7f2] p-3 text-sm" key={o.id}><span className="font-semibold">{o.name}</span><span className={o.verified ? 'text-[#1e7a4a]' : 'text-[#956d1e]'}>{o.verified ? 'Verificada' : 'Pendiente'}</span></div>)}</div> : <p className="mb-5 text-sm text-[#657a6b]">Registra tu primera organización para empezar.</p>}
            <form onSubmit={createOrganization} className="flex flex-col gap-3 sm:flex-row">
              <label className="flex-1 text-sm font-semibold">Nombre de la organización<input className={inputClass} name="name" required minLength="2" maxLength="150" placeholder="Ej. Academia Nexo" /></label>
              <button className={buttonClass + ' self-end'} disabled={busy}>Registrar</button>
            </form>
          </Card>
          <Card title="Publicaciones institucionales" subtitle="Solo las organizaciones verificadas pueden publicar cursos y oportunidades.">
            <label className={labelClass}>Organización seleccionada<select className={inputClass} value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)}>
              {organizations.length === 0 && <option value="">Sin organizaciones</option>}
              {organizations.map((o) => <option key={o.id} value={o.id}>{o.name} {o.verified ? '(verificada)' : '(pendiente)'}</option>)}
            </select></label>
            <div className="mt-4 rounded-xl bg-[#f3f7f2] p-4 text-sm leading-6 text-[#5b7463]">
              {verifiedSelected ? 'Organización verificada: ya puedes publicar.' : 'Cuando el administrador verifique tu organización, podrás publicar desde este panel.'}
            </div>
            <a href="/empresa/cursos/validar" className="mt-4 inline-flex font-semibold text-[#216c50] underline underline-offset-4">Abrir el módulo de validaciones</a>
          </Card>
        </div>
        {verified.length > 0 && <div className="grid gap-5 lg:grid-cols-2" id="publicaciones">
          <Card title="Publicar un curso" subtitle="Indica qué credencial obtiene el estudiante al completarlo.">
            <form className="grid gap-3" onSubmit={createCourse}>
              <label className={labelClass}>Organización<select name="organization_id" required className={inputClass}>{verified.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
              <label className={labelClass}>Nombre del curso<input className={inputClass} required name="title" minLength="3" placeholder="Inglés B1 intensivo" /></label>
              <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Fecha de finalización<input className={inputClass} required name="end_date" type="date" /></label><label className={labelClass}>Costo (Bs)<input className={inputClass} required name="cost_bob" type="number" min="0" defaultValue="0" step="0.01" /></label></div>
              <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Tipo de credencial<select className={inputClass} name="credential_kind"><option value="language">Idioma</option><option value="skill">Habilidad</option><option value="certificate">Certificado</option></select></label><label className={labelClass}>Nivel<input className={inputClass} name="credential_level" placeholder="B1" maxLength="20" /></label></div>
              <label className={labelClass}>Credencial otorgada<input className={inputClass} name="credential_value" required placeholder="Inglés" /></label>
              <button className={buttonClass} disabled={busy}>Crear curso</button>
            </form>
          </Card>
          <Card title="Publicar una oportunidad" subtitle="Debe tener fecha de cierre y enlace oficial verificable.">
            <form className="grid gap-3" onSubmit={createOpportunity}>
              <label className={labelClass}>Organización<select name="organization_id" required className={inputClass}>{verified.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
              <label className={labelClass}>Título<input className={inputClass} name="title" required minLength="3" placeholder="Pasantía de desarrollo" /></label>
              <label className={labelClass}>Tipo<select name="category" className={inputClass}><option value="pasantia">Pasantía</option><option value="beca">Beca</option><option value="patrocinio">Patrocinio</option><option value="curso">Curso</option></select></label>
              <label className={labelClass}>Enlace oficial<input className={inputClass} name="official_url" type="url" required placeholder="https://institucion.example/convocatoria" /></label>
              <div className="grid grid-cols-2 gap-3"><label className={labelClass}>Fecha de cierre<input className={inputClass} name="deadline" type="date" required /></label><label className={labelClass}>Beneficio (Bs)<input className={inputClass} name="amount_bob" type="number" step="0.01" min="0" defaultValue="0" /></label></div>
              <button className={buttonClass} disabled={busy}>Publicar oportunidad</button>
            </form>
          </Card>
        </div>}
        {verified.length>0 && <Card title="Definir requisitos de una oportunidad" subtitle="Estos criterios se usan para el cálculo de compatibilidad; evita requisitos que la organización no haya publicado oficialmente.">
          {opportunities.length ? <form className="nex-requirement-form grid gap-3 sm:grid-cols-2" onSubmit={createRequirement}>
            <label className={labelClass}>Convocatoria<select name="opportunity_id" className={inputClass} value={selectedOpportunityId} onChange={e=>setSelectedOpportunityId(e.target.value)}>{opportunities.map(o=><option key={o.id} value={o.id}>{o.title}</option>)}</select></label>
            <label className={labelClass}>Tipo de requisito<select name="kind" className={inputClass} required value={requirementKind} onChange={e=>setRequirementKind(e.target.value)}><option value="career">Carrera</option><option value="semester">Semestre</option><option value="age">Edad</option><option value="skill">Habilidad</option><option value="language">Idioma</option><option value="certificate">Certificado</option><option value="city">Ciudad</option><option value="average_grade">Promedio académico</option><option value="math_grade">Matemática</option><option value="graduation_year">Año de graduación</option></select></label>
            <label className={labelClass}>Operador o nivel<select key={requirementKind} name="operator" className={inputClass} required>{operatorsByKind[requirementKind].map(([op,label])=><option value={op} key={op}>{label}</option>)}</select></label>
            <label className={labelClass}>Valor o nivel<input name="value" className={inputClass} minLength="1" required placeholder={requirementKind==='language'?'Ej. Inglés':requirementKind==='age'?'Ej. 18-25':'Ej. Python, Sistemas o 5'} /></label>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" name="mandatory" defaultChecked /> Requisito obligatorio</label>
            <button type="submit" disabled={busy||!selectedOpportunityId} className={buttonClass}>Añadir requisito</button>
          </form> : <p className="text-sm text-[#657a6b]">Publica primero una oportunidad para agregar sus requisitos.</p>}
        </Card>}
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Mis cursos"><div className="space-y-2">{courses.length ? courses.map((c) => <div className="rounded-xl bg-[#f3f7f2] p-3 text-sm" key={c.id}><strong>{c.title}</strong><p className="mt-1 text-[#66806e]">Credencial: {c.credential_value}{c.credential_level ? ` · ${c.credential_level}` : ''} · finaliza {c.end_date}</p></div>) : <p className="text-sm text-[#66806e]">No tienes cursos todavía.</p>}</div></Card>
          <Card title="Mis oportunidades"><div className="space-y-2">{opportunities.length ? opportunities.map((o) => <div className="rounded-xl bg-[#f3f7f2] p-3 text-sm" key={o.id}><strong>{o.title}</strong><p className="mt-1 text-[#66806e]">Cierre: {o.deadline} · {o.category}</p></div>) : <p className="text-sm text-[#66806e]">No tienes oportunidades publicadas.</p>}</div></Card>
        </div>
        <div id="inscripciones"><Card title="Inscripciones y validación" subtitle="Solo ves los alumnos inscritos en un curso de tu organización.">
          <label className={labelClass}>Curso<select className={inputClass + ' max-w-lg'} value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}><option value="">Selecciona un curso</option>{courses.map((c) => <option value={c.id} key={c.id}>{c.title}</option>)}</select></label>
          <div className="mt-4 grid gap-3">{enrollments.length ? enrollments.map((en) => <div key={en.enrollment_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f3f7f2] p-4 text-sm"><div><p className="font-semibold">{en.student_name}</p><p className="text-[#66806e]">ID: {en.student_user_id} · {en.profile_type} · {en.validation_status}</p></div>{!en.completed && <button type="button" disabled={busy} onClick={() => validateEnrollment(en.student_user_id)} className={buttonClass}>Validar finalización</button>}</div>) : <p className="text-sm text-[#66806e]">Todavía no hay inscripciones para el curso seleccionado.</p>}</div>
        </Card></div>
      </>}
    </main>
  </div>
}
