import BrandMark from '../../../shared/components/BrandMark.jsx'
import '../styles/navigation.css'

function AuthenticatedNavbar({ active = 'Inicio', studentName = 'Camila R.' }) {
  const links = [
    { label: 'Inicio', href: '/app' },
    { label: 'Oportunidades', href: '/app/oportunidades' },
    { label: 'Mi billetera', href: '/app/billetera' },
  ]

  return (
    <header className="site-header app-header">
      <div className="site-header__inner app-header__inner">
        <BrandMark href="/app" />
        <nav className="app-nav" aria-label="Navegación de estudiante">
          {links.map((link) => (
            <a className={active === link.label ? 'is-active' : ''} href={link.href} key={link.label} aria-current={active === link.label ? 'page' : undefined}>
              {link.label}
            </a>
          ))}
        </nav>
        <details className="student-dropdown">
          <summary className="student-menu" aria-label={`Abrir menú de ${studentName}`}>
            <span className="student-menu__avatar" aria-hidden="true">{studentName.slice(0, 1)}</span>
            <span className="student-menu__name">{studentName}</span>
            <span className="student-menu__chevron" aria-hidden="true">⌄</span>
          </summary>
          <nav className="student-dropdown__menu" aria-label="Menú de cuenta">
            <a className="dropdown-item" href="/app/perfil">Mi perfil <span aria-hidden="true">↗</span></a>
            <a className="dropdown-item" href="/app/privacidad">Privacidad <span aria-hidden="true">↗</span></a>
            <a className="dropdown-item" href="/app/configuracion">Configuración <span aria-hidden="true">↗</span></a>
          </nav>
        </details>
      </div>
    </header>
  )
}

export default AuthenticatedNavbar
