import { useRef, useState } from 'react'
import BrandMark from '../../../shared/components/BrandMark.jsx'

function PublicNavbar({ currentPage = 'landing' }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuButtonRef = useRef(null)
  const isLanding = currentPage === 'landing'
  const primaryAction = currentPage === 'register'
    ? { label: 'Iniciar sesión', href: '/login' }
    : { label: 'Crear cuenta', href: '/register' }

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#183d32]/10 bg-[#fbfcf8]/95 backdrop-blur-xl" onKeyDown={handleMenuKeyDown}>
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-6 px-6 max-[700px]:h-[66px] max-[700px]:gap-3 max-[430px]:px-4">
        <BrandMark href="/" size="small" compactOnNarrow />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
          {isLanding ? (
            <>
              <a className="text-sm font-medium text-[#4d6458] transition-colors hover:text-[#236b4d] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#236b4d]" href="#como-funciona">Cómo funciona</a>
              <a className="text-sm font-medium text-[#4d6458] transition-colors hover:text-[#236b4d] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#236b4d]" href="#privacidad">Privacidad</a>
            </>
          ) : (
            <a className="text-sm font-medium text-[#4d6458] transition-colors hover:text-[#236b4d] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#236b4d]" href="/">Inicio</a>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-5 max-[700px]:gap-2">
          {isLanding && <a className="rounded-lg px-2 py-3 text-sm font-semibold text-[#4d6458] transition-colors hover:text-[#236b4d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#236b4d] max-[700px]:hidden" href="/login">Iniciar sesión</a>}
          <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1c5a42] px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#247452] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c5a42] active:translate-y-0 max-[390px]:px-3" href={primaryAction.href}>
            {primaryAction.label}<span className="text-base" aria-hidden="true">↗</span>
          </a>
          <button
            className="inline-flex size-11 items-center justify-center rounded-xl border border-[#d8e2d7] bg-white text-[#1c5a42] transition hover:bg-[#eff6ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#438c61] md:hidden"
            type="button"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isOpen}
            aria-controls="mobile-public-menu"
            onClick={() => setIsOpen((open) => !open)}
            ref={menuButtonRef}
          >
            <span className="grid w-4 gap-1" aria-hidden="true">
              <i className={`block h-0.5 w-4 rounded bg-current transition-transform ${isOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
              <i className={`block h-0.5 w-4 rounded bg-current transition-opacity ${isOpen ? 'opacity-0' : ''}`} />
              <i className={`block h-0.5 w-4 rounded bg-current transition-transform ${isOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>

      <nav
        className={`${isOpen ? 'grid' : 'hidden'} absolute inset-x-0 top-full gap-1 border-t border-[#e3eae1] bg-[#fbfcf8] px-4 py-3 shadow-lg shadow-[#15312f]/10 md:hidden`}
        id="mobile-public-menu"
        aria-label="Navegación móvil"
        aria-hidden={!isOpen}
      >
        {isLanding ? (
          <>
            <a className="flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium text-[#47655b] transition hover:bg-[#eff6ed]" href="#como-funciona" onClick={closeMenu}>Cómo funciona <span aria-hidden="true">↗</span></a>
            <a className="flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium text-[#47655b] transition hover:bg-[#eff6ed]" href="#privacidad" onClick={closeMenu}>Privacidad <span aria-hidden="true">↗</span></a>
            <a className="flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium text-[#47655b] transition hover:bg-[#eff6ed]" href="#demo" onClick={closeMenu}>Ver demo <span aria-hidden="true">↗</span></a>
            <a className="flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium text-[#47655b] transition hover:bg-[#eff6ed]" href="/login" onClick={closeMenu}>Iniciar sesión <span aria-hidden="true">↗</span></a>
            <a className="flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium text-[#47655b] transition hover:bg-[#eff6ed]" href="/register" onClick={closeMenu}>Crear cuenta <span aria-hidden="true">↗</span></a>
          </>
        ) : (
          <>
            <a className="flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium text-[#47655b] transition hover:bg-[#eff6ed]" href="/" onClick={closeMenu}>Inicio <span aria-hidden="true">↗</span></a>
            <a className="flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium text-[#47655b] transition hover:bg-[#eff6ed]" href={primaryAction.href} onClick={closeMenu}>{primaryAction.label} <span aria-hidden="true">↗</span></a>
          </>
        )}
      </nav>
    </header>
  )
}

export default PublicNavbar
