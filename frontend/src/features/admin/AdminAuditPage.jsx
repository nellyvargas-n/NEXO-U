import { useEffect, useState } from 'react'
import { getAdminAudit, getAdminErrorMessage } from './admin.service.ts'
import { AdminEmpty, AdminLoading, AdminNotice, AdminPageHeading, AdminSurface } from './components/AdminUI.jsx'
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh.js'

const actionNames = {
  review_scholarship_band: 'Revisión de banda de beca',
  review_referral_agreement: 'Revisión de acuerdo de referidos',
  verify_organization: 'Verificación de organización',
  user_status: 'Cambio de estado de cuenta',
  change_password: 'Cambio de contraseña',
  password_reset: 'Restablecimiento de contraseña',
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function AdminAuditPage() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const refreshKey = useAutoRefresh()

  useEffect(() => {
    let isCurrent = true
    getAdminAudit()
      .then((result) => { if (isCurrent) { setRecords(result); setError('') } })
      .catch((requestError) => { if (isCurrent) setError(getAdminErrorMessage(requestError)) })
      .finally(() => { if (isCurrent) setIsLoading(false) })
    return () => { isCurrent = false }
  }, [refreshKey])

  return (
    <>
      <AdminPageHeading eyebrow="SUPERVISIÓN" title="Auditoría" />
      {error ? <AdminNotice>{error}</AdminNotice> : null}
      {isLoading ? <AdminLoading>Consultando auditoría…</AdminLoading> : !error ? (
        <AdminSurface>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 font-display text-xl font-semibold text-[#1c4033]">Actividad reciente</h2>
            </div>
          </div>
          {records.length === 0 ? <AdminEmpty>Aún no hay acciones administrativas registradas.</AdminEmpty> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e8ede6] text-xs uppercase tracking-wide text-[#718075]">
                    <th className="px-3 py-3 font-semibold">Fecha</th>
                    <th className="px-3 py-3 font-semibold">Acción</th>
                    <th className="px-3 py-3 font-semibold">Destino</th>
                    <th className="px-3 py-3 font-semibold">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr className="border-b border-[#eef2ec] last:border-0" key={record.id}>
                      <td className="whitespace-nowrap px-3 py-4 text-[#53685c]">{formatDate(record.created_at)}</td>
                      <td className="px-3 py-4 font-medium text-[#234637]">{actionNames[record.action] ?? record.action}</td>
                      <td className="px-3 py-4 text-[#53685c]">{record.target_type} · {record.target_id}</td>
                      <td className="px-3 py-4 text-[#53685c]">#{record.actor_user_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminSurface>
      ) : null}
    </>
  )
}

export default AdminAuditPage
