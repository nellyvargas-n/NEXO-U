import { FiHome, FiSearch, FiAward, FiBriefcase, FiBookOpen, FiLayers, FiBookmark, FiUser, FiSettings, FiShield, FiLogOut, FiX, FiCreditCard, FiBell } from 'react-icons/fi'
import BrandMark from '../../shared/components/BrandMark.jsx'
import { clearAccessToken } from '../../shared/api/session.ts'

const groups = [
  { label:'Mi espacio', items:[['Dashboard','/app',FiHome],['Oportunidades','/app/oportunidades',FiSearch],['Becas','/app/oportunidades/becas',FiAward],['Pasantías','/app/oportunidades/pasantias',FiBriefcase]] },
  { label:'Formación', items:[['Cursos','/app/cursos',FiBookOpen],['Rutas de aprendizaje','/app/rutas',FiLayers],['Habilidades y credenciales','/app/credenciales',FiAward]] },
  { label:'Cuenta', items:[['Guardados','/app/guardados',FiBookmark],['Notificaciones','/app/notificaciones',FiBell],['Mi perfil académico','/app/perfil',FiUser],['Billetera','/app/billetera',FiCreditCard],['Configuración','/app/configuracion',FiSettings],['Privacidad','/app/privacidad',FiShield]] },
]
function StudentSidebar({ pathname, isOpen, onClose, identity = 'Mi cuenta' }) {
  return <aside id="student-sidebar" className={`nx-student-sidebar ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Navegación estudiantil">
    <div className="nx-sidebar-brand"><BrandMark href="/app" /><button className="nx-sidebar-close" onClick={onClose} aria-label="Cerrar menú" type="button"><FiX/></button></div>
    <div className="nx-sidebar-identity"><small>MI ESPACIO ESTUDIANTIL</small><strong>{identity}</strong></div>
    <nav className="nx-sidebar-nav">{groups.map(group=><section key={group.label}><h2>{group.label}</h2><ul>{group.items.map(([label, href, Icon])=><li key={href}><a className={pathname===href?'nx-active':''} href={href} onClick={onClose} aria-current={pathname===href?'page':undefined}><Icon/><span>{label}</span></a></li>)}</ul></section>)}</nav>
    <div className="nx-sidebar-foot"><button type="button" onClick={()=>{clearAccessToken();window.location.assign('/login')}}><FiLogOut/> Cerrar sesión</button><small>© NEXO U · Tu futuro empieza aquí.</small></div>
  </aside>
}
export default StudentSidebar
