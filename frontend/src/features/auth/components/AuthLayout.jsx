import BrandMark from '../../../shared/components/BrandMark.jsx'
import './auth.css'

function AuthLayout({
  pageType,
  eyebrow,
  title,
  description,
  switchText,
  switchLabel,
  switchHref,
  children,
}) {
  return (
    <div className={`auth-page auth-page--${pageType}`}>
      <aside className="auth-story" aria-label="Acerca de Nexo U">
        <div className="auth-story__brand">
          <BrandMark href="/" />
        </div>

        <div className="auth-story__copy">
          <p className="auth-eyebrow"><span /> TU RUTA, A TU RITMO</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <div className="auth-showcase" aria-label="Vista ilustrativa de Nexo U">
          <div className="auth-showcase__glow" />
          <div className="auth-showcase__profile">
            <span className="auth-showcase__label">BILLETERA ESTUDIANTIL</span>
            <strong>Lo que sabes<br />también cuenta.</strong>
            <div className="auth-showcase__chips">
              <span>Habilidades</span><span>Cursos</span><span>Credenciales</span>
            </div>
          </div>
          <div className="auth-showcase__opportunity">
            <span className="auth-showcase__opportunity-icon" aria-hidden="true">↗</span>
            <span><small>OPORTUNIDADES</small><strong>Un siguiente paso claro</strong></span>
          </div>
          <span className="auth-showcase__caption">Vista ilustrativa</span>
        </div>

        <p className="auth-story__footer">Credenciales, oportunidades y apoyo para tu camino.</p>
      </aside>

      <main className="auth-main">
        <div className="auth-mobile-brand"><BrandMark href="/" /></div>
        <section className="auth-content" aria-labelledby="auth-form-title">
          <div className="auth-switch">
            <span>{switchText}</span>
            <a href={switchHref}>{switchLabel}</a>
          </div>
          <div className="auth-form-heading">
            <p className="auth-form-heading__eyebrow">{eyebrow}</p>
            <h2 id="auth-form-title">{pageType === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h2>
            <p>{pageType === 'login' ? 'Ingresa tus datos para continuar.' : 'Un perfil para tus próximos pasos.'}</p>
          </div>
          {children}
          <p className="auth-privacy-note"><span aria-hidden="true">⌁</span> Tu información es tuya. Tú decides qué compartir.</p>
        </section>
        <footer className="auth-main__footer">© Nexo U · Tu camino, tus oportunidades.</footer>
      </main>
    </div>
  )
}

export default AuthLayout
