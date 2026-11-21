import { useState } from 'react'
import { demoOpportunity } from '../data/demoOpportunity.js'

function OpportunityDemo() {
  const [verified, setVerified] = useState(false)
  const completedCount = demoOpportunity.match + Number(verified)
  const progress = (completedCount / demoOpportunity.totalRequirements) * 100

  return (
    <div className="demo-shell" id="demo">
      <div className="demo-shell__topline">
        <span className="demo-shell__window-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>Vista de oportunidades</span>
        <span className="demo-label"><span /> DEMO</span>
      </div>

      <div className="opportunity-card">
        <div className="opportunity-card__eyebrow">
          <span className="opportunity-card__icon" aria-hidden="true">↗</span>
          <span>{demoOpportunity.category}</span>
        </div>
        <div className="opportunity-card__title-row">
          <div>
            <p className="overline">CONVOCATORIA DE EJEMPLO</p>
            <h2>{demoOpportunity.title}</h2>
          </div>
          <span className="deadline"><span aria-hidden="true">◷</span> Cierra {demoOpportunity.deadline}</span>
        </div>

        <div className="match-summary">
          <div className="match-summary__copy">
            <span className="match-summary__number">{completedCount}<small>/{demoOpportunity.totalRequirements}</small></span>
            <span className="match-summary__label">requisitos cumplidos</span>
          </div>
          <span className={`match-badge${verified ? ' match-badge--complete' : ''}`}>
            {verified ? 'Listo para postular' : 'Buen match'}
          </span>
          <div className="match-bar" aria-label={`${completedCount} de ${demoOpportunity.totalRequirements} requisitos cumplidos`}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="requirements">
          <p className="section-label">LO QUE PIDE ESTA OPORTUNIDAD</p>
          {demoOpportunity.requirements.map((requirement) => {
            const met = requirement.met || (verified && !requirement.met)
            return (
              <div className={`requirement${met ? ' requirement--met' : ' requirement--missing'}`} key={requirement.label}>
                <span className="requirement__check" aria-hidden="true">{met ? '✓' : '＋'}</span>
                <span>{requirement.label}</span>
                {!met && <span className="requirement__tag">Te falta</span>}
                {met && !requirement.met && <span className="requirement__tag requirement__tag--verified">Verificada</span>}
              </div>
            )
          })}
        </div>

        {!verified ? (
          <div className="course-suggestion">
            <span className="course-suggestion__icon" aria-hidden="true">↗</span>
            <div className="course-suggestion__copy">
              <span>UN SIGUIENTE PASO POSIBLE</span>
              <strong>{demoOpportunity.suggestedCourse}</strong>
              <small>{demoOpportunity.courseProvider} · termina antes del cierre</small>
            </div>
            <span className="course-suggestion__arrow" aria-hidden="true">→</span>
          </div>
        ) : (
          <div className="success-note" role="status">
            <span aria-hidden="true">✓</span> Credencial confirmada en esta demo. Ya cumples los 5 requisitos.
          </div>
        )}

        <button
          className={`demo-button${verified ? ' demo-button--done' : ''}`}
          type="button"
          onClick={() => setVerified((current) => !current)}
        >
          {verified ? 'Reiniciar demostración' : 'Simular validación del emisor'}
          <span aria-hidden="true">{verified ? '↺' : '→'}</span>
        </button>
        <p className="demo-disclaimer">Perfil, convocatoria y validación de ejemplo para la demo.</p>
      </div>
    </div>
  )
}

export default OpportunityDemo
