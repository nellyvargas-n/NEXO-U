import BrandMark from '../../../shared/components/BrandMark.jsx'

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
        <button className="student-menu" type="button" aria-label={`Menú de ${studentName}`}>
          <span className="student-menu__avatar" aria-hidden="true">{studentName.slice(0, 1)}</span>
          <span className="student-menu__name">{studentName}</span>
          <span className="student-menu__chevron" aria-hidden="true">⌄</span>
        </button>
      </div>
    </header>
  )
}

export default AuthenticatedNavbar
