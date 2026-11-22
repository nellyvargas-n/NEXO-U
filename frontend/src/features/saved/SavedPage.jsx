import { useEffect, useState } from 'react'
import { FiBookmark, FiArrowUpRight, FiRefreshCw } from 'react-icons/fi'
import { apiRequest } from '../../shared/api/client.ts'
export default function SavedPage() {
  const [items,setItems]=useState(null);const [error,setError]=useState('');const [reload,setReload]=useState(0);const [busy,setBusy]=useState(null)
  useEffect(()=>{let live=true;apiRequest('v1/usuario/guardados').then(data=>{if(live)setItems(data)}).catch(e=>{if(live)setError(e.message)});return()=>{live=false}},[reload])
  async function remove(id){setBusy(id);setError('');try{await apiRequest(`v1/usuario/guardados/${id}`,{method:'DELETE'});setReload(n=>n+1)}catch(e){setError(e.message)}finally{setBusy(null)}}
  return <div className="nex-list-page"><div className="nex-page-lead"><FiBookmark/><h2>Oportunidades que guardaste</h2><p>Esta lista procede de tu cuenta en Neon, no del almacenamiento temporal del navegador.</p></div>{error&&<div role="alert" className="nex-info-message">{error}<button type="button" onClick={()=>setReload(n=>n+1)}><FiRefreshCw/> Reintentar</button></div>}{items===null?<div className="nex-no-data">Cargando tus guardados…</div>:items.length===0?<div className="nex-no-data"><FiBookmark/> Aún no guardaste oportunidades. <a href="/app/oportunidades">Explorar oportunidades</a></div>:<div className="nex-saved-list">{items.map(item=><article key={item.opportunity_id} className="nex-saved-item"><div><h3>{item.title}</h3><small>Cierre: {item.deadline||'Sin fecha'}</small></div><button type="button" disabled={busy===item.opportunity_id} onClick={()=>remove(item.opportunity_id)}>Quitar de guardados</button></article>)}</div>}</div>
}
