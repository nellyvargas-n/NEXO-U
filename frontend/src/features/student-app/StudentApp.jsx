import { useEffect, useState } from 'react'
import { FiBell, FiMenu, FiSearch, FiUser, FiArrowUpRight, FiAward, FiLogOut } from 'react-icons/fi'
import BrandMark from '../../shared/components/BrandMark.jsx'
import StudentSidebar from '../../navigation/components/StudentSidebar.jsx'
import StudentPageHeading from './components/StudentPageHeading.jsx'
import { findStudentAppRoute } from '../../routes/studentAppRoutes.js'
import { getAccessToken, clearAccessToken } from '../../shared/api/session.ts'
import { getStudentProfiles } from '../profile/profile.service.ts'
import { apiRequest } from '../../shared/api/client.ts'

export default function StudentApp({ pathname = '/app' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [identity, setIdentity] = useState('Mi cuenta')
  const [unread, setUnread] = useState(null)
  const page = findStudentAppRoute(pathname)
  const Page = page.component
  const isExplore = pathname === '/app/oportunidades'
  const logout = () => { clearAccessToken(); window.location.replace('/login') }

  useEffect(() => {
    if (!getAccessToken()) { window.location.replace('/login'); return }
    let live = true
    getStudentProfiles().then(({ university, school }) => {
      if (!live) return
      const name = university?.name || school?.full_name
      if (name) setIdentity(name)
      if (pathname === '/app' && !university && !school) window.location.replace('/app/perfil')
    }).catch(() => undefined)
    apiRequest('v1/notificaciones').then((items) => { if (live && Array.isArray(items)) setUnread(items.filter(n => !n.read).length) }).catch(() => {})
    return () => { live = false }
  }, [pathname])

  return (
    <div className="nx-workspace nx-student-workspace">
      {menuOpen && <button className="nx-drawer-overlay" onClick={() => setMenuOpen(false)} aria-label="Cerrar navegación" type="button" />}
      <StudentSidebar pathname={page.activePath} isOpen={menuOpen} onClose={() => setMenuOpen(false)} identity={identity} />
      <div className="nx-workspace-body">
        <header className="nx-workspace-header">
          <div className="nx-workspace-location"><button type="button" className="nx-icon-btn nx-menu-trigger" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}><FiMenu /></button><span className="nx-mobile-brand"><BrandMark href="/app" size="small" /></span><span className="nx-breadcrumb">Mi espacio <span>/</span> <strong>{page.title}</strong></span></div>
          <div className="nx-workspace-actions"><a className="nx-quick-search" href="/app/oportunidades"><FiSearch /> Buscar becas, pasantías y cursos</a><a className="nx-icon-btn nx-bell-link" href="/app/notificaciones" aria-label={unread ? `${unread} notificaciones sin leer` : 'Ver notificaciones'}><FiBell />{unread > 0 && <span className="nx-unread-count">{unread > 9 ? '9+' : unread}</span>}</a><a className="nx-workspace-action-link" href="/app/perfil" aria-label="Abrir mi perfil académico"><FiUser /><span>Mi perfil</span></a><a className="nx-workspace-action-link" href="/app/credenciales" aria-label="Registrar habilidades y credenciales"><FiAward /><span>Mis habilidades</span></a><button className="nx-workspace-logout" type="button" onClick={logout} aria-label="Cerrar sesión"><FiLogOut /><span>Cerrar sesión</span></button></div>
        </header>
        <main className={`nx-workspace-content ${isExplore ? 'nx-workspace-explore' : ''}`}>
          {!isExplore && pathname !== '/app' && <StudentPageHeading page={page} />}
          {isExplore ? <Page embedded /> : <Page />}
          <footer className="nx-workspace-footer">NEXO U · Los resultados dependen de los requisitos y fechas publicados por cada institución. <a href="/app/privacidad">Privacidad <FiArrowUpRight /></a></footer>
        </main>
      </div>
    </div>
  )
}
