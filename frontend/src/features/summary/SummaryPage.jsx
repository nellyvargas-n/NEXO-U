import { useEffect, useMemo, useState } from 'react'
import { FiAward, FiBookOpen, FiBookmark, FiBriefcase, FiCalendar, FiCheckCircle, FiChevronRight, FiRefreshCw, FiTarget, FiArrowUpRight, FiSearch, FiUser, FiPlusCircle } from 'react-icons/fi'
import { getStudentProfiles } from '../profile/profile.service.ts'
import { apiRequest } from '../../shared/api/client.ts'
import { sortOpportunitiesByMatch } from '../opportunities/opportunities.service.ts'
import { useOpportunityFeed } from '../opportunities/useOpportunityFeed.js'

const dateLabel = (date) => { if (!date) return 'Sin fecha'; const d = new Date(`${String(date).slice(0, 10)}T12:00:00`); return Number.isNaN(d.getTime()) ? 'Sin fecha' : new Intl.DateTimeFormat('es-BO',{day:'numeric', month:'short', year:'numeric'}).format(d) }
function isValidLink(value) { try { return ['https:','http:'].includes(new URL(value).protocol) } catch { return false } }
function percentComplete(profile) {
  if (!profile) return 0
  const keys = 'career' in profile ? ['name','career','semester','age','city'] : ['full_name','graduation_year','city','average_grade','math_grade']
  return Math.round(keys.filter(k => profile[k] !== null && profile[k] !== undefined && String(profile[k]).trim() !== '').length / keys.length * 100)
}
function formatName(profile) { return String(profile?.name || profile?.full_name || '').split(' ')[0] }
function OpportunityRow({ opportunity }) {
  const kind = String(opportunity.category || '').toLowerCase()
  const isBeca = kind.includes('beca')
  const isCurso = kind.includes('curso')
  const Icon = isBeca ? FiAward : isCurso ? FiBookOpen : FiBriefcase
  const match = opportunity.match
  return <article className="nex-opportunity-row">
    <span className={`nex-opportunity-mark ${isBeca?'is-beca':isCurso?'is-curso':'is-job'}`}><Icon /></span>
    <div className="nex-opportunity-info"><span className="nex-opportunity-type">{isBeca?'Beca':isCurso?'Curso':kind.includes('pasant')?'Pasantía': 'Oportunidad'}</span><h3>{opportunity.title}</h3><p>{opportunity.organization || 'Institución sin nombre público'} · Cierre: {dateLabel(opportunity.deadline)}</p></div>
    <div className="nex-opportunity-actions">{match?.total > 0 && <span className="nex-match-tag">{match.percent}% compatible</span>}{isValidLink(opportunity.official_url) ? <a href={opportunity.official_url} target="_blank" rel="noopener noreferrer">Enlace oficial <FiArrowUpRight /></a> : <span className="nex-no-link">Sin enlace disponible</span>}</div>
  </article>
}
export default function SummaryPage() {
  const { opportunities, matchNotice, isLoading, error, retry } = useOpportunityFeed()
  const [aux, setAux] = useState({ profile:null, enrollments:null, saved:null, notifications:null, credentials:null })
  useEffect(()=> {
    let active = true
    Promise.allSettled([
      getStudentProfiles(),
      apiRequest('v1/usuario/inscripciones'),
      apiRequest('v1/usuario/guardados'),
      apiRequest('v1/notificaciones'),
      apiRequest('v1/usuario/credenciales'),
    ]).then(results => {
      if (!active) return
      const value=(index)=>results[index].status==='fulfilled'?results[index].value:null
      const profiles = value(0)
      setAux({ profile:profiles?.university || profiles?.school || null, enrollments:value(1),saved:value(2),notifications:value(3), credentials:value(4) })
    })
    return ()=>{active=false}
  },[])
  const ranked = useMemo(()=>sortOpportunitiesByMatch(opportunities),[opportunities])
  const applicable = opportunities.filter(o => o.match?.eligible && o.match?.total>0).length
  const metrics=[
    {label:'Oportunidades vigentes',value:isLoading?'…':error?'—':opportunities.length, icon:FiAward},
    {label:'Compatibles conmigo',value:isLoading?'…':error||matchNotice?'—':applicable,icon:FiCheckCircle},
    {label:'Cursos en progreso',value:Array.isArray(aux.enrollments)?aux.enrollments.filter(e=>!e.completed).length:'—',icon:FiBookOpen},
    {label:'Oportunidades guardadas',value:Array.isArray(aux.saved)?aux.saved.length:'—',icon:FiBookmark},
  ]
  const completion = percentComplete(aux.profile)
  const nextDates=ranked.filter(item=>item.deadline).sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline))).slice(0,3)
  const notifications=Array.isArray(aux.notifications)?aux.notifications.slice(0,3):null
  return <div className="nex-dashboard">
    <section className="nex-dash-hero"><div className="nex-dash-hero-copy"><span className="nex-eyebrow">TU ESPACIO EN NEXO U</span><h1>{aux.profile?`¡Hola, ${formatName(aux.profile)}!`:'Conecta tu talento con nuevas oportunidades'}</h1><p>Encuentra becas, pasantías y cursos para avanzar en tu formación académica y profesional.</p><a href="/app/oportunidades">Explorar oportunidades <FiChevronRight/></a></div><div className="nex-hero-photo" aria-hidden="true"/></section>
    <div className="nex-account-next-steps" aria-label="Completa tu perfil y tus habilidades">
      <div className="nex-account-steps-heading"><strong>Prepara tu perfil para encontrar oportunidades</strong><span>Dos pasos para empezar, incluso si aún no hay convocatorias.</span></div>
      <a href="/app/perfil" className="nex-account-step"><FiUser /><span><strong>1. Mi perfil académico</strong><small>{aux.profile ? 'Datos académicos guardados · puedes editarlos' : 'Carrera, semestre o promedio escolar'}</small></span><FiChevronRight /></a>
      <a href="/app/credenciales" className="nex-account-step"><FiPlusCircle /><span><strong>2. Habilidades y credenciales</strong><small>{Array.isArray(aux.credentials) ? `${aux.credentials.length} credenciales registradas · agregar más` : 'Idiomas, conocimientos y certificados'}</small></span><FiChevronRight /></a>
    </div>
    <div className="nex-main-columns"><div className="nex-main-left">
      <div className="nex-metrics">{metrics.map(({label,value,icon:Icon})=><div className="nex-metric" key={label}><div className="nex-metric-icon"><Icon/></div><div><strong>{value}</strong><span>{label}</span></div></div>)}</div>
      {matchNotice && <div className="nex-info-message">{matchNotice}</div>}
      <section className="nex-main-card"><div className="nex-section-heading"><div><span className="nex-eyebrow">TUS POSIBILIDADES</span><h2>Oportunidades destacadas</h2></div><a href="/app/oportunidades">Ver todas <FiChevronRight/></a></div>
        {isLoading ? <div className="nex-no-data">Consultando oportunidades…</div> : error ? <div className="nex-no-data">{error}<button onClick={retry} type="button"><FiRefreshCw/> Reintentar</button></div> : ranked.length ? ranked.slice(0,3).map(o=><OpportunityRow key={o.id} opportunity={o}/>) : <div className="nex-no-data"><FiSearch/><strong>Aún no hay convocatorias públicas vigentes</strong><span>Las ofertas aparecerán cuando una organización verificada publique una convocatoria; no mostramos datos de ejemplo.</span><a href="/app/perfil">Revisar mi perfil <FiChevronRight/></a></div>}
      </section>
    </div><aside className="nex-dashboard-right">
      <section className="nex-side-card"><div className="nex-side-title"><FiTarget/><h2>Tu perfil</h2></div><div className="nex-profile-progress"><div className="nex-progress-ring" style={{'--progress':`${completion}%`}}><span>{completion}%</span></div><div><strong>Perfil académico</strong><p>{aux.profile?'Tus datos académicos son la base del matching.':'Completa tus datos para conocer tu compatibilidad.'}</p><a href="/app/perfil">{aux.profile?'Editar perfil':'Completar perfil'} <FiChevronRight/></a></div></div></section>
      <section className="nex-side-card"><div className="nex-side-title"><FiCalendar/><h2>Próximos vencimientos</h2></div>{nextDates.length?nextDates.map(item=><div className="nex-deadline-row" key={item.id}><span>{item.title}</span><time>{dateLabel(item.deadline)}</time></div>):<p className="nex-side-empty">No hay fechas de convocatorias vigentes.</p>}</section>
      <section className="nex-side-card"><div className="nex-side-title"><FiBookmark/><h2>Notificaciones recientes</h2></div>{notifications?.length?notifications.map(item=><a className="nex-notification-row" href="/app/notificaciones" key={item.id}><span className={item.read?'is-read':''}></span><div><strong>{item.title}</strong><small>{item.message}</small></div><FiChevronRight/></a>):<p className="nex-side-empty">No tienes notificaciones nuevas.</p>}<a className="nex-see-notifications" href="/app/notificaciones">Ver notificaciones <FiChevronRight/></a></section>
    </aside></div>
  </div>
}
