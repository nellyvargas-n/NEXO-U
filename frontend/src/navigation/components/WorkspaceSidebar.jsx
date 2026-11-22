import { useState } from 'react'
import { FiLogOut, FiX } from 'react-icons/fi'
import BrandMark from '../../shared/components/BrandMark.jsx'
import { clearAccessToken } from '../../shared/api/session.ts'

function WorkspaceSidebar({
  id,
  ariaLabel,
  homeHref,
  sectionLabel,
  identity,
  groups,
  pathname,
  isOpen,
  onClose,
}) {
  const [activeHref, setActiveHref] = useState(() => window.location.hash || pathname)

  function signOut() {
    clearAccessToken()
    window.location.assign('/login')
  }

  return (
    <aside
      id={id}
      className={`nx-student-sidebar nx-role-sidebar${isOpen ? ' is-open' : ''}`}
      aria-label={ariaLabel}
    >
      <div className="nx-sidebar-brand">
        <BrandMark href={homeHref} size="small" />
        <button className="nx-sidebar-close" onClick={onClose} aria-label="Cerrar menú" type="button">
          <FiX aria-hidden="true" />
        </button>
      </div>

      <div className="nx-sidebar-identity">
        <small>{sectionLabel}</small>
        <strong>{identity}</strong>
      </div>

      <nav className="nx-sidebar-nav" aria-label={ariaLabel}>
        {groups.map((group) => (
          <section key={group.label}>
            <h2>{group.label}</h2>
            <ul>
              {group.items.map(({ label, href, icon: Icon }) => {
                const target = new URL(href, window.location.href)
                const active = activeHref === href || (
                  target.pathname === pathname && (!target.hash || target.hash === window.location.hash)
                )
                return (
                  <li key={href}>
                    <a
                      className={active ? 'nx-active' : ''}
                      href={href}
                      onClick={() => { setActiveHref(href); onClose?.() }}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon aria-hidden="true" />
                      <span>{label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </nav>

      <div className="nx-sidebar-foot">
        <button type="button" onClick={signOut}>
          <FiLogOut aria-hidden="true" /> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default WorkspaceSidebar
