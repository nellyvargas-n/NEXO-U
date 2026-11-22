import { useEffect, useState } from 'react'
import { FiArrowRight, FiArrowUpRight, FiAward, FiBookOpen, FiBriefcase, FiCheckCircle, FiSearch, FiShield } from 'react-icons/fi'
import { apiRequest } from '../../shared/api/client.ts'
import HowItWorks from './components/HowItWorks.jsx'
import PrivacySection from './components/PrivacySection.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh.js'
const categoryName=(raw)=>{const kind=String(raw||'').toLowerCase();return kind.includes('beca')?'Beca':kind.includes('pasant')?'Pasantía':kind.includes('curso')?'Curso':'Convocatoria'}
const dateLabel=(raw)=>raw ? new Intl.DateTimeFormat('es-BO',{dateStyle:'medium'}).format(new Date(`${String(raw).slice(0,10)}T12:00:00`)) : 'Por confirmar'
function validLink(raw){try{return ['http:','https:'].includes(new URL(raw).protocol)}catch{return false}}
export default function LandingPage(){
 const [opportunities,setOpportunities]=useState(null),[error,setError]=useState('')
 const refreshKey=useAutoRefresh()
 useEffect(()=>{let live=true;apiRequest('v1/oportunidades/publicas').then(data=>{if(live){setOpportunities(data);setError('')}}).catch(e=>{if(live)setError(e.message)});return()=>{live=false}},[refreshKey])
 return <div className="nex-homepage"><main>
  <section className="nex-home-hero"><div className="nex-home-text"><span>PLATAFORMA DE OPORTUNIDADES</span><h1>Conecta tu talento con nuevas <em>oportunidades.</em></h1><p>Becas, pasantías y cursos en un solo lugar. Descubre cuáles se ajustan a tu perfil y qué necesitas para avanzar.</p><div className="nex-home-cta"><a href="/explorar">Explorar convocatorias <FiArrowRight/></a><a href="/register">Crear una cuenta <FiArrowUpRight/></a></div><div className="nex-home-trust"><span><FiCheckCircle/> Compatibilidad explicable</span><span><FiShield/> Datos privados</span></div></div><div className="nex-home-hero-img" role="img" aria-label="Vista de un campus universitario"/></section>
  <div className="nex-home-categories"><a href="/explorar"><FiAward/><strong>Becas</strong><span>Apoyo para tus estudios</span><FiArrowRight/></a><a href="/explorar"><FiBriefcase/><strong>Pasantías</strong><span>Experiencia profesional</span><FiArrowRight/></a><a href="/app/cursos"><FiBookOpen/><strong>Cursos</strong><span>Nuevas habilidades</span><FiArrowRight/></a></div>
  <section className="nex-home-live"><div className="nex-home-live-head"><div><small>CATÁLOGO CONECTADO A FASTAPI</small><h2>Convocatorias vigentes</h2><p>Solo se muestran oportunidades publicadas por organizaciones verificadas.</p></div><a href="/explorar">Ver todas <FiArrowRight/></a></div><div className="nex-home-live-list">{error?<div className="nex-no-data">No se pudo consultar el catálogo: {error}</div>:opportunities===null?<div className="nex-no-data">Consultando las oportunidades disponibles…</div>:opportunities.length===0?<div className="nex-no-data"><FiSearch/><strong>No hay convocatorias públicas vigentes</strong><span>Las instituciones verificadas podrán publicar oportunidades aquí.</span></div>:opportunities.slice(0,3).map(item=><article key={item.id}><span className="nex-home-tag">{categoryName(item.category)}</span><h3>{item.title}</h3><p>{item.organization||'Institución'}</p><small>Fecha de cierre: {dateLabel(item.deadline)}</small>{validLink(item.official_url)?<a href={item.official_url} target="_blank" rel="noopener noreferrer">Abrir convocatoria <FiArrowUpRight/></a>:<span>Enlace por confirmar</span>}</article>)}</div></section>
  <HowItWorks/><PrivacySection/>
 </main><SiteFooter/></div>
}
