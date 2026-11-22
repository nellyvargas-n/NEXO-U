import { FiHome, FiSearch, FiAward, FiBriefcase, FiBookOpen, FiLayers, FiBookmark, FiUser, FiSettings, FiShield, FiLogOut, FiX, FiCreditCard, FiBell } from 'react-icons/fi'
import BrandMark from '../../shared/components/BrandMark.jsx'
import { clearAccessToken } from '../../shared/api/session.ts'
import { navigate } from '../../shared/navigation/navigation.js'

const groups = [
  { label:'Explora', items:[['Resumen','/app',FiHome],['Oportunidades','/app/oportunidades',FiSearch]] },
  { label:'Convocatorias', items:[['Becas','/app/oportunidades/becas',FiAward],['Pasantías','/app/oportunidades/pasantias',FiBriefcase],['Guardados','/app/guardados',FiBookmark]] },
  { label:'Formación', items:[['Cursos','/app/cursos',FiBookOpen],['Rutas de aprendizaje','/app/rutas',FiLayers],['Habilidades y credenciales','/app/credenciales',FiAward]] },
  { label:'Mi cuenta', items:[['Perfil académico','/app/perfil',FiUser],['Billetera','/app/billetera',FiCreditCard],['Notificaciones','/app/notificaciones',FiBell],['Privacidad','/app/privacidad',FiShield],['Configuración','/app/configuracion',FiSettings]] },
]
function StudentSidebar({ pathname, isOpen, onClose, identity = 'Mi cuenta' }) {
  return <aside id="student-sidebar" className={`nx-student-sidebar${isOpen ? ' is-open' : ''}`} aria-label="Navegación estudiantil">
    <div className="nx-sidebar-brand"><BrandMark href="/app" /><button className="nx-sidebar-close" onClick={onClose} aria-label="Cerrar menú" type="button"><FiX/></button></div>
    <div className="nx-sidebar-identity"><small>MI ESPACIO ESTUDIANTIL</small><strong>{identity}</strong></div>
    <nav className="nx-sidebar-nav">{groups.map(group=><section key={group.label}><h2>{group.label}</h2><ul>{group.items.map(([label, href, Icon])=>{const active=pathname===href||(href!=='/app'&&pathname.startsWith(`${href}/`));return <li key={href}><a className={active?'nx-active':''} href={href} onClick={onClose} aria-current={active?'page':undefined}><Icon/><span>{label}</span></a></li>})}</ul></section>)}</nav>
    <div className="nx-sidebar-foot"><button type="button" onClick={()=>{clearAccessToken();navigate('/login',{replace:true})}}><FiLogOut/> Cerrar sesión</button></div>
  </aside>
}
export default StudentSidebar
