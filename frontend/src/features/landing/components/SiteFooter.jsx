import BrandMark from '../../../shared/components/BrandMark.jsx'
import { landingStyles as styles } from '../landingStyles.js'

function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <BrandMark size="small" />
        <p className={styles.footerCopy}>Credenciales, oportunidades y apoyo financiero para tu camino universitario.</p>
        <span className={styles.footerAside}>Un proyecto en construcción para estudiantes.</span>
      </div>
    </footer>
  )
}

export default SiteFooter
