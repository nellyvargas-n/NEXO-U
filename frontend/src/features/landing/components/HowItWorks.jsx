import { landingStyles as styles } from '../landingStyles.js'

const steps = [
  {
    number: '01',
    title: 'Arma tu perfil',
    body: 'Reúne tus habilidades, cursos y credenciales en una sola billetera estudiantil.',
    icon: '◎',
  },
  {
    number: '02',
    title: 'Encuentra tu oportunidad',
    body: 'Compara tu perfil con becas y pasantías para saber qué requisitos ya cumples.',
    icon: '⌕',
  },
  {
    number: '03',
    title: 'Da el siguiente paso',
    body: 'Descubre qué te falta y una ruta posible para completar el requisito a tiempo.',
    icon: '↗',
  },
]

function HowItWorks() {
  return (
    <section className={styles.section} id="como-funciona">
      <div className={styles.sectionHeading}>
        <p className={`${styles.eyebrow} ${styles.sectionEyebrow}`}><span className={styles.eyebrowDot} /> SIMPLE DESDE EL PRIMER DÍA</p>
        <h2 className={styles.sectionTitle}>Tu perfil también puede abrir puertas.</h2>
        <p className={styles.sectionDescription}>Una ruta clara entre lo que ya sabes y la oportunidad que estás buscando.</p>
      </div>
      <div className={styles.stepsGrid}>
        {steps.map((step) => (
          <article className={styles.stepCard} key={step.number}>
            <div className={styles.stepTop}><span className={styles.stepIcon} aria-hidden="true">{step.icon}</span><span>{step.number}</span></div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
