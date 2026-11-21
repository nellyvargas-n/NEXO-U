import BrandMark from '../../../shared/components/BrandMark.jsx'

function PublicNavbar() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <BrandMark />
        <nav className="site-nav" aria-label="Navegación pública">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#privacidad">Privacidad</a>
        </nav>
        <a className="header-cta" href="#demo">Ver demo <span aria-hidden="true">↗</span></a>
      </div>
    </header>
  )
}

export default PublicNavbar
