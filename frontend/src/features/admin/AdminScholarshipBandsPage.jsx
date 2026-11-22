import { useEffect, useState } from 'react'
import { getAdminErrorMessage, getPendingScholarshipBands, reviewScholarshipBand } from './admin.service.ts'
import { AdminEmpty, AdminLoading, AdminNotice, AdminPageHeading, AdminSurface, adminSecondaryButton } from './components/AdminUI.jsx'
import { useAutoRefresh } from '../../shared/hooks/useAutoRefresh.js'

function AdminScholarshipBandsPage() {
  const [bands, setBands] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [success, setSuccess] = useState('')
  const [workingId, setWorkingId] = useState(null)
  const refreshKey = useAutoRefresh()

  useEffect(() => {
    let isCurrent = true
    getPendingScholarshipBands()
      .then((result) => { if (isCurrent) { setBands(result); setError('') } })
      .catch((requestError) => { if (isCurrent) setError(getAdminErrorMessage(requestError)) })
      .finally(() => { if (isCurrent) setIsLoading(false) })
    return () => { isCurrent = false }
  }, [refreshKey])

  async function review(band, approved) {
    setActionError('')
    setSuccess('')
    setWorkingId(band.id)
    try {
      await reviewScholarshipBand(band.id, approved)
      setBands((current) => current.filter((item) => item.id !== band.id))
      setSuccess(approved ? 'Banda aprobada.' : 'Banda rechazada y retirada de pendientes.')
    } catch (requestError) {
      setActionError(getAdminErrorMessage(requestError))
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <>
      <AdminPageHeading eyebrow="SUPERVISIÓN" title="Bandas de beca" />
      <div className="mb-5">
        <AdminNotice tone="warning">No se puede aprobar: la API no incluye el promedio mínimo ni la nota mínima de Matemática.</AdminNotice>
      </div>
      {error ? <AdminNotice>{error}</AdminNotice> : null}
      {actionError ? <div className="mb-4"><AdminNotice>{actionError}</AdminNotice></div> : null}
      {success ? <div className="mb-4"><AdminNotice tone="success">{success}</AdminNotice></div> : null}
      {isLoading ? <AdminLoading>Consultando bandas pendientes…</AdminLoading> : !error ? (
        <AdminSurface>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 font-display text-xl font-semibold text-[#1c4033]">Bandas pendientes</h2>
              <p className="mb-0 mt-1 text-sm text-[#718075]">{bands.length} bandas por revisar</p>
            </div>
          </div>
          {bands.length === 0 ? <AdminEmpty>No hay bandas de beca pendientes de revisión.</AdminEmpty> : (
            <div className="grid gap-3">
              {bands.map((band) => {
                const canApprove = band.official_published === true && band.min_average !== undefined && band.min_math !== undefined
                return (
                  <article className="rounded-xl border border-[#e4ebe1] p-4" key={band.id}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h3 className="m-0 text-base font-semibold text-[#234637]">{band.opportunity_title ?? `Beca #${band.opportunity_id}`}</h3>
                        <p className="mb-0 mt-1 text-sm text-[#718075]">Banda #{band.id} · {band.percent_discount}% de descuento{band.organization_name ? ` · ${band.organization_name}` : ''}</p>
                        {canApprove ? <p className="mb-0 mt-2 text-sm text-[#53685c]">Promedio mínimo: {band.min_average} · Matemática: {band.min_math}</p> : null}
                        {band.official_url ? (
                          <a className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-[#246b4a] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#347a57]" href={band.official_url} target="_blank" rel="noreferrer">Abrir fuente oficial<span className="sr-only"> de {band.opportunity_title ?? `la beca #${band.opportunity_id}`}</span></a>
                        ) : <p className="mb-0 mt-3 text-sm text-[#9b302a]">No se recibió una fuente oficial.</p>}
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <button
                          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#1c5a42] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] disabled:cursor-not-allowed disabled:opacity-50"
                          type="button"
                          disabled={!canApprove || workingId === band.id}
                          onClick={() => review(band, true)}
                          title={canApprove ? undefined : 'El servidor debe incluir los umbrales oficiales para habilitar la aprobación.'}
                        >
                          {workingId === band.id ? 'Guardando…' : 'Aprobar'}
                        </button>
                        <button className={adminSecondaryButton} type="button" disabled={workingId === band.id} onClick={() => review(band, false)}>
                          {workingId === band.id ? 'Guardando…' : 'Rechazar'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </AdminSurface>
      ) : null}
    </>
  )
}

export default AdminScholarshipBandsPage
