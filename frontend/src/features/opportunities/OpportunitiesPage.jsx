import { useEffect, useMemo, useState } from 'react'
import { FiArrowUpRight, FiAward, FiBookOpen, FiBookmark, FiBriefcase, FiCalendar, FiCheckCircle, FiChevronDown, FiFilter, FiInfo, FiMapPin, FiSearch, FiShield, FiStar, FiUser, FiX } from 'react-icons/fi'
import BrandMark from '../../shared/components/BrandMark.jsx'
import { apiRequest } from '../../shared/api/client.ts'
import { getAccessToken } from '../../shared/api/session.ts'
import { sortOpportunitiesByMatch } from './opportunities.service.ts'
import { useOpportunityFeed } from './useOpportunityFeed.js'

const categories=[['todas','Todas'],['beca','Becas'],['pasantia','Pasantías'],['patrocinio','Programas'],['curso','Cursos']]
const typeFor = (raw) => { const value=String(raw||'').toLowerCase(); return value.includes('beca')?'beca':value.includes('pasant')?'pasantia':value.includes('curso')?'curso':value.includes('patro')?'patrocinio':value }
const typeName = {beca:'Beca',pasantia:'Pasantía',curso:'Curso',patrocinio:'Programa'}
function formatDate(raw){if(!raw)return'Por confirmar';const date=new Date(`${String(raw).slice(0,10)}T12:00:00`);return Number.isNaN(date.getTime())?'Por confirmar':new Intl.DateTimeFormat('es-BO',{dateStyle:'medium'}).format(date)}
function formatAmount(amount){return Number(amount)>0 ? new Intl.NumberFormat('es-BO',{style:'currency',currency:'BOB',maximumFractionDigits:0}).format(Number(amount)):null}
function isSafeLink(value){try{return ['https:','http:'].includes(new URL(value).protocol)}catch{return false}}
function Card({item,saved,onToggleSave}){
  const [expanded,setExpanded]=useState(false);const kind=typeFor(item.category);const Icon=kind==='beca'?FiAward:kind==='curso'?FiBookOpen:kind==='patrocinio'?FiStar:FiBriefcase
  const hasMatch=!!(item.match&&item.match.total>0)
  return <article className="nex-explore-card"><div className="nex-explore-card-head"><div className={`nex-explore-card-icon is-${kind}`}><Icon/></div><div><span className={`nex-type-label is-${kind}`}>{typeName[kind]||'Oportunidad'}</span><h3>{item.title}</h3><p>{item.organization || 'Emisor sin nombre público'}</p></div><button className={`nex-bookmark-btn ${saved?'is-saved':''}`} type="button" aria-label={saved?'Quitar de guardados':'Guardar oportunidad'} onClick={()=>onToggleSave(item.id)}><FiBookmark/></button></div>
    <div className="nex-explore-details"><span><FiCalendar/> Cierra: {formatDate(item.deadline)}</span>{item.verified_organization&&<span><FiShield/> Emisor verificado</span>}{formatAmount(item.amount_bob)&&<span><FiAward/> {formatAmount(item.amount_bob)}</span>}</div>
    {hasMatch?<div className="nex-compatibility"><div><span>Compatibilidad con tu perfil</span><strong>{item.match.percent}%</strong></div><div className="nex-compat-track"><i style={{width:`${Math.max(0,Math.min(100,item.match.percent||0))}%`}}/></div><small>{item.match.met} de {item.match.total} requisitos obligatorios cumplidos</small></div>:<div className="nex-match-unavailable"><FiInfo/> Inicia sesión y completa tu perfil para conocer tus requisitos.</div>}
    {expanded&&hasMatch&&<div className="nex-requirement-details"><h4>Requisitos de la convocatoria</h4>{item.match.requirements?.map((req,index)=><div className="nex-requirement" key={`${req.kind}-${index}`}><span className={req.status==='cumple'?'nex-met':'nex-missing'}>{req.status==='cumple'?<FiCheckCircle/>:<FiInfo/>}</span><span>{req.required}{req.operator ? ` (${req.operator})` : ''}<small>{req.status==='cumple'?'Cumples este requisito':'Pendiente o sin acreditar'} {req.courses?.length ? `· ${req.courses.length} curso(s) relacionado(s)` : ''}</small></span></div>)}</div>}
    <div className="nex-explore-card-actions">{hasMatch&&<button className="nex-detail-toggle" type="button" onClick={()=>setExpanded(v=>!v)}>{expanded?'Ocultar requisitos':'Ver requisitos'} <FiChevronDown/></button>}{isSafeLink(item.official_url)?<a href={item.official_url} target="_blank" rel="noopener noreferrer" className="nex-official-btn">Ir al enlace oficial <FiArrowUpRight/></a>:<span className="nex-no-official">Sin enlace oficial</span>}</div>
  </article>
}
export default function OpportunitiesPage({embedded=false}){
  const {opportunities,matchNotice,isLoading,error,retry}=useOpportunityFeed()
  const [query,setQuery]=useState(''),[category,setCategory]=useState('todas'),[onlyVerified,setOnlyVerified]=useState(false),[onlyEligible,setOnlyEligible]=useState(false),[onlyFunded,setOnlyFunded]=useState(false),[sort,setSort]=useState('match'),[mobileFilters,setMobileFilters]=useState(false)
  const [savedIds,setSavedIds]=useState([]),[saveError,setSaveError]=useState(''),[busySave,setBusySave]=useState(null)
  const isSignedIn=Boolean(getAccessToken())
  useEffect(()=>{if(!isSignedIn)return;let live=true;apiRequest('v1/usuario/guardados').then(rows=>{if(live)setSavedIds(rows.map(row=>row.opportunity_id))}).catch(()=>{});return()=>{live=false}},[isSignedIn])
  const filtered=useMemo(()=>{
    const term=query.trim().toLocaleLowerCase('es')
    let list=opportunities.filter(item=>{
      if(category!=='todas'&&typeFor(item.category)!==category)return false
      if(onlyVerified&&!item.verified_organization)return false
      if(onlyEligible&&!item.match?.eligible)return false
      if(onlyFunded&&Number(item.amount_bob)<=0)return false
      return !term||[item.title,item.organization,typeName[typeFor(item.category)]].join(' ').toLocaleLowerCase('es').includes(term)
    })
    if(sort==='date')list=[...list].sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline)))
    else if(sort==='name')list=[...list].sort((a,b)=>a.title.localeCompare(b.title,'es'))
    else list=sortOpportunitiesByMatch(list)
    return list
  },[opportunities,query,category,onlyVerified,onlyEligible,onlyFunded,sort])
  async function toggleSaved(id){if(!isSignedIn){window.location.assign('/login');return}setSaveError('');setBusySave(id);try{if(savedIds.includes(id)){await apiRequest(`v1/usuario/guardados/${id}`,{method:'DELETE'});setSavedIds(rows=>rows.filter(x=>x!==id))}else{await apiRequest(`v1/usuario/guardados/${id}`,{method:'PUT'});setSavedIds(rows=>[...rows,id])}}catch(e){setSaveError(e.message||'No se pudo guardar la oportunidad')}finally{setBusySave(null)}}
  const suggested=sortOpportunitiesByMatch(opportunities).slice(0,3)
  function reset(){setCategory('todas');setQuery('');setOnlyVerified(false);setOnlyFunded(false);setOnlyEligible(false)}
  return <div className={`nex-explore ${embedded?'is-embedded':''}`}>
    {!embedded&&<header className="nex-explore-topbar"><BrandMark href="/inicio"/><nav><a href="/inicio">Inicio</a><a className="is-current" href="/explorar">Explorar</a><a href="/app/cursos">Cursos</a><a href="/register">Para instituciones</a></nav><a className="nex-user-access" href={isSignedIn?'/app':'/login'}><FiUser/>{isSignedIn?'Mi espacio':'Iniciar sesión'}</a></header>}
    <div className="nex-explore-wrap"><div className="nex-explore-lead"><div><span className="nex-eyebrow">CONVOCATORIAS VIGENTES</span><h1>Explora oportunidades</h1><p>Busca becas, pasantías y cursos publicados por instituciones verificadas.</p></div><span className="nex-live-caption"><FiShield/> Datos consultados desde FastAPI</span></div>
      <div className="nex-explore-grid">
        <aside className={`nex-filter-card ${mobileFilters?'is-open':''}`}><header><h2><FiFilter/> Filtros</h2><button type="button" onClick={reset}>Limpiar</button></header><fieldset><legend>Tipo de oportunidad</legend>{categories.map(([id,label])=><label key={id}><input type="radio" name="nex-type" checked={category===id} onChange={()=>setCategory(id)}/>{label}</label>)}</fieldset><fieldset><legend>Preferencias</legend><label><input type="checkbox" checked={onlyVerified} onChange={e=>setOnlyVerified(e.target.checked)}/>Emisor verificado</label><label><input type="checkbox" checked={onlyEligible} onChange={e=>setOnlyEligible(e.target.checked)}/>Cumplo requisitos</label><label><input type="checkbox" checked={onlyFunded} onChange={e=>setOnlyFunded(e.target.checked)}/>Con apoyo económico</label></fieldset><p className="nex-filter-help">La compatibilidad depende de las credenciales que registraste.</p><button className="nex-filter-close" type="button" onClick={()=>setMobileFilters(false)}>Ver resultados</button></aside>
        <div className="nex-results"><div className="nex-explore-hero"><span>ENCUENTRA TU PRÓXIMO PASO</span><h2>Oportunidades para avanzar en tu futuro.</h2><p>Consulta requisitos, fechas y enlaces oficiales en un mismo lugar.</p><form role="search" onSubmit={e=>e.preventDefault()}><FiSearch/><input type="search" aria-label="Buscar convocatorias" placeholder="Buscar por título, institución o área…" value={query} onChange={e=>setQuery(e.target.value)}/><button type="submit">Buscar</button></form></div>
          <div className="nex-explore-tools"><strong>{isLoading?'Consultando…':`${filtered.length} ${filtered.length===1?'resultado':'resultados'}`}</strong><div><button className="nex-mobile-filters" type="button" onClick={()=>setMobileFilters(true)}><FiFilter/> Filtros</button><label>Ordenar por <select value={sort} onChange={e=>setSort(e.target.value)}><option value="match">Compatibilidad</option><option value="date">Fecha de cierre</option><option value="name">Nombre</option></select></label></div></div>
          {matchNotice&&<div className="nex-info-message">{matchNotice}</div>}{saveError&&<div className="nex-info-message" role="alert">{saveError}</div>}
          {isLoading?<div className="nex-no-data">Consultando convocatorias…</div>:error?<div className="nex-no-data">{error} <button type="button" onClick={retry}>Reintentar</button></div>:filtered.length?<div className="nex-explore-list">{filtered.map(item=><Card key={item.id} item={item} saved={savedIds.includes(item.id)} onToggleSave={toggleSaved}/>)}</div>:<div className="nex-no-data"><FiSearch/><h3>{opportunities.length?'Sin resultados con estos filtros':'Todavía no hay oportunidades públicas vigentes'}</h3><p>{opportunities.length?'Prueba con otro tipo o limpia los filtros.':'Las convocatorias aparecerán cuando empresas verificadas las publiquen en Neon.'}</p><button type="button" onClick={reset}>Limpiar filtros</button></div>}</div>
        <aside className="nex-suggest-column"><div className="nex-suggest-card"><h2><FiStar/> También te puede interesar</h2>{suggested.length?suggested.map(item=><div className="nex-suggest-row" key={item.id}><small>{typeName[typeFor(item.category)]||'Convocatoria'}</small><strong>{item.title}</strong><span>{item.organization||'Institución'}</span>{item.match?.total>0&&<span className="nex-suggest-match">{item.match.percent}% compatible</span>}</div>):<p>Cuando haya oportunidades publicadas, verás sugerencias aquí.</p>}</div><div className="nex-suggest-action"><FiAward/><h3>Tu perfil cuenta</h3><p>Registra tus habilidades, idiomas y estudios para recibir resultados de compatibilidad.</p><a href={isSignedIn?'/app/perfil':'/register'}>Completar perfil <FiArrowUpRight/></a></div></aside>
      </div>
    </div>
  </div>
}
