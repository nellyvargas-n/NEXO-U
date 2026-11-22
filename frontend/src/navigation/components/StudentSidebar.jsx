import BrandMark from '../../shared/components/BrandMark.jsx'

const groups = [
  {
    label: 'Tu espacio',
    items: [
      { label: 'Resumen', href: '/app', icon: 'home' },
      { label: 'Mi perfil', href: '/app/perfil', icon: 'user' },
    ],
  },
  {
    label: 'Oportunidades',
    items: [
      { label: 'Explorar todas', href: '/app/oportunidades', icon: 'search' },
      { label: 'Becas', href: '/app/oportunidades/becas', icon: 'award' },
      { label: 'Pasantías', href: '/app/oportunidades/pasantias', icon: 'briefcase' },
    ],
  },
  {
    label: 'Preparación',
    items: [
      { label: 'Credenciales', href: '/app/credenciales', icon: 'badge' },
      { label: 'Rutas de aprendizaje', href: '/app/rutas', icon: 'book' },
      { label: 'Cursos', href: '/app/cursos', icon: 'play' },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { label: 'Mi billetera', href: '/app/billetera', icon: 'wallet', tag: 'Opcional' },
      { label: 'Privacidad', href: '/app/privacidad', icon: 'shield' },
      { label: 'Configuración', href: '/app/configuracion', icon: 'settings' },
    ],
  },
]

const glyphs = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
  award: <><circle cx="12" cy="8" r="5" /><path d="m8.5 12-1 9 4.5-2.5 4.5 2.5-1-9" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
  badge: <><path d="M12 3 14 5l3-.2.8 2.8 2.4 1.8-1.1 2.8.7 2.9-2.7 1.4-1.2 2.8-3-.7-2.9.7-1.2-2.8-2.7-1.4.7-2.9-1.1-2.8 2.4-1.8L9 4.8 12 5z" /><path d="m9 12 2 2 4-4" /></>,
  book: <><path d="M12 7v14" /><path d="M3 5h5a4 4 0 0 1 4 4v12a4 4 0 0 0-4-4H3z" /><path d="M21 5h-5a4 4 0 0 0-4 4v12a4 4 0 0 1 4-4h5z" /></>,
  play: <><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4z" /></>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 8h18M16 14h2M6 5V3h12v2" /></>,
  shield: <><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z" /><path d="m9 12 2 2 4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.8 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.8-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.8-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.8 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" transform="translate(-1 -1)" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
}

function SidebarIcon({ name }) {
  return (
    <svg className="size-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {glyphs[name]}
    </svg>
  )
}

function StudentSidebar({ pathname, isOpen, onClose }) {
  return (
    <aside
      id="student-sidebar"
      className={[
        'fixed inset-y-0 left-0 z-50 flex h-dvh w-[278px] flex-col border-r border-[#e5ebe3] bg-[#fbfcf8] transition-transform duration-200 lg:z-auto lg:h-screen lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
      aria-label="Navegación del espacio estudiantil"
    >
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#e8ede6] px-6">
        <BrandMark href="/app" size="small" />
        <button
          className="grid size-10 place-items-center rounded-xl text-[#52685b] hover:bg-[#eef4ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858] lg:hidden"
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          <SidebarIcon name="close" />
        </button>
      </div>

      <div className="px-5 pb-4 pt-5">
        <p className="text-xs font-semibold text-[#89958b]">Espacio estudiantil</p>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#e6ece3] bg-white p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#d8eddb] text-sm font-bold text-[#215d43]" aria-hidden="true">NU</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-[#203a30]">Mi cuenta</span>
            <span className="mt-0.5 block text-[13px] text-[#7a897e]">Perfil académico</span>
          </span>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-4 pb-5" aria-label="Secciones del MVP">
        {groups.map((group) => (
          <section className="mb-5" key={group.label} aria-label={group.label}>
            <h2 className="mb-2 px-3 text-[13px] font-semibold text-[#89958b]">{group.label}</h2>
            <ul className="grid gap-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <a
                      className={[
                        'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247858]',
                        isActive ? 'bg-[#e8f2e6] font-semibold text-[#1f694a]' : 'font-medium text-[#53685c] hover:bg-[#f0f5ee] hover:text-[#214d39]',
                      ].join(' ')}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={onClose}
                    >
                      <SidebarIcon name={item.icon} />
                      <span className="min-w-0 flex-1">{item.label}</span>
                      {item.tag && <span className="rounded-full border border-[#e0e8dc] bg-white px-2 py-0.5 text-[13px] font-medium text-[#78877b]">{item.tag}</span>}
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[#e8ede6] px-5 py-4">
        <p className="text-[13px] leading-5 text-[#87948a]">Las credenciales declaradas necesitan confirmación de un emisor autorizado.</p>
      </div>
    </aside>
  )
}

export default StudentSidebar
