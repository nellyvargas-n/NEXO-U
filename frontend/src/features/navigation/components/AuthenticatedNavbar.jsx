import BrandMark from '../../../shared/components/BrandMark.jsx'
import Icon from '../../../shared/components/Icon.jsx'

const links = [
  { label: 'Inicio', href: '/app' },
  { label: 'Oportunidades', href: '/app/oportunidades' },
  { label: 'Mi billetera', href: '/app/billetera' },
]

function AuthenticatedNavbar({ active = 'Inicio', studentName = 'Camila R.' }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#183d32]/10 bg-[#fbfcf8]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-6 max-[700px]:h-[66px] max-[430px]:px-4">
        <BrandMark href="/app" size="small" />
        <nav className="flex flex-1 items-center justify-center gap-2 max-[700px]:justify-end" aria-label="Navegación de estudiante">
          {links.map((link) => {
            const isWallet = link.label === 'Mi billetera'
            const isActive = active === link.label
            return (
              <a
                className={`inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438c61] ${isActive ? 'bg-[#eaf3e7] text-[#236b4d]' : 'text-[#4d6458] hover:bg-[#f0f5ed] hover:text-[#236b4d]'} ${isWallet ? 'max-[700px]:hidden' : ''}`}
                href={link.href}
                key={link.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </a>
            )
          })}
        </nav>

        <details className="group relative">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-xl px-2 text-[#344b3c] transition hover:bg-[#eff6ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438c61]">
            <span className="grid size-9 place-items-center rounded-full bg-[#c9efd9] text-sm font-bold text-[#16493e]" aria-hidden="true">{studentName.slice(0, 1)}</span>
            <span className="text-sm font-semibold max-[700px]:hidden">{studentName}</span>
            <Icon name="chevron-down" className="size-4 text-[#71827c] transition-transform group-open:rotate-180" />
          </summary>
          <nav className="absolute top-[calc(100%+10px)] right-0 z-[60] grid w-56 gap-1 rounded-2xl border border-[#e4ebe2] bg-white p-2 shadow-xl shadow-[#15312f]/10 max-[700px]:w-[min(224px,calc(100vw-32px))]" aria-label="Menú de cuenta">
            <a className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-[#536c60] transition hover:bg-[#eff6ed] hover:text-[#226b4d]" href="/app/billetera">Mi billetera</a>
            <a className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-[#536c60] transition hover:bg-[#eff6ed] hover:text-[#226b4d]" href="/app/perfil">Mi perfil</a>
            <a className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-[#536c60] transition hover:bg-[#eff6ed] hover:text-[#226b4d]" href="/app/privacidad">Privacidad</a>
            <a className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-[#536c60] transition hover:bg-[#eff6ed] hover:text-[#226b4d]" href="/app/configuracion">Configuración</a>
          </nav>
        </details>
      </div>
    </header>
  )
}

export default AuthenticatedNavbar
