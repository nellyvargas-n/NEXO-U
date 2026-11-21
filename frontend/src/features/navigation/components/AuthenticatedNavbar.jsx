import BrandMark from '../../../shared/components/BrandMark.jsx'
import { navigationStyles as styles } from '../navigationStyles.js'

function AuthenticatedNavbar({ active = 'Inicio', studentName = 'Camila R.' }) {
  const links = [
    { label: 'Inicio', href: '/app' },
    { label: 'Oportunidades', href: '/app/oportunidades' },
    { label: 'Mi billetera', href: '/app/billetera' },
  ]

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} ${styles.appInner}`}>
        <BrandMark href="/app" />
        <nav className={styles.appNav} aria-label="Navegación de estudiante">
          {links.map((link) => (
            <a className={`${styles.appNavLink} ${active === link.label ? styles.activeAppLink : ''} ${link.label === 'Mi billetera' ? 'max-[700px]:hidden' : 'max-[700px]:px-2 max-[700px]:text-[10px]'}`} href={link.href} key={link.label} aria-current={active === link.label ? 'page' : undefined}>
              {link.label}
            </a>
          ))}
        </nav>
        <details className={`${styles.studentDropdown} group`}>
          <summary className={styles.studentMenu} aria-label={`Abrir menú de ${studentName}`}>
            <span className={styles.avatar} aria-hidden="true">{studentName.slice(0, 1)}</span>
            <span className={styles.studentName}>{studentName}</span>
            <span className={styles.chevron} aria-hidden="true">⌄</span>
          </summary>
          <nav className={styles.dropdown} aria-label="Menú de cuenta">
            <a className={`${styles.dropdownLink} group`} href="/app/perfil">Mi perfil <span className={styles.dropdownArrow} aria-hidden="true">↗</span></a>
            <a className={`${styles.dropdownLink} group`} href="/app/privacidad">Privacidad <span className={styles.dropdownArrow} aria-hidden="true">↗</span></a>
            <a className={`${styles.dropdownLink} group`} href="/app/configuracion">Configuración <span className={styles.dropdownArrow} aria-hidden="true">↗</span></a>
          </nav>
        </details>
      </div>
    </header>
  )
}

export default AuthenticatedNavbar
