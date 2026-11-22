import BrandMark from '../../../shared/components/BrandMark.jsx'
import { FiAward, FiBriefcase, FiBookOpen, FiArrowLeft } from 'react-icons/fi'
function AuthLayout({ pageType, eyebrow, switchText, switchLabel, switchHref, children }) {
  const titles={register:'Crea tu cuenta',login:'Inicia sesión',reset:'Restablece tu contraseña',recover:'Recupera el acceso'}
  const descriptions={register:'Becas, pasantías y cursos según tu perfil.',login:'Continúa donde lo dejaste.',reset:'Elige una nueva contraseña.',recover:'Recibe un enlace para recuperar el acceso.'}
  return (
    <main className="nex-auth-shell">
      <div className="nex-auth-orbit nex-auth-orbit-one" aria-hidden="true" />
      <div className="nex-auth-orbit nex-auth-orbit-two" aria-hidden="true" />
      <div className="nex-auth-frame">
        <div className="nex-auth-topline"><BrandMark inverse /><a href="/explorar" className="nex-auth-back"><FiArrowLeft /> Ver oportunidades</a></div>
        <div className="nex-auth-columns">
          <section className="nex-auth-story" aria-label="Acerca de NEXO U">
            <span className="nex-auth-eyebrow">BECAS · PASANTÍAS · CURSOS</span>
            <h2>Tu perfil abre nuevas <span>oportunidades.</span></h2>
            <p>Organiza tus credenciales y encuentra tu siguiente paso.</p>
            <img className="nex-auth-art" src="/assets/login-technology.webp" alt="Ilustración tecnológica con una computadora, nube digital y gráficos" />
            <div className="nex-auth-benefits">
              <span><FiAward /> Becas</span><span><FiBriefcase /> Pasantías</span><span><FiBookOpen /> Cursos</span>
            </div>
          </section>
          <section className="nex-auth-card-wrap">
            <div className="nex-auth-card">
              <div className="nex-auth-card-heading"><span>{eyebrow}</span><h1>{titles[pageType] || titles.login}</h1><p>{descriptions[pageType] || descriptions.login}</p></div>
              {children}
              <div className="nex-auth-switch">{switchText} <a href={switchHref}>{switchLabel}</a></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
export default AuthLayout
