import { landingStyles as styles } from '../landingStyles.js'

function PrivacySection() {
  return (
    <section className={styles.privacy} id="privacidad">
      <div className={styles.privacyMark} aria-hidden="true">
        <svg className="size-10 max-[700px]:size-[30px]" viewBox="0 0 52 52" fill="none"><path d="M26 5 43 12v12c0 11-7.2 18.5-17 23C16.2 42.5 9 35 9 24V12l17-7Z" stroke="currentColor" strokeWidth="2.5" /><path d="m18.5 26 5 5 10.5-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div className={styles.privacyCopy}>
        <p className={styles.eyebrow}><span className={styles.eyebrowDot} /> TU INFORMACIÓN, BAJO TU CONTROL</p>
        <h2 className={styles.privacyTitle}>El apoyo financiero también puede ser privado.</h2>
        <p className={styles.privacyDescription}>Registra ingresos y gastos solo si te sirve. Si activas la priorización de apoyos, Nexo U puede considerar una señal de necesidad sin mostrar tus montos personales a las organizaciones.</p>
      </div>
      <div className={styles.privacyNote}>
        <span className={styles.privacyNoteIcon} aria-hidden="true">⌁</span>
        <p className={styles.privacyNoteText}><strong className={styles.privacyNoteStrong}>Opcional por diseño</strong><br />Tus finanzas no son visibles para quienes publican oportunidades.</p>
      </div>
    </section>
  )
}

export default PrivacySection
