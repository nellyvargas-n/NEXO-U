import { useEffect, useState } from 'react'
import { getAdminDashboard, getAdminErrorMessage } from './admin.service.ts'
import { AdminLoading, AdminNotice, AdminPageHeading, AdminSurface } from './components/AdminUI.jsx'

const cards = [
  { key: 'users', label: 'Cuentas registradas' },
  { key: 'organizations', label: 'Organizaciones' },
  { key: 'pending_verification', label: 'Por verificar' },
  { key: 'opportunities', label: 'Oportunidades publicadas' },
  { key: 'courses', label: 'Cursos publicados' },
]

const shortcuts = [
  { href: '/admin/organizaciones', title: 'Verificar organizaciones', description: 'Revisa las organizaciones pendientes antes de habilitar sus publicaciones.' },
  { href: '/admin/usuarios', title: 'Gestionar cuentas', description: 'Consulta el estado y el rol de las cuentas registradas.' },
  { href: '/admin/becas', title: 'Revisar bandas de becas', description: 'Inspecciona las bandas que esperan una decisión administrativa.' },
  { href: '/admin/auditoria', title: 'Consultar auditoría', description: 'Revisa las acciones administrativas registradas por la API.' },
]

function AdminDashboardPage() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    getAdminDashboard()
      .then((result) => { if (isCurrent) setSummary(result) })
      .catch((requestError) => { if (isCurrent) setError(getAdminErrorMessage(requestError)) })
    return () => { isCurrent = false }
  }, [])

  return (
    <>
      <AdminPageHeading eyebrow="CENTRO DE CONTROL" title="Resumen administrativo" description="Supervisa las cuentas, organizaciones y publicaciones que forman parte de Nexo U." />
      {error ? <AdminNotice>{error}</AdminNotice> : !summary ? <AdminLoading /> : (
        <div className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <AdminSurface className="p-5" key={card.key}>
                <p className="m-0 text-sm font-medium text-[#718075]">{card.label}</p>
                <p className="mb-0 mt-3 font-display text-3xl font-semibold tracking-tight text-[#1c4033]">{summary[card.key]}</p>
              </AdminSurface>
            ))}
          </div>

          <AdminSurface>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="m-0 font-display text-xl font-semibold text-[#1c4033]">Accesos de supervisión</h2>
                <p className="mb-0 mt-2 text-sm leading-6 text-[#718075]">Las decisiones se registran en la auditoría administrativa.</p>
              </div>
              <span className="rounded-full bg-[#fff5de] px-3 py-1.5 text-xs font-semibold text-[#84662b]">{summary.pending_verification} por verificar</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {shortcuts.map((shortcut) => (
                <a className="group rounded-xl border border-[#e4ebe1] p-4 transition-colors hover:bg-[#f7faf5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438c61]" href={shortcut.href} key={shortcut.href}>
                  <span className="block text-sm font-semibold text-[#245d43]">{shortcut.title}<span aria-hidden="true" className="ml-2 transition-transform group-hover:translate-x-0.5">→</span></span>
                  <span className="mt-1 block text-sm leading-5 text-[#718075]">{shortcut.description}</span>
                </a>
              ))}
            </div>
          </AdminSurface>
        </div>
      )}
    </>
  )
}

export default AdminDashboardPage
