import { useCallback, useEffect, useState } from 'react'
import BrandMark from '../../shared/components/BrandMark.jsx'
import { getCurrentUser } from '../../shared/api/modules/auth.service.ts'
import { clearAccessToken } from '../../shared/api/session.ts'
import { apiRequest } from '../../shared/api/client.ts'

const actionClass = 'min-h-10 rounded-xl border border-[#c8e0d1] bg-white px-4 py-2 text-sm font-semibold text-[#21684c] transition hover:bg-[#eaf4ec] disabled:opacity-50'
function Box({title,children}) { return <section className="nx-role-card rounded-2xl border bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-4 text-lg font-bold text-[#193e31]">{title}</h2>{children}</section> }

export default function AdminPortal() {
  const [access,setAccess] = useState('loading')
  const [users,setUsers] = useState([])
  const [organizations,setOrganizations] = useState([])
  const [summary,setSummary] = useState(null)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [busy,setBusy] = useState(false)

  const refresh=useCallback(async () => {
    const [us,orgs,stats] = await Promise.all([
      apiRequest('v1/admin/usuarios'),
      apiRequest('v1/admin/organizaciones'),
      apiRequest('v1/admin/resumen'),
    ])
    setUsers(us);setOrganizations(orgs);setSummary(stats)
  },[])

  useEffect(() => {
    let live=true
    getCurrentUser().then(async (me) => {
      if (!live) return
      if (me.role!=='admin') {setAccess('denied');return}
      await refresh()
      if(live) setAccess('ready')
    }).catch(e => {if(live) {setError(e.message);setAccess('failed')}})
    return ()=> {live=false}
  },[refresh])

  async function update(promise, success) {
    setBusy(true);setError('');setNotice('')
    try {await promise();await refresh();setNotice(success)}
    catch(e) {setError(e.message||'No fue posible guardar el cambio')}
    finally {setBusy(false)}
  }

  return <div className="nx-role-workspace nx-admin-workspace min-h-screen">
    <header className="nx-role-topbar"><div className="mx-auto flex min-h-[74px] max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3"><BrandMark href="/" size="small" /><div className="flex items-center gap-4"><span className="text-xs font-bold uppercase tracking-widest text-[#438b6b]">Administración segura</span><button type="button" className={actionClass} onClick={()=>{clearAccessToken();window.location.assign('/login')}}>Cerrar sesión</button></div></div></header>
    <main className="nx-role-main mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#468b69]">NEXO U · Administración</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Centro de control</h1><p className="mt-2 text-sm text-[#677a6e]">Verifica instituciones y controla las cuentas sin acceder a saldos personales.</p></div>
      <nav className="nx-role-tabs" aria-label="Secciones de administración"><a href="#verificaciones">Verificar instituciones</a><a href="#cuentas">Cuentas y accesos</a><a href="/explorar">Portal público ↗</a></nav>
      {access==='loading' && <Box title="Cargando">Comprobando credenciales de administrador…</Box>}
      {(access==='failed'||access==='denied') && <Box title="Acceso restringido"><p role="alert" className="text-sm text-red-700">{error || 'Solo las cuentas administrador pueden entrar a este panel.'}</p><a href="/login" className="mt-4 inline-block font-semibold text-[#1d684e]">Iniciar sesión</a></Box>}
      {access==='ready' && <>
        {error && <p role="alert" className="rounded-xl border border-[#f2cbca] bg-[#fff4f3] p-3 text-sm text-red-700">{error}</p>}
        {notice && <p role="status" className="rounded-xl border border-[#cae8ce] bg-[#eff9f1] p-3 text-sm text-[#276248]">{notice}</p>}
        <div className="nx-role-stats grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[[summary?.users,'Usuarios'],[summary?.organizations,'Organizaciones'],[summary?.pending_verification,'Por verificar'],[summary?.opportunities,'Oportunidades'],[summary?.courses,'Cursos']].map(([count,name])=><div key={name} className="nx-role-stat rounded-2xl border bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#718678]">{name}</p><p className="mt-2 text-3xl font-bold text-[#1d684e]">{count ?? '—'}</p></div>)}
        </div>
        <div className="flex justify-end"><button className={actionClass} onClick={() => update(async()=>{},'Panel actualizado')} disabled={busy}>Actualizar datos</button></div>
        <div id="verificaciones"><Box title="Verificación de organizaciones">
          <p className="mb-4 text-sm text-[#667b6c]">Comprueba fuera de la plataforma la identidad de cada institución antes de aprobarla. Las aprobadas pueden publicar cursos y convocatorias.</p>
          <div className="grid gap-3">{organizations.length ? organizations.map(o=><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f3f7f3] p-4" key={o.id}><div><p className="font-semibold text-[#2d5641]">{o.name}</p><p className="text-xs text-[#7c8a80]">Organización #{o.id} · Propietario #{o.owner_user_id} · {o.verified ? 'Verificada' : 'Pendiente'}</p></div><button className={actionClass} type="button" disabled={busy} onClick={()=>update(()=>apiRequest(`v1/admin/organizaciones/${o.id}/verificacion`,{method:'PATCH',body:JSON.stringify({verified:!o.verified})}),o.verified?'Verificación revocada.':'Organización verificada.')}>{o.verified?'Revocar verificación':'Verificar organización'}</button></div>) : <p className="text-sm text-[#738478]">Aún no hay organizaciones registradas.</p>}</div>
        </Box></div>
        <div id="cuentas"><Box title="Usuarios y acceso">
          <p className="mb-4 text-sm text-[#667b6c]">El rol administrador no se asigna desde el registro público. Solo gestiona cuentas existentes.</p>
          <div className="overflow-x-auto"><table className="w-full min-w-[590px] text-left text-sm"><thead className="border-b border-[#e7eee8] text-[#718678]"><tr><th className="p-3">Cuenta</th><th className="p-3">Rol</th><th className="p-3">Estado</th><th className="p-3 text-right">Acción</th></tr></thead><tbody>{users.map(u=><tr className="border-b border-[#edf0ee]" key={u.id}><td className="p-3"><span className="font-semibold text-[#305742]">{u.email}</span><span className="block text-xs text-[#829184]">ID #{u.id}</span></td><td className="p-3">{u.role}</td><td className="p-3">{u.active?'Activa':'Suspendida'}</td><td className="p-3 text-right"><button type="button" disabled={busy || (u.role==='admin' && u.active)} title={u.role==='admin'?'No desactives cuentas administradoras desde este panel':''} className={actionClass} onClick={()=>update(()=>apiRequest(`v1/admin/usuarios/${u.id}`,{method:'PATCH',body:JSON.stringify({active:!u.active})}),u.active?'Cuenta suspendida':'Cuenta reactivada')}>{u.active?'Desactivar':'Activar'}</button></td></tr>)}</tbody></table></div>
        </Box></div>
      </>}
    </main>
  </div>
}
