import { useEffect, useState } from 'react'
import { FiBookmark } from 'react-icons/fi'
import { apiRequest } from '../../shared/api/client.ts'
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh.js'
export default function SavedPage() {
  const [items,setItems]=useState(null);const [error,setError]=useState('');const [busy,setBusy]=useState(null);const refreshKey=useAutoRefresh()
  useEffect(()=>{let live=true;apiRequest('v1/usuario/guardados').then(data=>{if(live){setItems(data);setError('')}}).catch(e=>{if(live)setError(e.message)});return()=>{live=false}},[refreshKey])
  async function remove(id){setBusy(id);setError('');try{await apiRequest(`v1/usuario/guardados/${id}`,{method:'DELETE'});setItems(current=>current?.filter(item=>item.opportunity_id!==id))}catch(e){setError(e.message)}finally{setBusy(null)}}
  return <div className="nex-list-page"><div className="nex-page-lead"><FiBookmark/><h2>Oportunidades guardadas</h2></div>{error&&<div role="alert" className="nex-info-message">{error}</div>}{items===null?<div className="nex-no-data">Cargando…</div>:items.length===0?<div className="nex-no-data"><FiBookmark/> No guardaste oportunidades. <a href="/app/oportunidades">Explorar</a></div>:<div className="nex-saved-list">{items.map(item=><article key={item.opportunity_id} className="nex-saved-item"><div><h3>{item.title}</h3><small>Cierre: {item.deadline||'Sin fecha'}</small></div><button type="button" disabled={busy===item.opportunity_id} onClick={()=>remove(item.opportunity_id)}>Quitar</button></article>)}</div>}</div>
}
