import { useEffect, useState } from 'react'
import { getAdminErrorMessage, getAdminUsers, setUserActive } from './admin.service.ts'
import { AdminEmpty, AdminLoading, AdminNotice, AdminPageHeading, AdminStatus, AdminSurface, adminPrimaryButton, adminSecondaryButton } from './components/AdminUI.jsx'

const roleNames = { usuario: 'Estudiante', empresa: 'Empresa', admin: 'Administración' }

function AdminUsersPage({ currentUserId }) {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')
  const [workingId, setWorkingId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true
    getAdminUsers()
      .then((result) => { if (isCurrent) setUsers(result) })
      .catch((requestError) => { if (isCurrent) setError(getAdminErrorMessage(requestError)) })
      .finally(() => { if (isCurrent) setIsLoading(false) })
    return () => { isCurrent = false }
  }, [reloadKey])

  async function toggleActive(user) {
    const active = !user.active
    setActionError('')
    setSuccess('')
    setWorkingId(user.id)
    try {
      const updated = await setUserActive(user.id, active)
      setUsers((current) => current.map((item) => item.id === user.id ? updated : item))
      setSuccess(active ? 'Cuenta reactivada.' : 'Cuenta desactivada.')
    } catch (requestError) {
      setActionError(getAdminErrorMessage(requestError))
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <>
      <AdminPageHeading eyebrow="SUPERVISIÓN" title="Usuarios" description="Consulta las cuentas registradas y administra su acceso cuando sea necesario." />
      {error ? <AdminNotice>{error}</AdminNotice> : null}
      {actionError ? <div className="mb-4"><AdminNotice>{actionError}</AdminNotice></div> : null}
      {success ? <div className="mb-4"><AdminNotice tone="success">{success}</AdminNotice></div> : null}
      {isLoading ? <AdminLoading>Consultando cuentas…</AdminLoading> : !error ? (
        <AdminSurface>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 font-display text-xl font-semibold text-[#1c4033]">Cuentas registradas</h2>
              <p className="mb-0 mt-1 text-sm text-[#718075]">La API devuelve hasta 100 cuentas por consulta.</p>
            </div>
            <button className={adminSecondaryButton} type="button" onClick={() => { setError(''); setIsLoading(true); setReloadKey((key) => key + 1) }}>Actualizar</button>
          </div>
          {users.length === 0 ? <AdminEmpty>No hay cuentas registradas.</AdminEmpty> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e8ede6] text-xs uppercase tracking-wide text-[#718075]">
                    <th className="px-3 py-3 font-semibold">Cuenta</th>
                    <th className="px-3 py-3 font-semibold">Rol</th>
                    <th className="px-3 py-3 font-semibold">Estado</th>
                    <th className="px-3 py-3 text-right font-semibold">Acceso</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isCurrentUser = user.id === currentUserId
                    return (
                      <tr className="border-b border-[#eef2ec] last:border-0" key={user.id}>
                        <td className="px-3 py-4">
                          <span className="block font-semibold text-[#234637]">{user.email}</span>
                          <span className="mt-1 block text-xs text-[#849187]">Cuenta #{user.id}{isCurrentUser ? ' · Tu cuenta' : ''}</span>
                        </td>
                        <td className="px-3 py-4 text-[#53685c]">{roleNames[user.role] ?? user.role}</td>
                        <td className="px-3 py-4"><AdminStatus active={user.active} yes="Activa" no="Desactivada" /></td>
                        <td className="px-3 py-4 text-right">
                          <button
                            className={user.active ? adminSecondaryButton : adminPrimaryButton}
                            type="button"
                            disabled={workingId === user.id || (isCurrentUser && user.active)}
                            onClick={() => toggleActive(user)}
                          >
                            {workingId === user.id ? 'Guardando…' : user.active ? isCurrentUser ? 'Cuenta actual' : 'Desactivar' : 'Reactivar'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AdminSurface>
      ) : null}
    </>
  )
}

export default AdminUsersPage
