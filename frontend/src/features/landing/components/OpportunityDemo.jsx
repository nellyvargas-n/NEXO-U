import { useState } from 'react'
import { demoOpportunity } from '../data/demoOpportunity.js'
import { landingStyles as styles } from '../landingStyles.js'

function OpportunityDemo() {
  const [verified, setVerified] = useState(false)
  const completedCount = demoOpportunity.match + Number(verified)

  return (
    <div className={styles.demoShell} id="demo">
      <div className={styles.demoTopline}>
        <span className={styles.demoWindowDots} aria-hidden="true"><i className="size-[5px] rounded-full bg-[#e5b39d]" /><i className="size-[5px] rounded-full bg-[#dfd68d]" /><i className={styles.demoDot} /></span>
        <span>Vista de oportunidades</span>
        <span className={styles.demoLabel}><span className={styles.demoLabelDot} /> DEMO</span>
      </div>

      <div className={styles.opportunityCard}>
        <div className={styles.opportunityEyebrow}>
          <span className={styles.opportunityIcon} aria-hidden="true">↗</span>
          <span>{demoOpportunity.category}</span>
        </div>
        <div className={styles.opportunityTitleRow}>
          <div>
            <p className={styles.overline}>CONVOCATORIA DE EJEMPLO</p>
            <h2 className={styles.opportunityTitle}>{demoOpportunity.title}</h2>
          </div>
          <span className={styles.deadline}><span className="text-xs" aria-hidden="true">◷</span> Cierra {demoOpportunity.deadline}</span>
        </div>

        <div className={styles.matchSummary}>
          <div className={styles.matchCopy}>
            <span className={styles.matchNumber}>{completedCount}<small className={styles.matchDenominator}>/{demoOpportunity.totalRequirements}</small></span>
            <span className={styles.matchText}>requisitos cumplidos</span>
          </div>
          <span className={`${styles.matchBadge} ${verified ? styles.matchBadgeComplete : ''}`}>
            {verified ? 'Listo para postular' : 'Buen match'}
          </span>
          <div className={styles.matchBar} aria-label={`${completedCount} de ${demoOpportunity.totalRequirements} requisitos cumplidos`}>
            <span className={`${styles.matchBarFill} ${verified ? 'w-full' : 'w-4/5'}`} />
          </div>
        </div>

        <div className={styles.requirements}>
          <p className={styles.sectionLabel}>LO QUE PIDE ESTA OPORTUNIDAD</p>
          {demoOpportunity.requirements.map((requirement) => {
            const met = requirement.met || (verified && !requirement.met)
            return (
              <div className={styles.requirement} key={requirement.label}>
                <span className={`${styles.requirementCheck} ${met ? styles.requirementMet : styles.requirementMissing}`} aria-hidden="true">{met ? '✓' : '＋'}</span>
                <span className={met ? '' : styles.requirementMissingText}>{requirement.label}</span>
                {!met && <span className={styles.requirementTag}>Te falta</span>}
                {met && !requirement.met && <span className={`${styles.requirementTag} ${styles.requirementVerified}`}>Verificada</span>}
              </div>
            )
          })}
        </div>

        {!verified ? (
          <div className={styles.courseSuggestion}>
            <span className={styles.courseIcon} aria-hidden="true">↗</span>
            <div className={styles.courseCopy}>
              <span className={styles.courseEyebrow}>UN SIGUIENTE PASO POSIBLE</span>
              <strong className={styles.courseTitle}>{demoOpportunity.suggestedCourse}</strong>
              <small className={styles.courseDescription}>{demoOpportunity.courseProvider} · termina antes del cierre</small>
            </div>
            <span className={styles.courseArrow} aria-hidden="true">→</span>
          </div>
        ) : (
          <div className={styles.successNote} role="status">
            <span className={styles.successIcon} aria-hidden="true">✓</span> Credencial confirmada en esta demo. Ya cumples los 5 requisitos.
          </div>
        )}

        <button
          className={`${styles.demoButton} ${verified ? styles.demoButtonDone : ''}`}
          type="button"
          onClick={() => setVerified((current) => !current)}
        >
          {verified ? 'Reiniciar demostración' : 'Simular validación del emisor'}
          <span className="text-sm" aria-hidden="true">{verified ? '↺' : '→'}</span>
        </button>
        <p className={styles.demoDisclaimer}>Perfil, convocatoria y validación de ejemplo para la demo.</p>
      </div>
    </div>
  )
}

export default OpportunityDemo
