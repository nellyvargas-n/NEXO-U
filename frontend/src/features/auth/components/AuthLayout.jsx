import BrandMark from '../../../shared/components/BrandMark.jsx'
import { FiAward, FiBriefcase, FiBookOpen, FiArrowLeft } from 'react-icons/fi'
/** Login/registro coherente con el diseño elegido, sin datos inventados. */
function AuthLayout({ pageType, eyebrow, switchText, switchLabel, switchHref, children }) {
  const isRegister = pageType === 'register'
  const titles={register:'Crea tu cuenta',login:'Inicia sesión',reset:'Restablece tu contraseña',recover:'Recupera el acceso'}
  const descriptions={register:'Encuentra oportunidades que se ajustan a tu perfil.',login:'Accede a tus oportunidades, cursos y credenciales.',reset:'Escribe tu nueva contraseña.',recover:'Te enviaremos un enlace seguro si existe la cuenta.'}
  return (
    <main className="nex-auth-shell">
      <div className="nex-auth-orbit nex-auth-orbit-one" aria-hidden="true" />
      <div className="nex-auth-orbit nex-auth-orbit-two" aria-hidden="true" />
      <div className="nex-auth-frame">
        <div className="nex-auth-topline"><BrandMark inverse /><a href="/explorar" className="nex-auth-back"><FiArrowLeft /> Ver oportunidades</a></div>
        <div className="nex-auth-columns">
          <section className="nex-auth-story" aria-label="Acerca de NEXO U">
            <span className="nex-auth-eyebrow">BECAS · PASANTÍAS · CURSOS</span>
            <h2>Conecta tu talento con nuevas <span>oportunidades.</span></h2>
            <p>Una sola plataforma para organizar tus credenciales y descubrir oportunidades con criterios claros.</p>
            <img className="nex-auth-art" src="/assets/login-technology.webp" alt="Ilustración tecnológica con una computadora, nube digital y gráficos" />
            <div className="nex-auth-benefits">
              <span><FiAward /> Becas</span><span><FiBriefcase /> Pasantías</span><span><FiBookOpen /> Cursos</span>
            </div>
          </section>
          <section className="nex-auth-card-wrap">
            <div className="nex-auth-card">
              <div className="nex-auth-card-brand"><BrandMark href="/"/><small>PLATAFORMA DE OPORTUNIDADES</small></div>
              <div className="nex-auth-card-heading"><span>{eyebrow}</span><h1>{titles[pageType] || titles.login}</h1><p>{descriptions[pageType] || descriptions.login}</p></div>
              {children}
              <div className="nex-auth-switch">{switchText} <a href={switchHref}>{switchLabel}</a></div>
              <p className="nex-auth-footer">Tu información personal permanece protegida.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
export default AuthLayout
