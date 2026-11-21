import { useRef, useState } from 'react'
import BrandMark from '../../../shared/components/BrandMark.jsx'
import { navigationStyles as styles } from '../navigationStyles.js'

function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const menuButtonRef = useRef(null)

  function handleMenuKeyDown(event) {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false)
      menuButtonRef.current?.focus()
    }
  }

  function closeMenu() {
    setIsOpen(false)
  }

  return (
    <header className={styles.header} onKeyDown={handleMenuKeyDown}>
      <div className={styles.inner}>
        <BrandMark />
        <nav className={styles.siteNav} aria-label="Navegación pública">
          <a className={styles.navLink} href="#como-funciona">Cómo funciona</a>
          <a className={styles.navLink} href="#privacidad">Privacidad</a>
        </nav>
        <div className={styles.actions}>
          <a className={styles.loginLink} href="/login">Iniciar sesión</a>
          <a className={styles.cta} href="/register">Crear cuenta <span className="text-[15px]" aria-hidden="true">↗</span></a>
        </div>
        <button
          className={styles.mobileToggle}
          type="button"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          aria-controls="mobile-public-menu"
          onClick={() => setIsOpen((open) => !open)}
          ref={menuButtonRef}
        >
          <span className={styles.menuIcon} aria-hidden="true">
            <i className={`${styles.menuLine} ${isOpen ? 'translate-y-[5.5px] rotate-45' : ''}`} />
            <i className={`${styles.menuLine} ${isOpen ? 'opacity-0' : ''}`} />
            <i className={`${styles.menuLine} ${isOpen ? '-translate-y-[5.5px] -rotate-45' : ''}`} />
          </span>
        </button>
      </div>
      <nav className={`${isOpen ? 'grid' : 'hidden'} ${styles.mobileMenu}`} id="mobile-public-menu" aria-label="Navegación pública móvil" aria-hidden={!isOpen}>
        <a className={styles.mobileLink} href="#como-funciona" onClick={closeMenu}>Cómo funciona <span aria-hidden="true">↗</span></a>
        <a className={styles.mobileLink} href="#privacidad" onClick={closeMenu}>Privacidad <span aria-hidden="true">↗</span></a>
        <a className={styles.mobileLink} href="#demo" onClick={closeMenu}>Ver demo <span aria-hidden="true">↗</span></a>
        <a className={styles.mobileLink} href="/login" onClick={closeMenu}>Iniciar sesión <span aria-hidden="true">↗</span></a>
        <a className={styles.mobileLink} href="/register" onClick={closeMenu}>Crear cuenta <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  )
}

export default PublicNavbar
