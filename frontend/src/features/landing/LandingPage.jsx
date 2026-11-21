import HowItWorks from './components/HowItWorks.jsx'
import OpportunityDemo from './components/OpportunityDemo.jsx'
import PrivacySection from './components/PrivacySection.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import PublicNavbar from '../navigation/components/PublicNavbar.jsx'
import './styles/landing.css'

function LandingPage() {
  return (
    <>
      <PublicNavbar />
      <main id="inicio">
        <section className="hero-section">
          <div className="hero-section__inner">
            <div className="hero-copy">
              <p className="eyebrow"><span /> TU SIGUIENTE PASO EMPIEZA AQUÍ </p>
              <h1>Encuentra oportunidades hechas <em>para ti.</em></h1>
              <p className="hero-copy__description">Nexo U conecta tus credenciales con becas y pasantías, y te muestra qué te falta para postular.</p>
              <div className="hero-actions">
                <a className="button button--primary" href="#demo">Explorar la demo <span aria-hidden="true">→</span></a>
                <a className="button button--text" href="#como-funciona">Conoce cómo funciona <span aria-hidden="true">↓</span></a>
              </div>
              <div className="hero-proof"><span className="hero-proof__icon" aria-hidden="true">✓</span><span>Tu perfil, tus credenciales, tus próximas oportunidades.</span></div>
            </div>
            <div className="hero-visual">
              <div className="visual-orbit visual-orbit--one" />
              <div className="visual-orbit visual-orbit--two" />
              <OpportunityDemo />
              <div className="floating-note"><span className="floating-note__icon" aria-hidden="true">✳</span><span><strong>Hay una ruta</strong><small>para cada requisito</small></span></div>
            </div>
          </div>
          <div className="hero-section__foot"><span>OPORTUNIDADES CONECTADAS A TU PERFIL</span><span aria-hidden="true">↓</span></div>
        </section>
        <HowItWorks />
        <PrivacySection />
      </main>
      <SiteFooter />
    </>
  )
}

export default LandingPage
