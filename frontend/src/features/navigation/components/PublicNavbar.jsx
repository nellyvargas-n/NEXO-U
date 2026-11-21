import { useRef, useState } from 'react'
import BrandMark from '../../../shared/components/BrandMark.jsx'
import '../styles/navigation.css'

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
    <header className={`site-header${isOpen ? ' site-header--menu-open' : ''}`} onKeyDown={handleMenuKeyDown}>
      <div className="site-header__inner">
        <BrandMark />
        <nav className="site-nav" aria-label="Navegación pública">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#privacidad">Privacidad</a>
        </nav>
        <a className="header-cta" href="#demo">Ver demo <span aria-hidden="true">↗</span></a>
        <button
          className="mobile-nav-toggle"
          type="button"
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isOpen}
          aria-controls="mobile-public-menu"
          onClick={() => setIsOpen((open) => !open)}
          ref={menuButtonRef}
        >
          <span className={`menu-icon${isOpen ? ' menu-icon--open' : ''}`} aria-hidden="true"><i /><i /><i /></span>
        </button>
      </div>
      <nav className="mobile-nav-menu" id="mobile-public-menu" aria-label="Navegación pública móvil" hidden={!isOpen}>
        <a href="#como-funciona" onClick={closeMenu}>Cómo funciona <span aria-hidden="true">↗</span></a>
        <a href="#privacidad" onClick={closeMenu}>Privacidad <span aria-hidden="true">↗</span></a>
        <a href="#demo" onClick={closeMenu}>Ver demo <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  )
}

export default PublicNavbar
