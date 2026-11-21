import HowItWorks from './components/HowItWorks.jsx'
import OpportunityDemo from './components/OpportunityDemo.jsx'
import PrivacySection from './components/PrivacySection.jsx'
import SiteFooter from './components/SiteFooter.jsx'
import PublicNavbar from '../navigation/components/PublicNavbar.jsx'
import { landingStyles as styles } from './landingStyles.js'

function LandingPage() {
  return (
    <>
      <PublicNavbar />
      <main id="inicio">
        <section className={styles.hero}>
          <div className={styles.heroOrbit} />
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}><span className={styles.eyebrowDot} /> TU SIGUIENTE PASO EMPIEZA AQUÍ</p>
              <h1 className={styles.heroTitle}>Encuentra oportunidades hechas <em className={styles.heroAccent}>para ti.</em></h1>
              <p className={styles.heroDescription}>Nexo U conecta tus credenciales con becas y pasantías, y te muestra qué te falta para postular.</p>
              <div className={styles.actions}>
                <a className={`${styles.buttonBase} ${styles.buttonPrimary}`} href="#demo">Explorar la demo <span className="text-[17px]" aria-hidden="true">→</span></a>
                <a className={`${styles.buttonBase} ${styles.buttonText}`} href="#como-funciona">Conoce cómo funciona <span aria-hidden="true">↓</span></a>
              </div>
              <div className={styles.heroProof}><span className={styles.proofIcon} aria-hidden="true">✓</span><span>Tu perfil, tus credenciales, tus próximas oportunidades.</span></div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.visualOrbitOne} />
              <div className={styles.visualOrbitTwo} />
              <OpportunityDemo />
              <div className={styles.floatingNote}><span className={styles.floatingIcon} aria-hidden="true">✳</span><span className={styles.floatingCopy}><strong className={styles.floatingTitle}>Hay una ruta</strong><small className={styles.floatingDescription}>para cada requisito</small></span></div>
            </div>
          </div>
          <div className={styles.heroFoot}><span>OPORTUNIDADES CONECTADAS A TU PERFIL</span><span className="text-[13px] text-[#73867b]" aria-hidden="true">↓</span></div>
        </section>
        <HowItWorks />
        <PrivacySection />
      </main>
      <SiteFooter />
    </>
  )
}

export default LandingPage
