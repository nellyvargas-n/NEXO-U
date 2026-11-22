import {
  FiActivity,
  FiAward,
  FiGrid,
  FiLogOut,
  FiShield,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import BrandMark from '../../shared/components/BrandMark.jsx'
import { clearAccessToken } from '../../shared/api/session.ts'

const sections = [
  {
    label: 'Panel',
    items: [{ label: 'Resumen', href: '/admin', icon: FiGrid }],
  },
  {
    label: 'Supervisión',
    items: [
      { label: 'Organizaciones', href: '/admin/organizaciones', icon: FiShield },
      { label: 'Usuarios', href: '/admin/usuarios', icon: FiUsers },
      { label: 'Revisión de becas', href: '/admin/becas', icon: FiAward },
      { label: 'Auditoría', href: '/admin/auditoria', icon: FiActivity },
    ],
  },
]

function AdminSidebar({ pathname, isOpen, onClose }) {
  function signOut() {
    clearAccessToken()
    window.location.assign('/login')
  }

  return (
    <aside
      id="admin-sidebar"
      className={[
        'fixed inset-y-0 left-0 z-50 flex h-dvh w-[278px] flex-col border-r border-[#e5ebe3] bg-[#fbfcf8] transition-transform duration-200 lg:z-auto lg:h-screen lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
      aria-label="Navegación administrativa"
    >
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#e8ede6] px-6">
        <BrandMark href="/admin" size="small" />
        <button
          className="grid size-10 place-items-center rounded-xl text-[#52685b] hover:bg-[#eef4ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858] lg:hidden"
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <FiX className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="px-5 pb-4 pt-5">
        <p className="m-0 text-xs font-semibold text-[#89958b]">Administración</p>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#e6ece3] bg-white p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#d8eddb] text-sm font-bold text-[#215d43]" aria-hidden="true">NU</span>
          <span>
            <span className="block text-sm font-semibold text-[#203a30]">Panel de control</span>
            <span className="mt-0.5 block text-[13px] text-[#7a897e]">Cuenta administradora</span>
          </span>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-5" aria-label="Secciones administrativas">
        {sections.map((section) => (
          <section className="mb-5" key={section.label} aria-label={section.label}>
            <h2 className="mb-2 px-3 text-[13px] font-semibold text-[#89958b]">{section.label}</h2>
            <ul className="grid gap-1">
              {section.items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href
                return (
                  <li key={href}>
                    <a
                      className={[
                        'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858]',
                        active ? 'bg-[#e8f2e6] font-semibold text-[#1f694a]' : 'font-medium text-[#53685c] hover:bg-[#f0f5ee] hover:text-[#214d39]',
                      ].join(' ')}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      onClick={onClose}
                    >
                      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
                      <span>{label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[#e8ede6] px-5 py-4">
        <button
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-[#53685c] transition-colors hover:bg-[#f0f5ee] hover:text-[#214d39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858]"
          type="button"
          onClick={signOut}
        >
          <FiLogOut className="size-[18px] shrink-0" aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
