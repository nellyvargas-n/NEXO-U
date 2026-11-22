import { useEffect, useState } from 'react'
import { getAdminErrorMessage, getAdminOrganizations, setOrganizationVerification } from './admin.service.ts'
import { AdminEmpty, AdminLoading, AdminNotice, AdminPageHeading, AdminStatus, AdminSurface, adminPrimaryButton, adminSecondaryButton } from './components/AdminUI.jsx'

function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')
  const [workingId, setWorkingId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isCurrent = true
    getAdminOrganizations()
      .then((result) => { if (isCurrent) setOrganizations(result) })
      .catch((requestError) => { if (isCurrent) setError(getAdminErrorMessage(requestError)) })
      .finally(() => { if (isCurrent) setIsLoading(false) })
    return () => { isCurrent = false }
  }, [reloadKey])

  async function toggleVerification(organization) {
    const verified = !organization.verified
    setActionError('')
    setSuccess('')
    setWorkingId(organization.id)
    try {
      await setOrganizationVerification(organization.id, verified)
      setOrganizations((current) => current.map((item) => item.id === organization.id ? { ...item, verified } : item))
      setSuccess(verified ? 'Organización verificada.' : 'Se quitó la verificación de la organización.')
    } catch (requestError) {
      setActionError(getAdminErrorMessage(requestError))
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <>
      <AdminPageHeading eyebrow="SUPERVISIÓN" title="Organizaciones" description="Verifica a las organizaciones antes de que sus becas, pasantías y cursos aparezcan en el espacio estudiantil." />
      {error ? <AdminNotice>{error}</AdminNotice> : null}
      {actionError ? <div className="mb-4"><AdminNotice>{actionError}</AdminNotice></div> : null}
      {success ? <div className="mb-4"><AdminNotice tone="success">{success}</AdminNotice></div> : null}
      {isLoading ? <AdminLoading>Consultando organizaciones…</AdminLoading> : !error ? (
        <AdminSurface>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 font-display text-xl font-semibold text-[#1c4033]">Organizaciones registradas</h2>
              <p className="mb-0 mt-1 text-sm text-[#718075]">{organizations.length} registros recibidos</p>
            </div>
            <button className={adminSecondaryButton} type="button" onClick={() => { setError(''); setIsLoading(true); setReloadKey((key) => key + 1) }}>Actualizar</button>
          </div>
          {organizations.length === 0 ? <AdminEmpty>No hay organizaciones registradas todavía.</AdminEmpty> : (
            <div className="grid gap-3">
              {organizations.map((organization) => (
                <article className="flex flex-col gap-4 rounded-xl border border-[#e4ebe1] p-4 sm:flex-row sm:items-center sm:justify-between" key={organization.id}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="m-0 text-base font-semibold text-[#234637]">{organization.name}</h3>
                      <AdminStatus active={organization.verified} yes="Verificada" no="Pendiente" />
                    </div>
                    <p className="mb-0 mt-2 text-sm text-[#718075]">Organización #{organization.id} · Cuenta responsable #{organization.owner_user_id}</p>
                  </div>
                  <button
                    className={organization.verified ? adminSecondaryButton : adminPrimaryButton}
                    type="button"
                    disabled={workingId === organization.id}
                    onClick={() => toggleVerification(organization)}
                  >
                    {workingId === organization.id ? 'Guardando…' : organization.verified ? 'Quitar verificación' : 'Verificar organización'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </AdminSurface>
      ) : null}
    </>
  )
}

export default AdminOrganizationsPage
