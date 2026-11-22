import { useEffect, useState } from 'react'
import { FiBell,FiCheck } from 'react-icons/fi'
import { apiRequest } from '../../shared/api/client.ts'
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh.js'
export default function NotificationsPage(){
  const [items,setItems]=useState(null);const [error,setError]=useState('');const [loading,setLoading]=useState(null);const refreshKey=useAutoRefresh()
  useEffect(()=>{let live=true;apiRequest('v1/notificaciones').then(data=>{if(live){setItems(data);setError('')}}).catch(e=>{if(live)setError(e.message)});return()=>{live=false}},[refreshKey])
  async function mark(id){setLoading(id);try{await apiRequest(`v1/notificaciones/${id}/leer`,{method:'PATCH'});setItems(prev=>prev?.map(x=>x.id===id?{...x,read:true}:x))}catch(e){setError(e.message)}finally{setLoading(null)}}
  return <div className="nex-list-page"><div className="nex-page-lead"><FiBell/><h2>Notificaciones</h2></div>{error&&<div className="nex-info-message" role="alert">{error}</div>}{items===null?<div className="nex-no-data">Cargando…</div>:!items.length?<div className="nex-no-data"><FiBell/> No tienes notificaciones.</div>:items.map(item=><article className={`nex-notice-card ${item.read?'is-read':''}`} key={item.id}><span className="nex-notice-dot"/><div><h3>{item.title}</h3><p>{item.message}</p><small>{item.created_at ? new Intl.DateTimeFormat('es-BO',{dateStyle:'medium'}).format(new Date(item.created_at)):''}</small></div>{!item.read&&<button onClick={()=>mark(item.id)} type="button" disabled={loading===item.id}><FiCheck/> Marcar leída</button>}</article>)}</div>
}
